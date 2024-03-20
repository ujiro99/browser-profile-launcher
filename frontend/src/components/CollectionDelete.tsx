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
  className?: string;
  collection: Collection;
  onDeleted: (collection: Collection) => void;
};

export function CollectionDelete({ className, collection, onDeleted }: Props) {
  const { t } = useTranslation();
  const { removeCollection } = useCollection();

  const deleteCollection = () => {
    removeCollection(collection);
    onDeleted(collection);
  };

  return (
    <div className={`CollectionDelete ${className}`}>
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
            <DialogDescription>
              <div className="grid gap-2">
                <p className="text-base text-muted-foreground whitespace-pre-line">
                  {t("delete-desc")}
                </p>
                <p className="text-lg font-bold break-all">{collection}</p>
                <Button
                  variant="destructive"
                  onClick={deleteCollection}
                  className="center mt-2 mx-[auto] py-1 px-2 h-8 w-14 rounded-lg text-md"
                >
                  {t("delete")}
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
