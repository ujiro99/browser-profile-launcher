import { useState, useEffect } from "react";
import { Config, ConfigKey } from "../services/config";
import type {
  ConfigType,
  Collection,
  ProfileCollections,
} from "../services/config";
import { uniq } from "../lib/utils";

type CollectionType = {
  collections: Collection[];
  setCollection: (value: Collection[]) => void;
  removeCollection: (value: Collection) => Promise<void>;
  moveCollection: (src: Collection, dest: Collection) => void;
  profileCollections: ProfileCollections[];
  setProfileCollection: (value: ProfileCollections[]) => void;
};

export const useCollection = (): CollectionType => {
  const [config, setConfig] = useState<ConfigType>({} as ConfigType);
  const collections = config[ConfigKey.collections] || [];
  const profileCollections = config[ConfigKey.profileCollections] || [];

  useEffect(() => {
    const c = Config.getInstance();
    setConfig(c.get());
    const l = (conf: ConfigType) => setConfig(conf);
    c.addChangeListener(l);
    return () => {
      c.removeChangeListener(l);
    };
  }, []);

  const setCollection = (value: Collection[]) => {
    Config.getInstance().set(
      {
        ...config,
        [ConfigKey.collections]: uniq(value),
      },
      ConfigKey.collections,
    );
  };

  const removeCollection = (value: Collection): Promise<void> => {
    const ncs = collections.filter((c) => c !== value);
    const npcs = profileCollections
      .map((p) => {
        return {
          ...p,
          collections: p.collections.filter((c) => c !== value),
        };
      })
      .filter((p) => p.collections.length > 0);
    return Config.getInstance().set({
      ...config,
      [ConfigKey.collections]: ncs,
      [ConfigKey.profileCollections]: npcs,
    });
  };

  const moveCollection = (src: Collection, dest: Collection) => {
    const destIdx = collections.indexOf(dest);
    const newVal = collections.filter((c) => c !== src);
    newVal.splice(destIdx , 0, src);
    Config.getInstance().set(
      {
        ...config,
        [ConfigKey.collections]: newVal,
      },
      ConfigKey.collections,
    );
  };

  const setProfileCollection = (value: ProfileCollections[]) => {
    Config.getInstance().set(
      {
        ...config,
        [ConfigKey.profileCollections]: value,
      },
      ConfigKey.profileCollections,
    );
  };

  return {
    collections,
    setCollection,
    removeCollection,
    moveCollection,
    profileCollections,
    setProfileCollection,
  };
};
