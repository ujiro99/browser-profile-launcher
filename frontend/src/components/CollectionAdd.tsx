import { useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useCollection } from "@/hooks/useCollection";
import Plus from "../assets/plus.svg?react";

import "./CollectionAdd.css";

type Props = {
  className?: string;
};

export function CollectionAdd({ className }: Props) {
  const [open, setOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const { t } = useTranslation();
  const { collections, setCollection } = useCollection();
  const inputRef = useRef<HTMLInputElement>(null);

  const addCollection = () => {
    const val = inputRef.current?.value;
    if (val) {
      setCollection([...collections, val]);
      setOpen(false);
    }
  };

  const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (composing) {
      // IME入力中は何もしない
      return;
    }
    const key = e.code;
    if (key === "ArrowLeft") {
      e.stopPropagation();
    } else if (key === "ArrowRight") {
      e.stopPropagation();
    }
  };

  return (
    <div className={`CollectionAdd ${className}`}>
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
              <input
                type="text"
                ref={inputRef}
                className="input h-8"
                placeholder={t("add-placeholder")}
                onKeyDown={onKeyDownInput}
                onCompositionStart={() => setComposing(true)}
                onCompositionEnd={() => setComposing(false)}
              />
              <Button
                onClick={addCollection}
                className="py-1 px-2 h-8 rounded-lg text-xs"
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
