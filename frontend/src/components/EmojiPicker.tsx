import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogPortal,
} from "@/components/ui/dialog";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import Smile from "@/assets/smile.svg?react";
import { sleep } from "@/lib/utils";
import "./CollectionAdd.css";

type Props = {
  onEmojiSelect: (emoji: any) => void;
  defaultEmoji?: string;
};

export function EmojiPicker({ onEmojiSelect, defaultEmoji }: Props) {
  const [emoji, setEmoji] = useState(defaultEmoji);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [closing, setClosing] = useState(false);

  const empty = !emoji;

  const select = useCallback(async (emoji: any) => {
    setEmoji(emoji.native);
    onEmojiSelect(emoji);
    setClosing(true);
    setOpenEmoji(false);
    await sleep(200);
    setClosing(false);
  }, []);

  const clickClear = useCallback(() => {
    setEmoji("");
    onEmojiSelect(emoji);
  }, []);

  return (
    <Dialog open={openEmoji} onOpenChange={setOpenEmoji} modal={false}>
      <div className="h-[32px]">
        {empty ? (
          <DialogTrigger className="EmojiTrigger">
            <Smile className="fill-neutral-400 w-[28px] h-[28px] p-[4px]" />
          </DialogTrigger>
        ) : (
          <button className="EmojiTrigger" type="button" onClick={clickClear}>
            {emoji}
          </button>
        )}
      </div>
      <DialogPortal>
        <div
          className="DialogOverlay"
          data-state={closing ? "closed" : "open"}
        />
        <DialogContent id="emoji-picker" className="p-0 w-[280px] rounded-lg">
          <Picker
            data={data}
            perLine={7}
            maxFrequentRows={2}
            set="native"
            onEmojiSelect={select}
            previewPosition="none"
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
