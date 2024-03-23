import { Config } from "../services/config";
import type { ConfigType, ConfigKey } from "../services/config";

type useConfigType = [
  ConfigType,
  (value: ConfigType[ConfigKey], area: ConfigKey) => void,
];

const config = Config.getInstance();

export const useConfig = (): useConfigType => {
  const set = (value: ConfigType[ConfigKey], area: ConfigKey) => {
    const newConfig = { ...config.get(), [area]: value };
    Config.getInstance().set(newConfig, area);
  };

  return [config.get(), set];
};
