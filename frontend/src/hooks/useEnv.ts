import { useState, useEffect } from "react";
import { Environment } from "../../wailsjs/runtime/runtime";
import type { EnvironmentInfo } from "../../wailsjs/runtime/runtime";

type EnvType = {
  env: EnvironmentInfo;
  isDev: boolean;
};

export const useEnv = (): EnvType => {
  const [env, setEnv] = useState<EnvironmentInfo>({} as EnvironmentInfo);

  useEffect(() => {
    Environment().then((env) => {
      setEnv(env);
      console.log(env);
    });
  }, []);

  return {
    env,
    isDev: env?.buildType === "dev",
  };
};
