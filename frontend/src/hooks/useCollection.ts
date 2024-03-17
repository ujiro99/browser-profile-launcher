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
    c.addChangeListener((conf) => setConfig(conf));
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
    profileCollections,
    setProfileCollection,
  };
};
