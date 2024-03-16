import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { profile } from "../../wailsjs/go/models";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ProfileKey = string;
export function profileKey(p: profile.Profile): ProfileKey {
  return `${p.browser}-${p.directory}-${p.shortcut_name}`;
}
