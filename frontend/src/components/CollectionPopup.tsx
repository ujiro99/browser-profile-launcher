import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { profile as profileModel } from "../../wailsjs/go/models";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import LibraryAdd from "@/assets/library_add.svg?react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCollection } from "@/hooks/useCollection";
import { profileKey } from "@/lib/utils";

import "./CollectionPopup.css";

type CollectionPopuProps = {
  profile: profileModel.Profile;
  className?: string;
};

export function CollectionPopup({ className, profile }: CollectionPopuProps) {
  const { t } = useTranslation();
  const { collections, profileCollections, setProfileCollection } =
    useCollection();
  const empty = collections.length === 0;
  const key = useMemo(() => profileKey(profile), [profile]);
  const current = profileCollections.find((c) => key === c.key);

  const onChange = (collections: string[]) => {
    let newVal = profileCollections.filter((c) => c.key !== key);
    newVal = [...newVal, { key, collections }];
    setProfileCollection(newVal);
  };

  return (
    <div className={`CollectionPopup ${className}`}>
      <Popover modal={true}>
        <PopoverTrigger className="CollectionButton">
          <LibraryAdd />
        </PopoverTrigger>
        <PopoverContent collisionPadding={8}>
          <div className="grid gap-2">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t("collections")}</h4>
              <p className="text-sm text-muted-foreground">
                {empty ? t("collections-desc-empty") : t("collections-desc")}
              </p>
            </div>
            <ToggleGroup
              type="multiple"
              className="justify-start flex-wrap"
              defaultValue={current?.collections || []}
              onValueChange={onChange}
            >
              {collections.map((c) => (
                <ToggleGroupItem
                  value={c}
                  key={c}
                  className="px-3 h-7 text-neutral-500 font-medium hover:font-bold rounded-xl text-sm"
                >
                  {c}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
