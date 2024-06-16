import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { EmojiPicker } from "@/components/EmojiPicker";
import { Input } from "@/components/Input";
import { useCollection } from "@/hooks/useCollection";
import Plus from "@/assets/plus.svg?react";

import "./CollectionAdd.css";

export function CollectionAdd() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const { t } = useTranslation();
  const { collections, setCollection } = useCollection();

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      addCollection();
      e.stopPropagation();
    }
  };

  const onEmojiSelect = (emoji: any) => {
    setIcon(emoji.native);
  };

  const addCollection = () => {
    if (name) {
      setCollection([...collections, { name, icon }]);
      setOpen(false);
      setName("");
      setIcon("");
    }
  };

  return (
    <div className="CollectionAdd">
      <Popover modal={false} open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="CollectionAdd__trigger">
          <Plus />
        </PopoverTrigger>
        <PopoverContent collisionPadding={8}>
          <div className="grid gap-2">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t("collections")}</h4>
              <p className="text-sm text-muted-foreground">{t("add-desc")}</p>
            </div>
            <div className="CollectionAdd__input">
              <div className="flex gap-1">
                <EmojiPicker
                  onEmojiSelect={onEmojiSelect}
                  defaultEmoji={icon}
                />
                <Input
                  placeholder={t("add-placeholder")}
                  onChange={(e: any) => setName(e.target.value)}
                  onKeyDown={onKeyDown}
                  defaultValue={name}
                />
              </div>
              <Button
                onClick={addCollection}
                className="py-1 pr-2 pl-1 h-8 rounded-lg text-xs"
                disabled={!name}
              >
                <Plus className="fill-neutral-600 w-5" />
                {t("add")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
