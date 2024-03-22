import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import Lightbulb from "@/assets/lightbulb.svg?react";

import "./Tips.css";

export function Tips() {
  const { t } = useTranslation();
  const tips = t("tips", { returnObjects: true }) as string[];
  return (
    <div className="Tips">
      <Dialog>
        <DialogTrigger className="hover:bg-neutral-100 p-1 rounded-lg transition">
          <Lightbulb className="w-6 h-6 p-0.5 fill-neutral-600" />
        </DialogTrigger>
        <DialogContent
          className="w-80 gap-3 py-5 px-3 rounded-lg text-neutral-600"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="-indent-2">💡Shortcut keys</DialogTitle>
          </DialogHeader>
          <ul className="Tips__list">
            {tips.map((tip) => (
              <li key={tip} className="Tips__item">
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
