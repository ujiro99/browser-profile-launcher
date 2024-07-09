import { useState, useEffect } from "react";
import { Config, ConfigKey } from "@/services/config";
import type { ConfigType, Collection, ProfileDetail } from "@/services/config";
import { uniq } from "@/lib/utils";

type CollectionType = {
  collections: Collection[];
  setCollection: (value: Collection[]) => void;
  editCollection: (before: Collection, after: Collection) => boolean;
  removeCollection: (value: Collection) => Promise<void>;
  moveCollection: (src: Collection, dest: Collection) => void;
  profileCollections: ProfileDetail[];
  setProfileCollection: (value: ProfileDetail[]) => void;
};

export const useCollection = (): CollectionType => {
  const [config, setConfig] = useState<ConfigType>({} as ConfigType);
  const collections = config[ConfigKey.collections] || [];
  const profileDetails = config[ConfigKey.profileDetail] || [];

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
    if (isDuplicate(before, after) || !isChanged(before, after)) {
      return false;
    }
    // rename collection
    const idx = collections.findIndex((c) => equals(c, before));
    const newCollections = collections.filter((c) => !equals(c, before));
    newCollections.splice(idx, 0, after);
    // rename profileCollection
    for (const p of profileDetails) {
      p.collections = p.collections.map((c) =>
        c === before.name ? after.name : c,
      );
    }
    // Save
    Config.getInstance().set({
      ...config,
      [ConfigKey.collections]: newCollections,
      [ConfigKey.profileDetail]: profileDetails,
    });
    return true;
  };

  const removeCollection = (value: Collection): Promise<void> => {
    const ncs = collections.filter((c) => !equals(c, value));
    const npcs = profileDetails
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
      [ConfigKey.profileDetail]: npcs,
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

  const setProfileCollection = (value: ProfileDetail[]) => {
    // 既存のプロファイルを更新
    const newVal = profileDetails.map((p) => {
      const d = value.find((v) => v.key === p.key);
      if (!d) {
        return p;
      }
      return {
        ...p,
        collections: d.collections,
      };
    });
    // 新規のプロファイルを追加
    for (const d of value) {
      if (!newVal.find((v) => v.key === d.key)) {
        newVal.push(d);
      }
    }
    Config.getInstance().set(
      {
        ...config,
        [ConfigKey.profileDetail]: newVal,
      },
      ConfigKey.profileDetail,
    );
  };

  const equals = (a: Collection, b: Collection): boolean => {
    return a.name === b.name;
  };

  const isChanged = (a: Collection, b: Collection): boolean => {
    return a.name !== b.name || a.icon !== b.icon;
  };

  const isDuplicate = (a: Collection, b: Collection): boolean => {
    if (a.name === b.name) {
      return false;
    } else {
      return collections.some((c) => equals(c, b));
    }
  };

  return {
    collections,
    setCollection,
    editCollection,
    removeCollection,
    moveCollection,
    profileCollections: profileDetails,
    setProfileCollection,
  };
};
