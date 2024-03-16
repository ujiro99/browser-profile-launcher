import React from "react";
import { createRoot } from "react-dom/client";
import "@/services/i18n";
import App from "./App";
import "./global.css";

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
