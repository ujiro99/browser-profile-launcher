import type { profile } from "../../wailsjs/go/models";

export type ProfileKey = string;

export const utils = {
  profileKey(p: profile.Profile): ProfileKey {
    return `${p.browser}-${p.directory}-${p.shortcut_name}`;
  },
};
