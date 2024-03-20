import type React from "react";
import { useState, useRef, useCallback } from "react";

type InputProps = {
  onChange: React.ChangeEventHandler | undefined;
  placeholder: string;
  className?: string;
};

export function Input(props: InputProps) {
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onKeyDownInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (composing) {
        // IME入力中は何もしない
        e.stopPropagation();
        return;
      }
      const key = e.code;
      if (key === "ArrowLeft") {
        e.stopPropagation();
      } else if (key === "ArrowRight") {
        e.stopPropagation();
      }
    },
    [composing],
  );

  return (
    <input
      type="text"
      className={`input ${props.className}`}
      onChange={props.onChange}
      onKeyDown={onKeyDownInput}
      onCompositionStart={() => setComposing(true)}
      onCompositionEnd={() => setComposing(false)}
      ref={inputRef}
      placeholder={props.placeholder}
    />
  );
}
