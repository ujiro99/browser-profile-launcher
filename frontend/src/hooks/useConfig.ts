import { useState, useEffect } from "react";
import { Config } from "../services/config";
import type { ConfigType, ConfigKey } from "../services/config";

type useConfigType = [ConfigType, (value: ConfigType, area: ConfigKey) => void];

export const useConfig = (): useConfigType => {
  const [config, setConfig] = useState<ConfigType>({} as ConfigType);

  useEffect(() => {
    const c = Config.getInstance();
    setConfig(c.get());
    c.addChangeListener((conf) => setConfig(conf));
  }, []);

  const set = (value: ConfigType, area: ConfigKey) => {
    setConfig(value);
    Config.getInstance().set(value, area);
  };

  return [config, set];
};
