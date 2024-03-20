import { LoadConfig, SaveConfig } from "../../wailsjs/go/main/App";
import type { ProfileKey } from "../lib/utils";
import { Environment } from "../../wailsjs/runtime/runtime";
import defaultConfig from "./defaultConfig.json";

export enum ConfigKey {
  history = "history",
  collections = "collections",
  profileCollections = "profileCollections",
  behaviorAfterLaunch = "behaviorAfterLaunch",
  language = "language",
  lastTab = "lastTab",
}

export type ConfigType = {
  [ConfigKey.history]: ProfileKey[];
  [ConfigKey.collections]: Collection[];
  [ConfigKey.profileCollections]: ProfileCollections[];
  [ConfigKey.behaviorAfterLaunch]: BehaviorAfterLaunch;
  [ConfigKey.language]: string;
  [ConfigKey.lastTab]: string;
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

type ChangeListener = (config: ConfigType, area?: ConfigKey) => void;

export class Config {
  private static _instance: Config;
  private isDev = false;
  private config = {} as ConfigType;
  private listeners = [] as ChangeListener[];
  private loadedListeners = [] as ChangeListener[];

  private constructor() {
    LoadConfig()
      .then((config) => {
        if (config) {
          this.config = JSON.parse(config);
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
    Environment().then((env) => {
      if (env.buildType === "dev") {
        this.isDev = true;
      }
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

  set(value: ConfigType, changedKey?: ConfigKey) {
    console.debug("Config Updated", value);
    this.config = value;
    this.notifyListeners(changedKey);
    SaveConfig(JSON.stringify(this.config, null, 2));
  }

  addChangeListener(listener: ChangeListener) {
    this.listeners.push(listener);
  }

  addLoadedListener(listener: ChangeListener) {
    this.loadedListeners.push(listener);
    // 既にLoadedの場合は即座に通知
    if (this.config) {
      listener(this.config);
    }
  }

  private notifyListeners(changedKey?: ConfigKey) {
    for (const l of this.listeners) {
      l(this.config, changedKey);
    }
  }

  private notifyLoadedListeners(changedKey?: ConfigKey) {
    for (const l of this.loadedListeners) {
      l(this.config, changedKey);
    }
  }
}
