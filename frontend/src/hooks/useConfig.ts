import { useState, useEffect } from "react";
import { Config } from "../services/config";
import type { ConfigType, ConfigKey } from "../services/config";

export const useConfig = () => {
  const [config, setConfig] = useState<ConfigType>();

  useEffect(() => {
    setConfig(Config.getInstance().get());
  }, []);

  const set = (value: ConfigType, area: ConfigKey) => {
    setConfig(value);
    Config.getInstance().set(value, area);
  };

  return [config, set];
};
