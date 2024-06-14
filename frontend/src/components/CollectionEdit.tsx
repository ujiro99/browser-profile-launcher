import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/Input";
import { useCollection } from "@/hooks/useCollection";
import type { Collection } from "@/services/config";

import "./CollectionAdd.css";

type Props = {
  collection: Collection;
  onEdited: (collection: Collection) => void;
};

export function CollectionEdit({ collection, onEdited }: Props) {
  const { t } = useTranslation();
  const { editCollection } = useCollection();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(collection);
  const [errorMsg, setErrorMsg] = useState<string>();

  const edit = () => {
    const ret = editCollection(collection, value);
    if (!ret) {
      setErrorMsg(t("edit-duplicated"));
      return;
    }
    onEdited(value);
    setOpen(false);
  };

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.stopPropagation();
    }
  };

  const isVaild = value !== collection && value !== "";

  return (
    <div className="CollectionEdit">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 py-1 px-3 rounded-lg transition text-sm">
          {t("edit")}
        </DialogTrigger>
        <DialogContent className="w-72 rounded">
          <DialogHeader>
            <DialogTitle>{t("edit-collection")}</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground whitespace-pre-line">
              {t("edit-desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 text-center">
            <Input
              placeholder={t("add-placeholder")}
              onChange={(e: any) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              className="h-8"
              defaultValue={value}
            />
            {errorMsg && (
              <span className="text-sm text-rose-600">{errorMsg}</span>
            )}
            <Button
              variant="destructive"
              onClick={edit}
              className="center mt-2 mx-[auto] py-1 px-2 h-8 w-14 rounded-lg text-md"
              disabled={!isVaild}
            >
              {t("edit-comfirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
