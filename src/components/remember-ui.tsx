import type { CSSProperties, ReactNode } from "react";
import { Lock } from "lucide-react";

export function MemHeader({ overPhoto = false }: { overPhoto?: boolean }) {
  return (
    <header className={`${overPhoto ? "absolute inset-x-0 top-0 z-20 text-primary-foreground [@media(min-aspect-ratio:3/4)]:text-foreground" : "text-foreground"} mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12`}>
      <a href="https://memreel.io/" className="font-display text-2xl drop-shadow-sm" aria-label="MemReel home">
        Mem<span className="font-sans text-base font-semibold">Reel</span>
      </a>
      <span className={`flex items-center gap-2 text-xs font-medium drop-shadow-sm ${overPhoto ? "[@media(min-aspect-ratio:3/4)]:text-primary-foreground" : ""}`}>
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
              <p className="mt-1 text-sm text-muted-foreground">Step {step} of 3</p>
            </div>
            <div className="flex gap-1.5" aria-hidden>
              {[1, 2, 3].map((i) => (
                <span key={i} className={`h-1.5 w-12 ${i <= step ? "bg-primary" : "bg-border"}`} />
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

export function StoryCard({ title, story }: { title: string; story: string }) {
  return (
    <div className="rw-settle border-l-2 border-primary bg-secondary px-6 py-5 shadow-lg">
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

export function SparkCard({ children, index, onClick }: { children: ReactNode; index: number; onClick: () => void }) {
  return (
    <Rise delay={70 * index}>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-16 w-full items-center rounded-sm border border-border bg-background px-5 py-4 text-left text-base font-medium transition hover:border-primary hover:bg-secondary active:scale-[0.98]"
      >
        {children}
      </button>
    </Rise>
  );
}

export function nomineeLink() {
  const url = `${window.location.origin}/one-story-together/remember-when?from=nominee`;
  const text = `I just told my little one a story about when they were tiny. What's the first story yours would ask about? ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function familyLink(title: string, story: string, token: string) {
  const url = `${window.location.origin}/one-story-together/remember-when/${token}`;
  const text = `I'm telling our little one this tonight: ${title}.\n\n"${story}"\n\nAdd what you remember: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
