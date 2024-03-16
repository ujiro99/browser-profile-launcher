import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import type { profile } from "../wailsjs/go/models";
import { List, Run } from "../wailsjs/go/main/App";
import { Quit } from "../wailsjs/runtime/runtime";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileList } from "@/components/ProfileList";
import { useHistory } from "./hooks/useHistory";
import { useEnv } from "./hooks/useEnv";
import * as utils from "./lib/utils";
import type { ListItem } from "./lib/utils";

import "./App.css";

const FocusDefault = 0;

interface TabList {
  [key: string]: ListItem[];
}

interface TabRefs {
  [key: string]: React.RefObject<HTMLButtonElement>;
}

function App() {
  const tabs = ["all", "history"];
  const [list, setList] = useState<ListItem[]>([]);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(FocusDefault);
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [composing, setComposing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, addHistory] = useHistory();
  const { isDev } = useEnv();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lists = {
    all: utils.filter(list, query),
    history: utils.filter(utils.mapListItem(list, history), query),
  } as TabList;

  useEffect(() => {
    inputRef.current?.focus();
    List().then((profiles) => {
      console.table(profiles);
      setList(profiles.map((profile) => ({ profile })));
    });
  }, []);

  useEffect(() => {
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

  const refsByTabs = useMemo(() => {
    return tabs.reduce((acc, cur) => {
      acc[cur] = React.createRef<HTMLButtonElement>();
      return acc;
    }, {} as TabRefs);
  }, []);

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
          placeholder="絞り込み検索..."
        />
      </div>
      {errorMsg && <p className="error">{errorMsg}</p>}

      <Tabs
        defaultValue={tabs[0]}
        className="w-full px-2 result-tabs"
        onValueChange={setCurrentTab}
      >
        <TabsList className="p-0 h-[auto] relative bg-transparent">
          <TabsTrigger
            className="py-1 px-2 data-[state=active]:shadow-none"
            value="history"
            ref={refsByTabs.history}
          >
            History
          </TabsTrigger>
          <TabsTrigger
            className="py-1 px-3 data-[state=active]:shadow-none"
            value="all"
            ref={refsByTabs.all}
          >
            All
          </TabsTrigger>
          <div className="tab-indicator" ref={indicatorRef} />
        </TabsList>
        <TabsContent value="history" className="h-full mt-3">
          <ScrollArea type="auto" className="h-full">
            {lists.history && (
              <ProfileList
                list={lists.history}
                focusIdx={focus}
                onClick={onClick}
              />
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="all" className="h-full mt-3">
          <ScrollArea type="auto" className="h-full">
            {lists.all && (
              <ProfileList
                list={lists.all}
                focusIdx={focus}
                onClick={onClick}
              />
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
