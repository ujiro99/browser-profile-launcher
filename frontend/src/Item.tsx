import "./App.css";
import { RangeTuple } from "fuse.js";
import { profile as goProfile } from "../wailsjs/go/models";
import { Run } from "../wailsjs/go/main/App";

type ItemProps = {
  profile: goProfile.Profile;
  indices?: readonly RangeTuple[];
  onError: (msg: string) => void;
};

type LabelMatch = {
  str: string;
  match?: boolean;
};

export function Item({ profile, indices, onError }: ItemProps) {
  const icoPath = `/profile.ico?browser=${profile.browser}&directory=${profile.directory}`;

  function select() {
    Run(profile.browser, profile.directory).then((err) => {
      onError(err);
    });
  }

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
      <button type="button" className="profileItem__button" onClick={select}>
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
