import { useState, useEffect } from "react";
import { Config, ConfigKey } from "../services/config";
import type { ConfigType } from "../services/config";
import type { ProfileKey } from "../lib/utils";
import { uniq } from "../lib/utils";

type HistoryType = [ProfileKey[], (value: ProfileKey) => void];

const HISTORY_MAX = 100;

export const useHistory = (): HistoryType => {
  const [config, setConfig] = useState<ConfigType>({} as ConfigType);
  const history = config[ConfigKey.history] || [];

  useEffect(() => {
    const c = Config.getInstance();
    setConfig(c.get());
    const l = (conf: ConfigType) => setConfig(conf);
    c.addChangeListener(l);
    return () => {
      c.removeChangeListener(l);
    };
  }, []);

  const addHistory = (value: ProfileKey) => {
    let newHistory = [value, ...history];
    newHistory = uniq(newHistory);
    newHistory = newHistory.slice(0, HISTORY_MAX);
    Config.getInstance().set(
      {
        ...config,
        [ConfigKey.history]: newHistory,
      },
      ConfigKey.history,
    );
  };

  return [history, addHistory];
};
