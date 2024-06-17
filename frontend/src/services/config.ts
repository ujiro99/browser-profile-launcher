import { LoadConfig, SaveConfig, GetVersion } from "../../wailsjs/go/main/App";
import type { ProfileKey } from "../lib/utils";
import { versionDiff, VersionDiff, uniq } from "../lib/utils";
import defaultConfig from "./defaultConfig.json";

export enum ConfigKey {
  configVersion = "configVersion",
  history = "history",
  collections = "collections",
  profileDetail = "profileDetail",
  profileCollections = "profileCollections", // deprecated
  behaviorAfterLaunch = "behaviorAfterLaunch",
  language = "language",
  lastTab = "lastTab",
  windowSize = "windowSize",
}

export type ConfigType = {
  [ConfigKey.configVersion]: string;
  [ConfigKey.history]: ProfileKey[];
  [ConfigKey.collections]: Collection[];
  [ConfigKey.profileDetail]: ProfileDetail[];
  [ConfigKey.profileCollections]?: ProfileDetail[]; // deprecated
  [ConfigKey.behaviorAfterLaunch]: BehaviorAfterLaunch;
  [ConfigKey.language]: string;
  [ConfigKey.lastTab]: string;
  [ConfigKey.windowSize]: [number, number];
};

export type CollectionName = string;

export type Collection = {
  name: CollectionName;
  icon: string;
};

export type ProfileDetail = {
  key: ProfileKey;
  collections: CollectionName[];
  aliasName?: string;
  launchOptions?: LaunchOption[];
};

export type LaunchOption = {
  id: string;
  optionName: string;
  value?: string;
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
    Promise.all([LoadConfig(), GetVersion()])
      .then(([config, appVer]) => {
        if (config) {
          this.config = JSON.parse(config);
          this.loaded = true;
          console.debug("Config Loaded", this.config);

          const configVer = this.config[ConfigKey.configVersion];
          const d = versionDiff(configVer, appVer);
          if (d === VersionDiff.Old) {
            // マイグレーション
            this.migrate();
            this.config[ConfigKey.configVersion] =
              defaultConfig[ConfigKey.configVersion];
            SaveConfig(JSON.stringify(this.config, null, 2));
            console.debug("Config Migrated", this.config);
          }
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

  private migrateProfileKey(oldKey: string): ProfileKey {
    return oldKey.split("-").slice(0, 2).join("-");
  }

  private migrate() {
    this.migrate140();
    this.migrate150();
  }

  // ver 1.3.0 -> 1.4.0
  private migrate140() {
    let profileCollections = this.config[ConfigKey.profileCollections];
    if (profileCollections) {
      profileCollections = profileCollections
        .map((c) => {
          return {
            key: this.migrateProfileKey(c.key),
            collections: c.collections,
          };
        })
        .reduce((acc, cur) => {
          const f = acc.find((c) => c.key === cur.key);
          if (!f) {
            acc.push(cur);
          } else {
            f.collections = uniq([...f.collections, ...cur.collections]);
          }
          return acc;
        }, [] as ProfileDetail[]);
      this.config[ConfigKey.profileCollections] = profileCollections;
    }
    const history = this.config[ConfigKey.history];
    if (history) {
      this.config[ConfigKey.history] = uniq(
        history.map((h) => this.migrateProfileKey(h)),
      );
    }
  }

  // ver 1.4.0 -> 1.5.0
  private migrate150() {
    // - collectionsをオブジェクト化し、iconフィールド追加
    let collections = this.config[ConfigKey.collections];
    if (collections && collections.length > 0) {
      if (typeof collections[0] === "string") {
        collections = collections.map((c) => {
          return { name: c as unknown as string, icon: "" };
        });
        this.config[ConfigKey.collections] = collections;
      }
    }
    // - profileCollection -> profileDetail
    const profileCollections = this.config[ConfigKey.profileCollections];
    if (profileCollections) {
      this.config[ConfigKey.profileDetail] = profileCollections;
    }
    delete this.config.profileCollections;
  }
}
