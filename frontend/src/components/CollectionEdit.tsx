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
  const [value, setValue] = useState(collection);

  const edit = () => {
    editCollection(collection, value);
    onEdited(value);
  };

  return (
    <div className="CollectionEdit">
      <Dialog>
        <DialogTrigger className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 py-1 px-3 rounded-lg transition text-sm">
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
              className="h-8"
              defaultValue={value}
            />
            <DialogClose asChild>
              <Button
                variant="destructive"
                onClick={edit}
                className="center mt-2 mx-[auto] py-1 px-2 h-8 w-14 rounded-lg text-md"
              >
                {t("edit-comfirm")}
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
