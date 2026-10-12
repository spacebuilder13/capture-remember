import { Check, ChevronRight, Mic, RotateCcw, Square } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { useRecorder } from "@/hooks/use-recorder";
import type { StoryTheme } from "@/lib/story-themes";

export function StoryHeader() {
  return (
    <header className="relative z-20 border-b border-story-paper/15 bg-story-ink text-story-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <span className="font-display text-2xl">MemReel</span>
        <span className="text-xs text-story-paper/70">One Story, Together</span>
      </div>
    </header>
  );
}

export function Progress({ step }: { step: number }) {
  return (
    <div className="bg-story-paper text-story-ink">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4 sm:px-8">
        {["Parent", "Grandparent", "Child"].map((label, index) => {
          const number = index + 1;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${step >= number ? "bg-story-ink text-story-paper" : "bg-story-ink/10"}`}>
                {step > number ? <Check className="size-3.5" /> : number}
              </span>
              <span className="hidden text-xs font-medium sm:block">{label}</span>
              {index < 2 && <span className="ml-auto h-px flex-1 bg-story-ink/15" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScreenShell({ role, title, helper, children }: { role: string; title: string; helper: string; children: ReactNode }) {
  return (
    <section className="min-h-[calc(100svh-8rem)] bg-story-mist px-5 py-10 text-story-ink sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase text-story-coral-deep">{role}</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-story-ink/75">{helper}</p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}

export function ChoiceButton({ selected, onClick, compact = false, className = "", children }: { selected: boolean; onClick: () => void; compact?: boolean; className?: string; children: ReactNode }) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={selected}
      onClick={onClick}
      className={`${compact ? "h-auto min-h-11 px-4 py-2" : "h-auto min-h-14 p-4"} rounded-sm border-2 whitespace-normal shadow-none ${selected ? "border-story-ink bg-story-lime text-story-ink hover:bg-story-lime/90" : "border-story-ink/15 bg-story-paper text-story-ink hover:bg-story-yellow"} ${className}`}
    >
      {selected && <Check className="size-4" />}
      {children}
    </Button>
  );
}

export function FooterAction({ label, onClick, disabled = false, secondary }: { label: string; onClick: () => void; disabled?: boolean; secondary?: ReactNode }) {
  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-story-ink/15 pt-6 sm:flex-row sm:items-center">
      <Button size="lg" className="h-13 w-full rounded-sm bg-story-ink px-7 text-base text-story-paper hover:bg-story-ink/90 sm:w-auto" onClick={onClick} disabled={disabled}>
        {label} <ChevronRight />
      </Button>
      {secondary}
    </div>
  );
}

export function StoryToken({ theme, small = false }: { theme: StoryTheme; small?: boolean }) {
  return (
    <div
      className={`${small ? "size-16" : "size-36"} story-token relative flex shrink-0 items-center justify-center rounded-full border-4 border-story-ink text-story-ink`}
      style={{ backgroundColor: theme.color }}
      aria-hidden
    >
      <span className={`${small ? "text-2xl" : "text-6xl"} font-display`}>{theme.label === "Dinosaurs" ? "◭" : theme.label === "Space" ? "✦" : "●"}</span>
    </div>
  );
}

export function Handoff({ theme, eyebrow, title, body, action, onContinue }: { theme: StoryTheme; eyebrow: string; title: string; body: string; action: string; onContinue: () => void }) {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-story-blue px-5 py-12 text-story-paper sm:px-8">
      <div className="story-handoff-orbit absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-story-paper/15" />
      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-story-lime">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-none sm:text-7xl">{title}</h1>
          <p className="mt-6 max-w-lg text-lg text-story-paper/85">{body}</p>
          <Button size="lg" className="mt-9 h-14 rounded-sm bg-story-coral px-8 text-story-ink hover:bg-story-coral/90" onClick={onContinue}>
            {action} <ChevronRight />
          </Button>
        </div>
        <StoryToken theme={theme} />
      </div>
    </section>
  );
}

type Rec = ReturnType<typeof useRecorder>;

/** Tap-to-start / tap-to-stop recorder panel, or hold-to-record when `hold` is set. */
export function RecorderPanel({ rec, idleLabel, hold = false, maxSeconds, saving = false }: { rec: Rec; idleLabel: string; hold?: boolean; maxSeconds?: number; saving?: boolean }) {
  if (rec.state === "recording") {
    return (
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          aria-label="Stop recording"
          onClick={hold ? undefined : rec.stop}
          onPointerUp={hold ? rec.stop : undefined}
          onPointerLeave={hold ? rec.stop : undefined}
          className="story-recording-pulse flex size-24 items-center justify-center rounded-full bg-story-coral text-story-ink"
        >
          {hold ? <span className="font-display text-2xl">REC</span> : <Square className="size-8 fill-current" />}
        </button>
        <p className="mt-4 font-semibold">
          Recording · {Math.floor(rec.elapsed)}s{maxSeconds ? ` of ${maxSeconds}s` : ""}
        </p>
        <p className="mt-1 text-sm opacity-80">{hold ? "Let go to stop." : "Tap to stop."}</p>
      </div>
    );
  }
  if (rec.state === "ready" && rec.url) {
    return (
      <div className="flex w-full flex-col items-center text-center">
        <Check className="size-10 text-story-lime" />
        <p className="mt-3 font-semibold">{saving ? "Saving…" : "The recording is ready."}</p>
        <audio src={rec.url} controls className="mt-5 w-full" />
        <Button variant="outline" disabled={saving} className="mt-4 rounded-sm border-current bg-transparent text-current hover:bg-story-paper/10" onClick={rec.clear}>
          <RotateCcw /> Record again
        </Button>
      </div>
    );
  }
  if (rec.state === "denied") {
    return (
      <div className="flex flex-col items-center text-center">
        <Mic className="size-10" />
        <p className="mt-3 font-semibold">The microphone is blocked.</p>
        <p className="mt-2 text-sm opacity-85">Allow the microphone in your browser. Then try again.</p>
        <Button className="mt-5 rounded-sm bg-story-paper text-story-ink hover:bg-story-paper/90" onClick={rec.start}>Try again</Button>
      </div>
    );
  }
  if (rec.state === "unsupported") {
    return (
      <div className="flex flex-col items-center text-center">
        <Mic className="size-10" />
        <p className="mt-3 font-semibold">This browser cannot record audio.</p>
        <p className="mt-2 text-sm opacity-85">Open this link in Chrome or Safari.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        aria-label={idleLabel}
        disabled={rec.state === "requesting"}
        onClick={hold ? undefined : rec.start}
        onPointerDown={hold ? rec.start : undefined}
        onPointerUp={hold ? rec.stop : undefined}
        onContextMenu={(e) => e.preventDefault()}
        className="flex size-24 touch-none select-none items-center justify-center rounded-full bg-story-coral text-story-ink transition-transform active:scale-95"
      >
        <Mic className="size-9" />
      </button>
      <p className="mt-5 font-semibold">{rec.state === "requesting" ? "Opening the microphone…" : idleLabel}</p>
    </div>
  );
}
