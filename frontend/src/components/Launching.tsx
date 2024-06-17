import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import Progress from "@/assets/progress.svg?react";

import "./Launching.css";

type Props = {
  visible: boolean;
};

export function Launching({ visible }: Props) {
  const { t } = useTranslation();
  return (
    <div className="Launching">
      <Dialog open={visible}>
        <DialogContent className="LaunchingContent">
          <Progress className="animate-spin mx-[auto] w-10 h-10 fill-neutral-500" />
          <span className="text-lg text-neutral-500 italic">
            {t("launching")}
          </span>
        </DialogContent>
      </Dialog>
    </div>
  );
}
