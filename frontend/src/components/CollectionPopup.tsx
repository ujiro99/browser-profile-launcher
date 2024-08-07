import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { profile as profileModel } from "../../wailsjs/go/models";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import LibraryAdd from "@/assets/library_add.svg?react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TabLabel } from "@/components/TabLabel";
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
  const defalut = profileCollections.find((c) => key === c.key);
  const [current, setCurrent] = useState(defalut);

  useEffect(() => {
    setCurrent(defalut);
  }, [defalut]);

  const onChange = (collections: string[]) => {
    setCurrent({ key, collections });
  };

  const onInteractOutside = () => {
    let newVal = profileCollections.filter((c) => c.key !== key);
    newVal = [
      ...newVal,
      {
        key,
        collections: current?.collections || [],
      },
    ];
    setProfileCollection(newVal);
  };

  return (
    <div className={`CollectionPopup ${className}`}>
      <Popover modal={true}>
        <PopoverTrigger className="CollectionButton">
          <LibraryAdd />
        </PopoverTrigger>
        <PopoverContent
          collisionPadding={8}
          onInteractOutside={onInteractOutside}
        >
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
              defaultValue={defalut?.collections || []}
              onValueChange={onChange}
            >
              {collections.map((c) => (
                <ToggleGroupItem
                  value={c.name}
                  key={c.name}
                  className="px-2 pb-[3px] h-7 text-neutral-500 font-medium hover:font-bold rounded-full text-sm border"
                >
                  <TabLabel tab={c.name} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
