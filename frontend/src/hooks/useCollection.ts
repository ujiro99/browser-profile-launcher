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
  editCollection: (before: Collection, after: Collection) => boolean;
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

  const editCollection = (before: Collection, after: Collection): boolean => {
    if (isDuplicate(after)) {
      return false;
    }
    // rename collection
    const idx = collections.findIndex((c) => equals(c, before));
    const newCollections = collections.filter((c) => !equals(c, before));
    newCollections.splice(idx, 0, after);
    // rename profileCollection
    for (const p of profileCollections) {
      p.collections = p.collections.map((c) =>
        c === before.name ? after.name : c,
      );
    }
    // Save
    Config.getInstance().set({
      ...config,
      [ConfigKey.collections]: newCollections,
      [ConfigKey.profileCollections]: profileCollections,
    });
    return true;
  };

  const removeCollection = (value: Collection): Promise<void> => {
    const ncs = collections.filter((c) => !equals(c, value));
    const npcs = profileCollections
      .map((p) => {
        return {
          ...p,
          collections: p.collections.filter((c) => c !== value.name),
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
    const newVal = collections.filter((c) => !equals(c, src));
    const idx = collections.findIndex((c) => equals(c, dest));
    newVal.splice(idx, 0, src);
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

  const equals = (a: Collection, b: Collection): boolean => {
    return a.name === b.name;
  };

  const isDuplicate = (value: Collection): boolean => {
    return collections.some((c) => equals(c, value));
  };

  return {
    collections,
    setCollection,
    editCollection,
    removeCollection,
    moveCollection,
    profileCollections,
    setProfileCollection,
  };
};
