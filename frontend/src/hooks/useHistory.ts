import { useState, useEffect } from "react";
import { Config, ConfigKey } from "../services/config";
import type { ConfigType } from "../services/config";
import type { ProfileKey } from "../lib/utils";

type HistoryType = [ProfileKey[], (value: ProfileKey) => void];

const HISTORY_MAX = 100;

function uniq<T>(arr: T[]) {
  return arr.filter((elm, idx, self) => self.indexOf(elm) === idx);
}

export const useHistory = (): HistoryType => {
  const [config, setConfig] = useState<ConfigType>({} as ConfigType);
  const history = config[ConfigKey.history] || [];

  useEffect(() => {
    const c = Config.getInstance();
    setConfig(c.get());
    c.addChangeListener((conf) => setConfig(conf));
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
