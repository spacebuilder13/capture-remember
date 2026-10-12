import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "requesting" | "recording" | "ready" | "denied" | "unsupported";

export function useRecorder(maxSeconds: number) {
  const [state, setState] = useState<RecorderState>("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedRef = useRef(0);
  const stopAsap = useRef(false);
  const timerRef = useRef<number | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    [],
  );

  const stop = useCallback(() => {
    if (recRef.current?.state === "recording") recRef.current.stop();
    else stopAsap.current = true;
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setState("unsupported");
      return;
    }
    stopAsap.current = false;
    try {
      setState("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        const b = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(b);
        setBlob(b);
        setUrl(urlRef.current);
        setSeconds(Math.min(maxSeconds, (Date.now() - startedRef.current) / 1000));
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recRef.current = null;
        setState("ready");
      };
      rec.start();
      startedRef.current = Date.now();
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        const s = (Date.now() - startedRef.current) / 1000;
        setElapsed(s);
        if (s >= maxSeconds) rec.state === "recording" && rec.stop();
      }, 250);
      setState("recording");
      if (stopAsap.current) window.setTimeout(() => rec.state === "recording" && rec.stop(), 600);
    } catch {
      setState("denied");
    }
  }, [maxSeconds]);

  const clear = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setUrl(null);
    setBlob(null);
    setSeconds(0);
    setState("idle");
  }, []);

  return { state, url, blob, seconds, elapsed, start, stop, clear };
}
