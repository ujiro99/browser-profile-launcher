import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { profile } from "../../wailsjs/go/models";

import type { ListItem } from "../lib/utils";
import { Item } from "./Item";
import "./ProfileList.css";

type ListProps = {
  list: ListItem[];
  focusIdx: number;
  onClick: (profile: profile.Profile) => void;
};

export function ProfileList({ list, focusIdx, onClick }: ListProps) {
  const { t } = useTranslation();
  const empty = list.length === 0;

  const focusClass = (i: number) => {
    return i === focusIdx ? "focused" : "";
  };

  const refsByIdx = useMemo(() => {
    return list.map(() => React.createRef<HTMLLIElement>());
  }, [list]);

  useEffect(() => {
    if (refsByIdx.length > 0 && refsByIdx[focusIdx]) {
      refsByIdx[focusIdx].current?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [focusIdx, refsByIdx]);

  return (
    <ul className="profileList">
      {empty && (
        <div className="profileList__empty">
          <p className="profileList__empty-desc">{t("no-results")}</p>
        </div>
      )}
      {list?.map((item, i) => (
        <li
          key={item.profile.browser + item.profile.directory}
          className={focusClass(i)}
          ref={refsByIdx[i]}
        >
          <Item {...item} onClick={onClick} />
        </li>
      ))}
    </ul>
  );
}
