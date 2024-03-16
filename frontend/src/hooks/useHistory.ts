import { useState, useEffect } from "react";
import { Config, ConfigKey } from "../services/config";
import type { ConfigType } from "../services/config";
import type { ProfileKey } from "../services/util";

type HistoryType = [ProfileKey[], (value: ProfileKey) => void];

export const useHistory = (): HistoryType => {
  const [config, setConfig] = useState<ConfigType>({} as ConfigType);
  const history = config[ConfigKey.history] || [];

  useEffect(() => {
    setConfig(Config.getInstance().get());
  }, []);

  const addHistory = (value: ProfileKey) => {
    Config.getInstance().set(
      {
        ...config,
        [ConfigKey.history]: [value, ...history],
      },
      ConfigKey.history,
    );
  };

  return [history, addHistory];
};
