import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/Input";
import { EmojiPicker } from "@/components/EmojiPicker";
import { useCollection } from "@/hooks/useCollection";
import type { Collection } from "@/services/config";
import { sleep } from "@/lib/utils";
import Save from "@/assets/save.svg?react";

import "./CollectionAdd.css";
import "./Dialog.css";

type Props = {
  collection: Collection;
  onEdited: (collection: Collection) => void;
};

export function CollectionEdit({ collection, onEdited }: Props) {
  const { t } = useTranslation();
  const { editCollection } = useCollection();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [icon, setIcon] = useState(collection.icon);
  const [errorMsg, setErrorMsg] = useState<string>();

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.stopPropagation();
    }
  };

  const onChange = (e: any) => {
    setName(e.target.value);
    setErrorMsg("");
  };

  const onEmojiSelect = (emoji: any) => {
    setIcon(emoji.native);
  };

  const onInteractOutside = () => {
    close();
  };

  const edit = () => {
    const ret = editCollection(collection, { name, icon });
    if (!ret) {
      setErrorMsg(t("edit-duplicated"));
      return;
    }
    onEdited({ name, icon });
    close();
  };

  const close = async () => {
    setOpen(false);
    setClosing(true);
    await sleep(200);
    setClosing(false);
  };

  const isVaild =
    name !== "" && (icon !== collection.icon || name !== collection.name);

  return (
    <div className="CollectionEdit">
      <Dialog open={open} onOpenChange={setOpen} modal={false}>
        <DialogTrigger className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 py-1 px-3 rounded-lg transition text-sm">
          {t("edit")}
        </DialogTrigger>
        <DialogPortal>
          <div
            className="DialogOverlay"
            data-state={closing ? "closed" : "open"}
          />
          <DialogContent
            className="w-72 rounded"
            onInteractOutside={onInteractOutside}
          >
            <DialogHeader>
              <DialogTitle>{t("edit-collection")}</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground whitespace-pre-line">
                {t("edit-desc")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 text-center">
              <div className="flex gap-2">
                <EmojiPicker
                  onEmojiSelect={onEmojiSelect}
                  defaultEmoji={icon}
                />
                <Input
                  placeholder={t("add-placeholder")}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  defaultValue={name}
                  errorMsg={errorMsg}
                />
              </div>
              <Button
                onClick={edit}
                className="center mt-2 mx-[auto] py-1 px-3 h-9 rounded-lg text-md"
                variant="outline"
                disabled={!isVaild}
              >
                <Save className="fill-neutral-500 w-6 mr-1" />
                {t("edit-comfirm")}
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
