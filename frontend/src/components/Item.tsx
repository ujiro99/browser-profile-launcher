import type { RangeTuple } from "fuse.js";
import { clsx } from "clsx";
import type { profile as goProfile } from "../../wailsjs/go/models";
import type { ProfileDetail } from "@/services/config";
import { CollectionPopup } from "./CollectionPopup";
import { ProfileOption } from "./ProfileOption";
import AccountCircle from "@/assets/account_circle.svg?react";
import Chrome from "@/assets/google_chrome.svg?react";
import Edge from "@/assets/microsoft_edge.svg?react";
import { useEnv } from "@/hooks/useEnv";

import "./Item.css";

type ItemProps = {
  profile: goProfile.Profile;
  detail: ProfileDetail;
  indices?: readonly RangeTuple[];
  onClick: (detail: ProfileDetail) => void;
};

type LabelMatch = {
  str: string;
  match?: boolean;
};

export function Item({ profile, detail, indices, onClick }: ItemProps) {
  const click = () => {
    onClick(detail);
  };

  // キーワードの部分一致をハイライトする
  let labels: LabelMatch[] = [{ str: profile.shortcut_name }];
  if (indices) {
    labels = [];
    let last = 0;
    for (const [start, end] of indices) {
      const match = profile.shortcut_name.substring(start, end + 1);
      const before = profile.shortcut_name.substring(last, start);
      labels.push({ str: before });
      labels.push({ str: match, match: true });
      last = end + 1;
    }
    if (last < profile.shortcut_name.length) {
      labels.push({ str: profile.shortcut_name.substring(last) });
    }
  }

  return (
    <div className="profileItem">
      <button type="button" className="profileItem__button" onClick={click}>
        <ProfileIcon profile={profile} />
        <p className="profileItem__label">
          {labels.map((label, i) => {
            if (label.match) {
              return (
                <span
                  key={`${i}${label.str}`}
                  className="profileItem__label--match"
                >
                  {label.str}
                </span>
              );
            }
            return <span key={`${i}${label.str}`}>{label.str}</span>;
          })}
        </p>
      </button>
      <ProfileOption
        className="profileItem__option"
        detail={detail}
        profile={profile}
      />
      <CollectionPopup className="profileItem__collection" profile={profile} />
    </div>
  );
}

type profileIconProps = {
  profile: goProfile.Profile;
};

function ProfileIcon({ profile }: profileIconProps) {
  const hasIcon = profile.ico_path != null && profile.ico_path.length > 0;
  const icoPath = `/profile.ico?browser=${profile.browser}&directory=${profile.directory}`;
  const isChrome = profile.browser.match("[Cc]hrome");
  const { isMac } = useEnv();

  return (
    <div className={`profileItem__icon ${clsx({ "--mac": isMac })}`}>
      {isChrome ? (
        <Chrome className="profileItem__browser" />
      ) : (
        <Edge className="profileItem__browser" />
      )}
      {hasIcon ? (
        <img
          className="profileItem__img"
          src={icoPath}
          alt={profile.shortcut_name}
        />
      ) : (
        <AccountCircle className="profileItem__img fill-gray-400" />
      )}
    </div>
  );
}
