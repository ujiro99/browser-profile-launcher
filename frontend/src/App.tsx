import { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import type { RangeTuple } from "fuse.js";
import type { profile } from "../wailsjs/go/models";
import { List, Run } from "../wailsjs/go/main/App";
import { Item } from "./Item";
import { Quit, Environment } from "../wailsjs/runtime/runtime";
import "./App.css";

type ListItem = {
  profile: profile.Profile;
  indices?: readonly RangeTuple[];
};

const FocusDefault = 0;

function App() {
  const [list, setList] = useState<ListItem[]>();
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(FocusDefault);
  const [isDev, setIsDev] = useState(false);
  const [composing, setComposing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    List().then((profiles) => {
      console.table(profiles);
      setList(profiles.map((profile) => ({ profile })));
    });
    Environment().then((env) => {
      setIsDev(env.buildType === "dev");
    });
  }, []);

  let filtered = list;
  if (list && query.length > 0) {
    const fuse = new Fuse<ListItem>(list, {
      keys: ["profile.shortcut_name"],
      includeMatches: true,
    });
    filtered = fuse.search(query).map((res) => {
      const item = { profile: res.item.profile } as ListItem;
      if (res.matches) {
        const match = res.matches.find(
          (m) => m.key === "profile.shortcut_name",
        );
        if (match) {
          item.indices = match.indices;
        }
      }
      return item;
    });
    console.debug(filtered);
  }

  const updateQuery = (e: any) => {
    setQuery(e.target.value);
    setFocus(FocusDefault);
  };

  const onClick = (browser: string, directory: string) => {
    Run(browser, directory).then((err) => {
      setErrorMsg(err);
      if (!err && !isDev) {
        // 起動成功したら終了する。これはランチャーとしての定め
        // 開発モードの場合は再起動が面倒なため、終了しない
        Quit();
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
      if (focus < (filtered?.length || 0) - 1) {
        setFocus((pre) => pre + 1);
        e.preventDefault();
      }
    }
    if (key === "Enter") {
      if (filtered) {
        const item = filtered[focus];
        if (item) {
          const { browser, directory } = item.profile;
          console.debug("Enter", browser, directory);
          onClick(browser, directory);
          e.preventDefault();
        }
      }
    }
  };

  const focusClass = (i: number) => {
    return i === focus ? "focused" : "";
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
          placeholder="絞り込み検索..."
        />
      </div>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <ul className="profileList">
        {filtered?.map((item, i) => (
          <li
            key={item.profile.browser + item.profile.directory}
            className={focusClass(i)}
          >
            <Item {...item} onClick={onClick} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
