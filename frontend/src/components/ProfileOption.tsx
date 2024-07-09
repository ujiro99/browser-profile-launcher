import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import type { profile as profileModel } from "@/../wailsjs/go/models";
import { Input } from "@/components/Input";
import { useProfile } from "@/hooks/useProfile";
import { sleep, rand } from "@/lib/utils";
import type { ProfileDetail, LaunchOption } from "@/services/config";
import Vert from "@/assets/vert.svg?react";
import Plus from "@/assets/plus.svg?react";
import Close from "@/assets/close.svg?react";
import Save from "@/assets/save.svg?react";

import "./ProfileOption.css";
import "./Dialog.css";

type Props = {
  detail: ProfileDetail;
  profile: profileModel.Profile;
  className?: string;
};

export function ProfileOption({ detail, profile, className }: Props) {
  const { t } = useTranslation();
  const { setProfileDetail } = useProfile();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const isEdge = profile.browser === "msedge";

  const onInteractOutside = () => {
    close();
  };

  const onKeyDownOverlay = (e: any) => {
    e.stopPropagation();
  };

  const edit = (options: LaunchOption[]) => {
    setProfileDetail({ ...detail, launchOptions: options });
    close();
  };

  const close = async () => {
    setOpen(false);
    setClosing(true);
    await sleep(200);
    setClosing(false);
  };

  return (
    <div className={`ProfileOption ${className}`}>
      <Dialog open={open} onOpenChange={setOpen} modal={false}>
        <DialogTrigger className="ProfileOption__trigger">
          <Vert />
        </DialogTrigger>
        <DialogPortal>
          <div
            className="DialogOverlay"
            onKeyDown={onKeyDownOverlay}
            data-state={closing ? "closed" : "open"}
          />
          <DialogContent
            className="w-96 rounded px-2"
            onInteractOutside={onInteractOutside}
          >
            <DialogHeader>
              <DialogTitle>{t("profile-options")}</DialogTitle>
            </DialogHeader>
            {isEdge ? (
              <p className="text-neutral-500 w-[210px] mx-[auto]">
                {t("option-edge")}
              </p>
            ) : (
              <ProfileOptionInner detail={detail} onSave={edit} />
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

type InnerProps = {
  detail: ProfileDetail;
  onSave: (options: LaunchOption[]) => void;
};

function ProfileOptionInner({ detail, onSave }: InnerProps) {
  const { t } = useTranslation();
  const [options, setOptions] = useState(detail.launchOptions || []);
  const isEmpty = options.length === 0;

  useEffect(() => {
    setOptions(detail.launchOptions || []);
  }, [detail]);

  const onChangeName = (idx: number) => (e: React.ChangeEvent) => {
    const value = (e.target as HTMLInputElement).value;
    let newOptions = [...options];
    newOptions[Number(idx)].optionName = value;
    setOptions(newOptions);
  };

  const onChangeValue = (idx: number) => (e: React.ChangeEvent) => {
    const value = (e.target as HTMLInputElement).value;
    let newOptions = [...options];
    newOptions[Number(idx)].value = value;
    setOptions(newOptions);
  };

  const onClickDelete = (idx: number) => () => {
    let newOptions = [...options];
    newOptions.splice(idx, 1);
    setOptions(newOptions);
  };

  const onClick = () => {
    onSave(options);
  };

  const addOption = () => {
    setOptions([...options, { id: rand(), optionName: "", value: "" }]);
  };

  const enableAdd = !options.some((o) => o.optionName === "");

  return (
    <div className="grid gap-1 text-center">
      <ul className="pl-5 mt-2">
        <li className="flex gap-2 pr-[30px]" key="header">
          <span className="flex-1">{t("option-name")}</span>
          <span className="flex-1">{t("option-value")}</span>
        </li>
        {isEmpty ? (
          <p className="ProfileOption__empty">{t("option-empty")}</p>
        ) : (
          options.map((option, idx) => (
            <li className="flex gap-1 my-1" key={option.id}>
              <Input
                placeholder={t("option-placeholder-name")}
                onChange={onChangeName(idx)}
                defaultValue={option.optionName}
              />
              <Input
                placeholder={t("option-placeholder-value")}
                onChange={onChangeValue(idx)}
                defaultValue={option.value}
              />

              <button
                className="ProfileOption__delete"
                type="button"
                onClick={onClickDelete(idx)}
              >
                <Close />
              </button>
            </li>
          ))
        )}
      </ul>
      <Button
        onClick={addOption}
        disabled={!enableAdd}
        className="mx-[auto] py-1 px-3 h-8 text-sm bg-neutral-100 rounded-lg"
      >
        <Plus className="fill-neutral-500 w-5 mr-1" />
        {t("option-add-option")}
      </Button>
      <Button
        onClick={onClick}
        className="center mt-4 mx-[auto] py-1 px-4 h-9 rounded-lg text-md"
      >
        <Save className="fill-neutral-500 w-6 mr-1" />
        {t("option-confirm")}
      </Button>
    </div>
  );
}
