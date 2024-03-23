import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useCollection } from "@/hooks/useCollection";
import { Input } from "@/components/Input";
import Plus from "@/assets/plus.svg?react";

import "./CollectionAdd.css";

export function CollectionAdd() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { t } = useTranslation();
  const { collections, setCollection } = useCollection();

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      addCollection();
      e.stopPropagation();
    }
  };

  const addCollection = () => {
    if (value) {
      setCollection([...collections, value]);
      setOpen(false);
      setValue("");
    }
  };

  return (
    <div className="CollectionAdd">
      <Popover modal={true} open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="CollectionAdd__button">
          <Plus />
        </PopoverTrigger>
        <PopoverContent collisionPadding={8}>
          <div className="grid gap-2">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t("collections")}</h4>
              <p className="text-sm text-muted-foreground">{t("add-desc")}</p>
            </div>
            <div className="CollectionPopup__input">
              <Input
                placeholder={t("add-placeholder")}
                onChange={(e: any) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                className="h-8"
                defaultValue={value}
              />
              <Button
                onClick={addCollection}
                className="py-1 pr-2 pl-1 h-8 rounded-lg text-xs"
                disabled={!value}
              >
                <Plus className="fill-neutral-600" />
                {t("add")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
