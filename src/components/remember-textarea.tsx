import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

/** Expand quote inputs for typing, starter text and live transcription. */
export function RememberTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }, [props.value]);
  return <textarea {...props} ref={ref} />;
}
