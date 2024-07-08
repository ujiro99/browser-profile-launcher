import React from "react";
import { createRoot } from "react-dom/client";
import "@/services/i18n";
import {
  EventsOn,
  WindowGetSize,
  WindowSetSize,
} from "../wailsjs/runtime/runtime";

import "./global.css";
import { List } from "../wailsjs/go/main/App";
import type { profile } from "../wailsjs/go/models";
import App from "./App";
import { Config } from "@/services/config";
import type { ConfigType } from "@/services/config";
import { ProfilesContext } from "@/contexts";

const config = Config.getInstance();

const container = document.getElementById("root");
const root = createRoot(container!);

function render(profiles: profile.Profile[], config: ConfigType) {
  // for Mac OS
  for (const p of profiles) {
    if (p.shortcut_name === "") {
      p.shortcut_name = p.name;
    }
  }

  root.render(
    <React.StrictMode>
      <ProfilesContext.Provider value={profiles}>
        <App defaultConfig={config} />
      </ProfilesContext.Provider>
    </React.StrictMode>,
  );
}

window.addEventListener("resize", async () => {
  const size = await WindowGetSize();
  const conf = config.get();
  conf.windowSize = [size.w, size.h];
  config.set(conf);
});

function main() {
  config.addLoadedListener(async (conf) => {
    const size = conf.windowSize;
    if (size) {
      WindowSetSize(size[0], size[1]);
    }
    render(await List(), conf);
  });

  EventsOn("profileChanged", async (val) => {
    console.debug("Profile changed", val);
    render(val, config.get());
  });
}

main();
