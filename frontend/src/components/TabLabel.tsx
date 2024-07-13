import Clock from "@/assets/clock.svg?react";
import { t2c } from "@/lib/utils";
import { useCollection } from "@/hooks/useCollection";

import "./TabLabel.css";

type Props = { tab: string };

export function TabLabel({ tab }: Props) {
  const { collections } = useCollection();

  const i = (tab: string) => {
    const c = t2c(tab, collections);
    if (c != null) {
      return c.icon;
    }
    return null;
  };

  return (
    <label className="TabLabel">
      {tab === "history" && <Clock className="TabLabel__icon --svg" />}
      {i(tab) && <span className="TabLabel__icon">{i(tab)}</span>}
      <span className="TabLabel__name">{tab}</span>
    </label>
  );
}
