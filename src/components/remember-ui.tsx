import type { CSSProperties, ReactNode } from "react";

export function RememberShell({ children, tone = "paper" }: { children: ReactNode; tone?: "ink" | "paper" }) {
  return (
    <main className={`min-h-screen ${tone === "ink" ? "bg-story-ink text-story-paper" : "bg-story-paper text-story-ink"}`}>
      <div className="mx-auto max-w-xl px-5 py-8 sm:py-14">{children}</div>
    </main>
  );
}

export function Eyebrow({ children, tone = "paper" }: { children: ReactNode; tone?: "ink" | "paper" }) {
  return <p className={`text-sm font-semibold uppercase ${tone === "ink" ? "text-story-yellow" : "text-story-coral-deep"}`}>{children}</p>;
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
    <div className="rw-settle border border-story-ink/15 bg-card p-6 shadow-[0_18px_40px_-24px_var(--story-ink)] sm:p-8">
      <p className="text-xs font-semibold uppercase text-story-coral-deep">{title}</p>
      <p className="mt-3 whitespace-pre-line font-display text-2xl leading-snug">{story}</p>
    </div>
  );
}

export function BigButton({ children, onClick, disabled, variant = "solid" }: { children: ReactNode; onClick: () => void; disabled?: boolean; variant?: "solid" | "outline" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-16 w-full items-center justify-center rounded-sm px-6 text-lg font-semibold transition active:scale-[0.98] disabled:opacity-50 ${variant === "solid" ? "bg-story-coral text-story-ink hover:bg-story-coral/90" : "border border-story-ink/30 bg-card text-story-ink hover:border-story-coral-deep"}`}
    >
      {children}
    </button>
  );
}

const MARKS = ["◐", "●", "✦", "◭", "✎"];

export function SparkCard({ children, index, onClick }: { children: ReactNode; index: number; onClick: () => void }) {
  return (
    <Rise delay={80 * index}>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-20 w-full items-center gap-5 rounded-sm border border-story-ink/15 bg-card px-5 text-left text-lg font-semibold transition hover:border-story-coral-deep active:scale-[0.98]"
      >
        <span aria-hidden className="text-3xl text-story-coral-deep">{MARKS[index % MARKS.length]}</span>
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
