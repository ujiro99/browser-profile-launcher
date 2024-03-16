import { LoadConfig, SaveConfig } from "../../wailsjs/go/main/App";
import type { ProfileKey } from "./util";

export enum ConfigKey {
  history = "history",
  tags = "tags",
  profileTags = "profileTags",
}

type ProfileTags = {
  profileKey: ProfileKey;
  tags: string[];
};

export type ConfigType = {
  [ConfigKey.history]: ProfileKey[];
  [ConfigKey.tags]: string[];
  [ConfigKey.profileTags]: ProfileTags[];
};

type ChangeListener = (config: ConfigType, area: ConfigKey) => void;

export class Config {
  private static _instance: Config;
  private config = {} as ConfigType;
  private listeners = [] as ChangeListener[];

  private constructor() {
    console.debug("Config.constructor");
    LoadConfig().then((config) => {
      if (config) {
        this.config = JSON.parse(config);
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
    this.config = value;
    SaveConfig(JSON.stringify(this.config));
    for (const l of this.listeners) {
      l(this.config, changedKey);
    }
  }

  addChangeListener(listener: ChangeListener) {
    this.listeners.push(listener);
  }
}
