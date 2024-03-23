import type React from "react";
import { useState, useRef, useCallback } from "react";
import Close from "../assets/close.svg?react";

import "./Input.css";

type InputProps = {
  placeholder: string;
  onChange: React.ChangeEventHandler | undefined;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  defaultValue?: string;
};

export function Input(props: InputProps) {
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = !inputRef.current?.value;

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (composing) {
        // IME入力中は何もしない
        e.stopPropagation();
        return;
      }
      props.onKeyDown?.(e);
      const key = e.code;
      if (key === "ArrowLeft") {
        e.stopPropagation();
      } else if (key === "ArrowRight") {
        e.stopPropagation();
      }
    },
    [composing, props.onKeyDown],
  );

  const clickClear = useCallback(() => {
    if (inputRef.current) {
      const last = inputRef.current.value;
      inputRef.current.value = "";
      inputRef.current.focus();

      // onChangeイベントを発火させる
      const tracker = (inputRef.current as any)._valueTracker;
      if (tracker) {
        tracker.setValue(last);
      }
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, []);

  return (
    <div className={`relative flex items-center ${props.className}`}>
      <input
        type="text"
        className="input"
        onChange={props.onChange}
        onKeyDown={onKeyDown}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        defaultValue={props.defaultValue}
        ref={inputRef}
        placeholder={props.placeholder}
      />
      {!isEmpty && (
        <button
          className="input-clear-button"
          type="button"
          onClick={clickClear}
        >
          <Close />
        </button>
      )}
    </div>
  );
}
