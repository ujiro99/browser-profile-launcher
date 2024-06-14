import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useCollection } from "@/hooks/useCollection";
import type { Collection } from "@/services/config";
import Warning from "../assets/warning.svg?react";

import "./CollectionAdd.css";

type Props = {
  collection: Collection;
  onDeleted: (collection: Collection) => void;
};

export function CollectionDelete({ collection, onDeleted }: Props) {
  const { t } = useTranslation();
  const { removeCollection } = useCollection();

  const deleteCollection = () => {
    removeCollection(collection);
    onDeleted(collection);
  };

  return (
    <div className="CollectionDelete">
      <Dialog>
        <DialogTrigger className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 py-1 px-3 rounded-lg transition text-sm">
          {t("delete")}
        </DialogTrigger>
        <DialogContent className="w-72 rounded">
          <DialogHeader>
            <DialogTitle>
              <Warning className="CollectionDelete__title-warning" />
              {t("delete-collection")}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground whitespace-pre-line">
              {t("delete-desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 text-center">
            <span className="text-lg font-bold break-all">{collection}</span>
            <Button
              variant="destructive"
              onClick={deleteCollection}
              className="center mt-2 mx-[auto] py-1 px-2 h-8 w-16 rounded-lg text-md"
            >
              {t("delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
