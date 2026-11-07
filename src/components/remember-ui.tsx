import { useState, type CSSProperties, type ReactNode } from "react";
import { Lock } from "lucide-react";

export function MemHeader({ overPhoto = false }: { overPhoto?: boolean }) {
  return (
    <header className={`${overPhoto ? "absolute inset-x-0 top-0 z-20 text-primary-foreground [@media(min-aspect-ratio:3/4)]:text-foreground" : "text-foreground"} mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12`}>
      <a href="https://memreel.io/" className="font-display text-2xl drop-shadow-sm" aria-label="MemReel home">
        Mem<span className="font-sans text-base font-semibold">Reel</span>
      </a>
      <span className={`flex items-center gap-2 text-xs font-medium drop-shadow-sm `}>
        <Lock className="size-3.5" /> Private to you
      </span>
    </header>
  );
}

export function RememberShell({ children, step }: { children: ReactNode; step?: number }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <MemHeader />
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
        {step !== undefined && (
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">Your story</p>
              <p className="mt-1 text-sm text-muted-foreground">Step {step} of 4</p>
            </div>
            <div className="flex gap-1.5" aria-hidden>
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={`h-1.5 w-9 sm:w-12 ${i <= step ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}

export function Rise({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`rw-rise ${className}`} style={{ animationDelay: `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

export function StoryCard({ title, story, photoUrl }: { title: string; story: string; photoUrl?: string | null | undefined }) {
  return (
    <div className="rw-settle border-l-2 border-primary bg-secondary px-6 py-5 shadow-lg">
      {photoUrl && <img src={photoUrl} alt="The photo this story is about" className="mb-5 max-h-80 w-auto rotate-[-1.5deg] border-[6px] border-background object-contain shadow-md" />}
      <p className="text-xs font-semibold uppercase text-primary">{title}</p>
      <p className="mt-3 whitespace-pre-line font-display text-2xl leading-snug">“{story}”</p>
    </div>
  );
}

export function BigButton({ children, onClick, disabled, variant = "solid" }: { children: ReactNode; onClick: () => void; disabled?: boolean; variant?: "solid" | "outline" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14 w-full items-center justify-center rounded-sm px-6 text-base font-semibold transition active:scale-[0.98] disabled:opacity-50 ${variant === "solid" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border bg-background text-foreground hover:border-primary"}`}
    >
      {children}
    </button>
  );
}

export function SparkCard({ children, index, onClick, art }: { children: ReactNode; index: number; onClick: () => void; art: ReactNode }) {
  const [picked, setPicked] = useState(false);
  return (
    <Rise delay={70 * index} className={index === 4 ? "col-span-2 mx-auto w-[calc(50%-0.375rem)]" : ""}>
      <button
        type="button"
        onClick={() => {
          setPicked(true);
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.setTimeout(onClick, reduce ? 0 : 480);
        }}
        className={`flex h-full w-full flex-col items-center rounded-sm border-2 bg-background p-3 text-center text-sm font-semibold leading-snug transition hover:border-primary hover:bg-secondary active:scale-[0.98] sm:p-4 sm:text-base ${picked ? "border-primary bg-secondary" : "border-border"}`}
      >
        <span className={`block aspect-square w-full max-w-24 sm:max-w-36 ${picked ? "rw-wiggle" : ""}`}>{art}</span>
        <span className="mt-2">{children}</span>
      </button>
    </Rise>
  );
}

const SHARE_ORIGIN = "https://capture-remember.lovable.app";

export function nomineeLink() {
  const url = `${SHARE_ORIGIN}/remember-when?from=nominee`;
  const text = `I just told my little one a story about when they were tiny. What's the first story yours would ask about? ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function familyLink(title: string, story: string, token: string) {
  const url = `${SHARE_ORIGIN}/remember-when/${token}`;
  const text = `I'm telling our little one this tonight: ${title}.\n\n"${story}"\n\nAdd what you remember: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
