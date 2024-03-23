import React from "react";
import { createRoot } from "react-dom/client";
import "@/services/i18n";
import { EventsOn } from "../wailsjs/runtime/runtime";
import { List } from "../wailsjs/go/main/App";
import type { profile } from "../wailsjs/go/models";
import App from "./App";
import "./global.css";

const container = document.getElementById("root");
const root = createRoot(container!);

function render(profiles: profile.Profile[]) {
  root.render(
    <React.StrictMode>
      <App profiles={profiles} />
    </React.StrictMode>,
  );
}

async function main() {
  render(await List());

  EventsOn("profileChanged", async (val) => {
    console.debug("Profile changed", val);
    render(val);
  });
}

main();
