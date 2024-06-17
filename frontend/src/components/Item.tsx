import type { RangeTuple } from "fuse.js";
import type { profile as goProfile } from "../../wailsjs/go/models";
import type { ProfileDetail } from "@/services/config";
import { CollectionPopup } from "./CollectionPopup";
import { ProfileOption } from "./ProfileOption";

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
  const icoPath = `/profile.ico?browser=${profile.browser}&directory=${profile.directory}`;

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
        <img
          className="profileItem__img"
          src={icoPath}
          alt={profile.shortcut_name}
        />
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
      <ProfileOption className="profileItem__option" detail={detail} />
      <CollectionPopup className="profileItem__collection" profile={profile} />
    </div>
  );
}
