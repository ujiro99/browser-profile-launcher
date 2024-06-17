import React from "react";
import type { profile } from "../wailsjs/go/models";

 export const ProfilesContext = React.createContext([] as profile.Profile[]);
