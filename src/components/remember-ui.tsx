import type { ReactNode } from "react";

export function RememberShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-story-paper text-story-ink">
      <div className="mx-auto max-w-xl px-5 py-8 sm:py-14">{children}</div>
    </main>
  );
}

export function StoryCard({ title, story }: { title: string; story: string }) {
  return (
    <div className="border-2 border-story-ink bg-card p-5 shadow-[6px_6px_0_var(--story-ink)]">
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
      className={`w-full rounded-sm px-5 py-4 text-left text-lg font-semibold transition disabled:opacity-50 ${variant === "solid" ? "bg-story-ink text-story-paper hover:bg-story-ink/90" : "border-2 border-story-ink bg-card hover:bg-story-mist"}`}
    >
      {children}
    </button>
  );
}

export function nomineeLink() {
  const url = `${window.location.origin}/one-story-together/remember-when?from=nominee`;
  const text = `I just told my little one a story about when they were tiny. What's the first story yours would ask about? ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
