import { useState, useEffect, useRef } from "react";
import Fuse, { RangeTuple } from "fuse.js";
import "./App.css";
import { profile } from "../wailsjs/go/models";
import { List, Run } from "../wailsjs/go/main/App";
import { Item } from "./Item";

type ListItem = {
  profile: profile.Profile;
  indices?: readonly RangeTuple[];
};

function App() {
  const [list, setList] = useState<ListItem[]>();
  const [query, setQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    List().then((profiles) => {
      console.table(profiles);
      setList(profiles.map((profile) => ({ profile })));
    });
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const updateQuery = (e: any) => setQuery(e.target.value);

  const onClick = (browser: string, directory: string) => {
    Run(browser, directory).then((err) => {
      setErrorMsg(err);
      if (!err) {
        // window.runtime.Quit();
      }
    });
  };

  let filtered = list;
  if (list && query.length > 0) {
    const fuse = new Fuse(list, {
      keys: ["profile.shortcut_name", "profile.browser"],
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

  return (
    <div id="App">
      <div id="input" className="input-box">
        <input
          type="text"
          id="name"
          className="input"
          onChange={updateQuery}
          name="query"
          ref={inputRef}
          placeholder="絞り込み検索..."
        />
      </div>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <ul className="profileList">
        {filtered?.map((item) => (
          <li key={item.profile.browser + item.profile.directory}>
            <Item {...item} onClick={onClick} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
