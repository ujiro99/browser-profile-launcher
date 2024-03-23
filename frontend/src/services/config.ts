import { LoadConfig, SaveConfig } from "../../wailsjs/go/main/App";
import type { ProfileKey } from "../lib/utils";
import defaultConfig from "./defaultConfig.json";

export enum ConfigKey {
  history = "history",
  collections = "collections",
  profileCollections = "profileCollections",
  behaviorAfterLaunch = "behaviorAfterLaunch",
  language = "language",
  lastTab = "lastTab",
  windowSize = "windowSize",
}

export type ConfigType = {
  [ConfigKey.history]: ProfileKey[];
  [ConfigKey.collections]: Collection[];
  [ConfigKey.profileCollections]: ProfileCollections[];
  [ConfigKey.behaviorAfterLaunch]: BehaviorAfterLaunch;
  [ConfigKey.language]: string;
  [ConfigKey.lastTab]: string;
  [ConfigKey.windowSize]: [number, number];
};

export type Collection = string;

export type ProfileCollections = {
  key: ProfileKey;
  collections: Collection[];
};

export enum BehaviorAfterLaunch {
  none = "none",
  close = "close",
  minimize = "minimize",
}

type Listener = (config: ConfigType, area?: ConfigKey) => void;

export class Config {
  private static _instance: Config;
  private config = {} as ConfigType;
  private changeListeners = [] as Listener[];
  private loadedListeners = [] as Listener[];
  private loaded = false;

  private constructor() {
    LoadConfig()
      .then((config) => {
        if (config) {
          this.config = JSON.parse(config);
          this.loaded = true;
          console.debug("Config Loaded", this.config);
        }
      })
      .catch((err) => {
        console.warn("Can't load config", err);
        this.config = defaultConfig as ConfigType;
      })
      .finally(() => {
        this.notifyLoadedListeners();
        this.notifyListeners();
      });
  }

  static getInstance(): Config {
    if (!Config._instance) {
      Config._instance = new Config();
    }
    return Config._instance;
  }

  get(): ConfigType {
    return this.config;
  }

  set(value: ConfigType, changedKey?: ConfigKey): Promise<void> {
    console.debug("Config Updated", value);
    this.config = value;
    this.notifyListeners(changedKey);
    return SaveConfig(JSON.stringify(this.config, null, 2));
  }

  addChangeListener(listener: Listener) {
    this.changeListeners.push(listener);
  }

  removeChangeListener(listener: Listener) {
    const idx = this.changeListeners.indexOf(listener);
    this.changeListeners.splice(idx, 1);
  }

  addLoadedListener(listener: Listener) {
    this.loadedListeners.push(listener);
    // 既にLoadedの場合は即座に通知
    if (this.loaded) {
      listener(this.config);
    }
  }

  removeLoadedListener(listener: Listener) {
    const idx = this.loadedListeners.indexOf(listener);
    this.loadedListeners.splice(idx, 1);
  }

  private notifyListeners(changedKey?: ConfigKey) {
    for (const l of this.changeListeners) {
      l(this.config, changedKey);
    }
  }

  private notifyLoadedListeners(changedKey?: ConfigKey) {
    for (const l of this.loadedListeners) {
      l(this.config, changedKey);
    }
  }
}
