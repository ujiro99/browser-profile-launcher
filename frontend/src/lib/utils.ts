import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { profile } from "../../wailsjs/go/models";
import Fuse from "fuse.js";
import type { RangeTuple } from "fuse.js";
import type { Collection, ProfileDetail, LaunchOption } from "@/services/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ProfileKey = string;
export function profileKey(p: profile.Profile): ProfileKey {
  return `${p.browser}-${p.directory}`;
}

export type AliasKey = string;
export function aliasKey(p: ProfileDetail): AliasKey {
  return `${p.key}__${p.aliasName}`;
}

export type ListItem = {
  profile: profile.Profile;
  detail: ProfileDetail;
  indices?: readonly RangeTuple[];
};

/**
 * FuseによるFuzzy検索
 * @param list 検索対象のリスト
 * @param query 検索クエリ
 *
 * @returns フィルタリングされたリスト
 */
export function filter(list: ListItem[], query: string): ListItem[] {
  let filtered = list;
  if (list && query.length > 0) {
    const fuse = new Fuse<ListItem>(list, {
      keys: ["profile.shortcut_name", "detail.aliasName"],
      includeMatches: true,
    });
    filtered = fuse.search(query).map((res) => {
      // todo AliasNameを含める
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

/**
 * Collection名を取得する
 * @param c Collection
 *
 * @returns Collectionの文字列表現
 */
export function c2s(c: Collection): string {
  return `${c.icon || ""}${c.name}`;
}

function opt2s(opt: LaunchOption): string {
  return opt.value ? `--${opt.optionName}=${opt.value}` : `--${opt.optionName}`;
}

/**
  * LaunchOptionを文字列に変換する
  * @param opts LaunchOptionの配列
  *
  * @returns コマンドオプションとして渡される文字列
  */
export function convLaunchOption(opts?: LaunchOption[]): string[] {
  if (!opts || opts.length === 0) {
    return [];
  }
  return opts.map((opt) => opt2s(opt));
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

/**
 * ネイティブのProfile情報をProfileDetailに変換する
 *
 * @param profile goから取ったネイティブのProfile情報
 *
 * @returns ProfileDetail
 */
export function profile2detail(profile: profile.Profile): ProfileDetail {
  return {
    key: profileKey(profile),
    collections: [],
  };
}

/**
  * keyとかに使用するランダムな文字列を生成する
  */
export function rand(): string {
  return Math.random().toString(16).slice(2)
}
