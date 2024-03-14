import "./App.css";
import type { RangeTuple } from "fuse.js";
import type { profile as goProfile } from "../wailsjs/go/models";

type ItemProps = {
  profile: goProfile.Profile;
  indices?: readonly RangeTuple[];
  onClick: (browser: string, directory: string) => void;
};

type LabelMatch = {
  str: string;
  match?: boolean;
};

export function Item({ profile, indices, onClick }: ItemProps) {
  const icoPath = `/profile.ico?browser=${profile.browser}&directory=${profile.directory}`;

  const click = () => {
    onClick(profile.browser, profile.directory);
  };

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
          {labels.map((label) => {
            if (label.match) {
              return (
                <span className="profileItem__label--match">{label.str}</span>
              );
            }
            return <span>{label.str}</span>;
          })}
        </p>
      </button>
    </div>
  );
}
