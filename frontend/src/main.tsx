import React from "react";
import { createRoot } from "react-dom/client";
import "@/services/i18n";
import {
  EventsOn,
  WindowGetSize,
  WindowSetSize,
} from "../wailsjs/runtime/runtime";
import { List } from "../wailsjs/go/main/App";
import type { profile } from "../wailsjs/go/models";
import App from "./App";
import { Config } from "@/services/config";
import "./global.css";

const config = Config.getInstance();
config.addLoadedListener((conf) => {
  const size = conf.windowSize;
  WindowSetSize(size[0], size[1]);
});

const container = document.getElementById("root");
const root = createRoot(container!);

function render(profiles: profile.Profile[]) {
  root.render(
    <React.StrictMode>
      <App profiles={profiles} />
    </React.StrictMode>,
  );
}

window.addEventListener("resize", async () => {
  const size = await WindowGetSize();
  const conf = config.get();
  conf.windowSize = [size.w, size.h];
  config.set(conf);
});

async function main() {
  render(await List());

  EventsOn("profileChanged", async (val) => {
    console.debug("Profile changed", val);
    render(val);
  });
}

main();
