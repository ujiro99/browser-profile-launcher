import { useState, useEffect, useContext } from "react";
import { Config, ConfigKey } from "../services/config";
import type { ConfigType, ProfileDetail } from "../services/config";
import { profile2detail } from "@/lib/utils";
import { ProfilesContext } from "@/contexts";

type useProfileReturn = {
  profileDetails: ProfileDetail[];
  setProfileDetail: (profile: ProfileDetail) => void;
};

const union = (a: ProfileDetail[], b: ProfileDetail[]): ProfileDetail[] => {
  const list = [...a];
  for (const p of b) {
    if (list.findIndex((d) => detailEquals(d, p)) === -1) {
      list.push(p);
    } else {
      // 同じものがあった場合は、aを優先する
    }
  }
  return list;
};

const detailEquals = (a: ProfileDetail, b: ProfileDetail) => {
  return a.key === b.key;
};

export const useProfile = (): useProfileReturn => {
  const profiles = useContext(ProfilesContext);
  const [config, setConfig] = useState<ConfigType>({} as ConfigType);
  const detailsOrigin = profiles.map(profile2detail);
  const details = config[ConfigKey.profileDetail] || [];
  const profileDetails = union(details, detailsOrigin);

  useEffect(() => {
    const c = Config.getInstance();
    setConfig(c.get());
    const l = (conf: ConfigType) => setConfig(conf);
    c.addChangeListener(l);
    return () => {
      c.removeChangeListener(l);
    };
  }, []);

  const setProfileDetails = (details: ProfileDetail[]) => {
    Config.getInstance().set(
      {
        ...config,
        [ConfigKey.profileDetail]: details,
      },
      ConfigKey.profileDetail,
    );
  };

  const setProfileDetail = (details: ProfileDetail) => {
    const list = profileDetails.filter((d) => !detailEquals(d, details));
    list.push(details);
    setProfileDetails(list);
  };

  return {
    profileDetails,
    setProfileDetail,
  };
};
