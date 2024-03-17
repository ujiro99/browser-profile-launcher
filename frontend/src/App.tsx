import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import type { profile } from "../wailsjs/go/models";
import { List, Run } from "../wailsjs/go/main/App";
import { Quit } from "../wailsjs/runtime/runtime";
import { useTranslation } from "react-i18next";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileList } from "@/components/ProfileList";
import { CollectionAdd } from "@/components/CollectionAdd";
import { CollectionDelete } from "@/components/CollectionDelete";
import { useHistory } from "./hooks/useHistory";
import { useCollection } from "@/hooks/useCollection";
import { useEnv } from "./hooks/useEnv";
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

function App() {
  const { collections, profileCollections } = useCollection();
  const tabs = [...DEFAULT_TABS, ...collections];
  const [list, setList] = useState<ListItem[]>([]);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(FocusDefault);
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [composing, setComposing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, addHistory] = useHistory();
  const { t } = useTranslation();
  const { isDev } = useEnv();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    List().then((profiles) => {
      console.table(profiles);
      setList(profiles.map((profile) => ({ profile })));
    });
  }, []);

  useEffect(() => {
    // タブインジケーターの計算
    const ref = indicatorRef.current;
    if (ref) {
      const tab = refsByTabs[currentTab];
      const pad = 4;
      if (tab.current) {
        ref.style.left = `${tab.current.offsetLeft + pad}px`;
        ref.style.width = `${tab.current.offsetWidth - pad * 2}px`;
      }
    }
  }, [currentTab]);

  // コレクション毎のProfileKeyを作成
  const keys = useMemo(() => {
    return collections.reduce(
      (acc, cur) => {
        const pcs = profileCollections.filter((p) =>
          p.collections.includes(cur),
        );
        acc[cur] = pcs.map((p) => p.key);
        return acc;
      },
      {} as { [key: string]: ProfileKey[] },
    );
  }, [collections, profileCollections]);

  const lists = useMemo(() => {
    // デフォルトのタブを追加
    const l = {
      all: utils.filter(list, query),
      history: utils.filter(utils.mapListItem(list, history), query),
    } as TabList;
    // コレクションのタブを追加
    for (const [k, v] of Object.entries(keys)) {
      l[k] = utils.filter(utils.mapListItem(list, v), query);
    }
    return l;
  }, [list, history, keys, query]);

  const refsByTabs = useMemo(() => {
    return tabs.reduce((acc, cur) => {
      acc[cur] = React.createRef<HTMLButtonElement>();
      return acc;
    }, {} as TabRefs);
  }, [tabs]);

  const updateQuery = (e: any) => {
    setQuery(e.target.value);
    setFocus(FocusDefault);
  };

  const onClick = (p: profile.Profile) => {
    Run(p.browser, p.directory).then((err) => {
      setErrorMsg(err);
      if (!err) {
        // 起動成功したら終了する。これはランチャーとしての定め
        // 開発モードの場合は再起動が面倒なため、終了しない
        if (!isDev) Quit();
        // 履歴に追加
        addHistory(utils.profileKey(p));
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (composing) {
      // IME入力中は何もしない
      return;
    }
    const key = e.code;
    if (key === "ArrowUp") {
      if (focus > FocusDefault) {
        setFocus((pre) => pre - 1);
        e.preventDefault();
      }
    }
    if (key === "ArrowDown") {
      const filtered = lists[currentTab];
      if (focus < (filtered?.length || 0) - 1) {
        setFocus((pre) => pre + 1);
        e.preventDefault();
      }
    }
    if (key === "Enter") {
      const filtered = lists[currentTab];
      if (filtered) {
        const item = filtered[focus];
        if (item) {
          const { browser, directory } = item.profile;
          console.debug("Enter", browser, directory);
          onClick(item.profile);
          e.preventDefault();
        }
      }
    }
  };

  return (
    <div id="App">
      <div id="input" className="input-box">
        <input
          type="text"
          name="query"
          className="input"
          onChange={updateQuery}
          onKeyDown={onKeyDown}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          ref={inputRef}
          placeholder={t("keywordSearch")}
        />
      </div>
      {errorMsg && <p className="error">{errorMsg}</p>}

      <Tabs
        defaultValue={tabs[0]}
        className="w-full px-2 result-tabs"
        onValueChange={setCurrentTab}
      >
        <TabsList className="p-0 h-[auto] relative bg-transparent">
          {tabs.map((tab) => (
            <TabsTrigger
              className="py-1 px-2 data-[state=active]:shadow-none"
              value={tab}
              ref={refsByTabs[tab]}
            >
              {t(tab)}
            </TabsTrigger>
          ))}
          <CollectionAdd />
          <div className="tab-indicator" ref={indicatorRef} />
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent value={tab} className="tab-content mt-3">
            <ScrollArea type="auto" className="h-full">
              {lists[tab] && (
                <ProfileList
                  list={lists[tab]}
                  focusIdx={focus}
                  onClick={onClick}
                />
              )}
              {!isDefaultTab(tab) && (
                <CollectionDelete className="tab-remove" collection={tab} />
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default App;
