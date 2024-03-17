import { LoadConfig, SaveConfig } from "../../wailsjs/go/main/App";
import type { ProfileKey } from "../lib/utils";
import { Environment } from "../../wailsjs/runtime/runtime";

export enum ConfigKey {
  history = "history",
  collections = "collections",
  profileCollections = "profileCollections",
}

export type Collection = string;

export type ProfileCollections = {
  key: ProfileKey;
  collections: Collection[];
};

export type ConfigType = {
  [ConfigKey.history]: ProfileKey[];
  [ConfigKey.collections]: Collection[];
  [ConfigKey.profileCollections]: ProfileCollections[];
};

type ChangeListener = (config: ConfigType, area?: ConfigKey) => void;

export class Config {
  private static _instance: Config;
  private isDev = false;
  private config = {} as ConfigType;
  private listeners = [] as ChangeListener[];

  private constructor() {
    LoadConfig().then((config) => {
      console.debug("Config Loaded", this.config);
      if (config) {
        this.config = JSON.parse(config);
        this.notifyListeners();
      }
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

  set(value: ConfigType, changedKey: ConfigKey) {
    console.debug("Config Updated", value);
    this.config = value;
    this.notifyListeners(changedKey);

    if (this.isDev) {
      SaveConfig(JSON.stringify(this.config, null, 2));
    } else {
      SaveConfig(JSON.stringify(this.config));
    }
  }

  addChangeListener(listener: ChangeListener) {
    this.listeners.push(listener);
  }

  private notifyListeners(changedKey?: ConfigKey) {
    for (const l of this.listeners) {
      l(this.config, changedKey);
    }
  }
}
