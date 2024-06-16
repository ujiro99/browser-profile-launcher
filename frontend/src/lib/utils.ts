import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { profile } from "../../wailsjs/go/models";
import Fuse from "fuse.js";
import type { RangeTuple } from "fuse.js";
import type { Collection } from "@/services/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ProfileKey = string;
export function profileKey(p: profile.Profile): ProfileKey {
  return `${p.browser}-${p.directory}`;
}

export type ListItem = {
  profile: profile.Profile;
  indices?: readonly RangeTuple[];
};

export function filter(list: ListItem[], query: string): ListItem[] {
  let filtered = list;
  if (list && query.length > 0) {
    const fuse = new Fuse<ListItem>(list, {
      keys: ["profile.shortcut_name"],
      includeMatches: true,
    });
    filtered = fuse.search(query).map((res) => {
      const item = { profile: res.item.profile } as ListItem;
      if (res.matches) {
        const match = res.matches.find(
          (m) => m.key === "profile.shortcut_name",
        );
        if (match) {
          item.indices = match.indices;
        }
      }
      return item;
    });
    console.debug(query, filtered);
  }
  return filtered;
}

export function sort(list: ListItem[]): ListItem[] {
  return list.sort((a, b) => {
    return a.profile.shortcut_name.localeCompare(b.profile.shortcut_name);
  });
}

export function mapListItem(list: ListItem[], keys: ProfileKey[]): ListItem[] {
  return keys
    .map((key) => {
      return list.find((p) => profileKey(p.profile) === key);
    })
    .filter((p) => p !== undefined) as ListItem[];
}

export function uniq<T>(arr: T[]) {
  return arr.filter((elm, idx, self) => self.indexOf(elm) === idx);
}

export function c2s(c: Collection): string {
  return `${c.icon || ''}${c.name}`;
}

enum Diff {
  New = 1,
  Same = 0,
  Old = -1,
}

export function versionDiff(a: string, b: string): Diff {
  if (!b) {
    return Diff.Old;
  }
  const aVer = a.split(".").map((v) => Number.parseInt(v));
  const bVer = b.split(".").map((v) => Number.parseInt(v));
  for (let i = 0; i < aVer.length; i++) {
    if (aVer[i] === bVer[i]) {
      continue;
    }
    return aVer[i] > bVer[i] ? Diff.New : Diff.Old;
  }
  return Diff.Same;
}

export function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
