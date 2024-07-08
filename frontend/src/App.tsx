import React from "react";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { Run } from "../wailsjs/go/main/App";
import { Quit, WindowMinimise } from "../wailsjs/runtime/runtime";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileList } from "@/components/ProfileList";
import { CollectionAdd } from "@/components/CollectionAdd";
import { CollectionEdit } from "@/components/CollectionEdit";
import { CollectionDelete } from "@/components/CollectionDelete";
import { Launching } from "@/components/Launching";
import { Input } from "@/components/Input";
import { Tips } from "@/components/Tips";
import { useHistory } from "@/hooks/useHistory";
import { useCollection } from "@/hooks/useCollection";
import { useConfig } from "@/hooks/useConfig";
import { useEnv } from "@/hooks/useEnv";
import { useProfile } from "@/hooks/useProfile";
import { ConfigKey, BehaviorAfterLaunch } from "@/services/config";
import type { Collection, ConfigType, ProfileDetail } from "@/services/config";
import { ProfilesContext } from "@/contexts";
import Clock from "@/assets/clock.svg?react";
import LibraryAdd from "@/assets/library_add.svg?react";
import * as utils from "./lib/utils";
import type { ListItem, ProfileKey } from "./lib/utils";

import "./App.css";

const FocusDefault = 0;

interface TabList {
  [key: string]: ListItem[];
}

interface TabRefs {
  [key: string]: React.RefObject<HTMLButtonElement>;
}

const DEFAULT_TABS = ["all", "history"];
function isDefaultTab(tab: string): boolean {
  return DEFAULT_TABS.includes(tab);
}

const TAB_PREFIX = "tab-";

type Props = { defaultConfig: ConfigType };

function App({ defaultConfig }: Props) {
  const profiles = useContext(ProfilesContext);
  const { collections, profileCollections, moveCollection } = useCollection();
  const { profileDetails } = useProfile();
  const tabs = [...DEFAULT_TABS, ...collections.map((c) => c.name)];
  const [config, setConfig] = useConfig();
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(FocusDefault);
  const [currentTab, _setCurrentTab] = useState(tabs[0]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragTab, setDragTab] = useState("");
  const [launching, setLaunching] = useState(false);

  const [history, addHistory] = useHistory();
  const { t } = useTranslation();
  const { isDev } = useEnv();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);

  // コレクション毎のProfileKeyを作成
  const keys = useMemo(() => {
    return collections.reduce(
      (acc, cur) => {
        const pcs = profileCollections.filter((p) =>
          p.collections.includes(cur.name),
        );
        acc[cur.name] = pcs.map((p) => p.key);
        return acc;
      },
      {} as { [key: string]: ProfileKey[] },
    );
  }, [collections, profileCollections]);

  // 表示されるリストを作成
  const list = useMemo(() => {
    return profiles
      .map((p) => {
        const detail = profileDetails.find(
          (d) => d.key === utils.profileKey(p),
        );
        return { profile: p, detail } as ListItem;
      })
      .sort((a, b) =>
        a.profile.shortcut_name.localeCompare(b.profile.shortcut_name),
      )
      .sort((a, b) => a.profile.browser.localeCompare(b.profile.browser));
  }, [profiles, profileDetails]);

  const lists = useMemo(() => {
    // デフォルトのタブを追加
    const l = {
      all: utils.filter(list, query),
      history: utils.filter(utils.mapListItem(list, history), query),
    } as TabList;
    // コレクションのタブを追加
    for (const [k, v] of Object.entries(keys)) {
      l[k] = utils.sort(utils.filter(utils.mapListItem(list, v), query));
    }
    return l;
  }, [list, history, keys, query]);

  const currentCollectionEmpty = useMemo(() => {
    const profiles = keys[currentTab];
    if (profiles) {
      return utils.mapListItem(list, profiles).length === 0;
    }
    return false;
  }, [currentTab, keys, list]);

  const refsByTabs = useMemo(() => {
    return tabs.reduce((acc, cur) => {
      acc[cur] = React.createRef<HTMLButtonElement>();
      return acc;
    }, {} as TabRefs);
  }, [tabs]);

  useEffect(() => {
    inputRef.current?.focus();
    // アクティブタブを復帰
    const lastTab = defaultConfig[ConfigKey.lastTab];
    if (lastTab) {
      _setCurrentTab(lastTab);
    }
  }, [defaultConfig]);

  useEffect(() => {
    // キーボード操作
    const keydown = (e: KeyboardEvent) => {
      // ダイアログが開いている場合は何もしない
      if (document.querySelector('[role="dialog"]')) {
        return;
      }
      const key = e.code;
      if (key === "ArrowUp") {
        if (focus > FocusDefault) {
          setFocus((pre) => pre - 1);
          e.preventDefault();
        }
      } else if (key === "ArrowDown") {
        const filtered = lists[currentTab];
        if (focus < (filtered?.length || 0) - 1) {
          setFocus((pre) => pre + 1);
          e.preventDefault();
        }
      } else if (key === "ArrowLeft" || (key === "Tab" && e.shiftKey)) {
        setPrevTab();
        e.preventDefault();
      } else if (key === "ArrowRight" || key === "Tab") {
        setNextTab();
        e.preventDefault();
      } else if (key === "Enter") {
        const filtered = lists[currentTab];
        if (filtered) {
          const item = filtered[focus];
          if (item) {
            const { browser, directory } = item.profile;
            console.debug("Enter", browser, directory);
            onClick(item.detail);
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [currentTab, focus, lists]);

  // タブ周りの処理
  useEffect(() => {
    const pad = 4;
    const tabRef = refsByTabs[currentTab];
    const tab = tabRef?.current;
    const indicator = indicatorRef.current;
    const list = tablistRef.current;

    if (indicator && tab && list) {
      // タブインジケーターの位置計算
      indicator.style.left = `${tab.offsetLeft + pad}px`;
      indicator.style.width = `${tab.offsetWidth - pad * 2}px`;

      // タブと連動したリストスクロール
      if (list.scrollLeft > tab.offsetLeft) {
        // 左にはみ出している場合
        // setTimeout後にスクロールすることで、スクロール位置が正しく取得できる
        setTimeout(() => {
          list.scrollLeft = tab.offsetLeft;
        }, 0);
      } else if (
        list.scrollLeft + list.offsetWidth <
        tab.offsetLeft + tab.offsetWidth
      ) {
        // 右にはみ出している場合
        setTimeout(() => {
          list.scrollLeft = tab.offsetLeft + tab.offsetWidth - list.offsetWidth;
        }, 0);
      }
    }
  }, [currentTab, refsByTabs]);

  const updateQuery = (e: any) => {
    setQuery(e.target.value);
    setFocus(FocusDefault);
  };

  const onClick = (d: ProfileDetail) => {
    let p = profiles.find((p) => utils.profileKey(p) === d.key);
    if (p == null) {
      console.error("Profile not found", d);
      return;
    }
    let options = utils.convLaunchOption(d.launchOptions);
    console.debug("Launch", p.browser, p.directory, options);
    setLaunching(true);
    Run(p.browser, p.directory, options).then((err) => {
      setLaunching(false);
      setErrorMsg(err);
      if (!err && p) {
        // 履歴に追加
        addHistory(utils.profileKey(p));

        const behavior = config[ConfigKey.behaviorAfterLaunch];
        if (behavior === BehaviorAfterLaunch.minimize) {
          !isDev && WindowMinimise();
        } else if (behavior === BehaviorAfterLaunch.close) {
          // 開発モードの場合は再起動が面倒なため、終了しない
          !isDev && Quit();
        }
      }
    });
  };

  const onDragStart = (e: React.DragEvent<HTMLElement>) => {
    let id = e.currentTarget.id;
    if (!id.startsWith(TAB_PREFIX)) return;
    id = id.slice(TAB_PREFIX.length);
    setDragTab(id);
    setIsDragging(true);
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragEnd = (e: React.DragEvent<HTMLElement>) => {
    setIsDragging(false);
  };

  const onDragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (e.currentTarget.id.startsWith(TAB_PREFIX)) {
      const src = t2c(dragTab);
      const dest = t2c(e.currentTarget.id.slice(TAB_PREFIX.length));
      if (src && dest) {
        moveCollection(src, dest);
      }
      setIsDragging(true);
    }
  };

  const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault(); // これがないとdropイベントが発火しない
  };

  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    if (e.currentTarget.id.startsWith(TAB_PREFIX)) {
      const src = t2c(dragTab);
      const dest = t2c(e.currentTarget.id.slice(TAB_PREFIX.length));
      if (src && dest) {
        moveCollection(src, dest);
      }
      setIsDragging(false);
    }
  };

  // 前のタブに移動
  const setPrevTab = useCallback(() => {
    let idx = tabs.findIndex((tab) => tab === currentTab);
    if (idx <= 0) {
      idx = tabs.length;
    }
    setCurrentTab(tabs[idx - 1]);
  }, [currentTab, tabs]);

  // 次のタブに移動
  const setNextTab = useCallback(() => {
    let idx = tabs.findIndex((tab) => tab === currentTab);
    idx = (idx + 1) % tabs.length;
    setCurrentTab(tabs[idx]);
  }, [currentTab, tabs]);

  // 削除したら、一つ前のタブに移動
  const onDeletedTab = (collection: Collection) => {
    if (collection.name === currentTab) {
      setPrevTab();
    }
  };

  // CurrentTabを更新してリストなども更新
  const onEdited = (after: Collection) => {
    _setCurrentTab(after.name);
  };

  // tabを移動したら、focusを長さに合わせる
  const setCurrentTab = useCallback(
    (tab: string) => {
      _setCurrentTab(tab);
      setFocus(Math.max(Math.min(focus, lists[tab]?.length - 1), 0));
      setConfig(tab, ConfigKey.lastTab);
    },
    [focus, lists, setConfig],
  );

  // tablist上での横スクロール
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (tablistRef.current) {
      tablistRef.current.scrollLeft += e.deltaY;
    }
  };

  const t2c = (tab: string): Collection => {
    return collections.find((c) => c.name === tab) as Collection;
  };

  const i = (tab: string) => {
    const c = t2c(tab);
    if (c != null) {
      return c.icon;
    }
    return null;
  };

  return (
    <div id="App">
      <Launching visible={launching} />
      <div id="input" className="input-box">
        <Input
          className="flex-1 h-full"
          onChange={updateQuery}
          placeholder={t("keywordSearch")}
          style={{ height: "100%" }}
        />
        <Tips />
      </div>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <Tabs
        defaultValue={tabs[0]}
        value={currentTab}
        className="w-full px-2 result-tabs"
        onValueChange={setCurrentTab}
      >
        <TabsList
          className={`p-0 h-[34px] w-full relative bg-transparent scroll-horizontal ${clsx(
            isDragging && "dragging",
          )}`}
          onWheel={onWheel}
          ref={tablistRef}
        >
          {tabs.map((tab) => (
            <>
              {isDefaultTab(tab) ? (
                <TabsTrigger
                  className="tab-button"
                  id={`${TAB_PREFIX}${tab}`}
                  value={tab}
                  key={tab}
                  ref={refsByTabs[tab]}
                >
                  {tab === "history" && <Clock className="tab-icon" />}
                  <span className="tab-button__name">{t(tab)}</span>
                </TabsTrigger>
              ) : (
                <TabsTrigger
                  className="tab-button"
                  id={`${TAB_PREFIX}${tab}`}
                  value={tab}
                  key={tab}
                  ref={refsByTabs[tab]}
                  draggable
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                >
                  {tab === "history" && <Clock className="tab-icon" />}
                  {i(tab) && <span className="tab-button__icon">{i(tab)}</span>}
                  <span className="tab-button__name">{tab}</span>
                </TabsTrigger>
              )}
              {tab === "history" && (
                <div className="tab-separator" key="$$separator" />
              )}
            </>
          ))}
          <CollectionAdd key="$$add" />
          <div className="tab-indicator" key="$$indicator" ref={indicatorRef} />
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent value={tab} key={tab} className="tab-content mt-2">
            <ScrollArea type="auto" className="h-full">
              {currentCollectionEmpty ? (
                <div className="profileList__empty">
                  👉 <LibraryAdd className="profileList__empty-icon" />
                  <p className="profileList__empty-desc">
                    {t("collections-add")}
                  </p>
                </div>
              ) : (
                lists[tab] && (
                  <ProfileList
                    list={lists[tab]}
                    focusIdx={focus}
                    onClick={onClick}
                  />
                )
              )}
              {!isDefaultTab(tab) && (
                <div className="buttons">
                  <CollectionEdit collection={t2c(tab)} onEdited={onEdited} />
                  <CollectionDelete
                    collection={t2c(tab)}
                    onDeleted={onDeletedTab}
                  />
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default App;
