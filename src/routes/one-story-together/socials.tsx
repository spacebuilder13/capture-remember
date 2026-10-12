import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Film, Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/one-story-together/socials")({
  head: () => ({
    meta: [
      { title: "One Story, Together campaign | MemReel" },
      { name: "description", content: "Review campaign 04 motion concepts and copy for One Story, Together." },
      { property: "og:title", content: "One Story, Together campaign | MemReel" },
      { property: "og:description", content: "Review campaign 04 motion concepts and copy for One Story, Together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CampaignReview,
});

type Format = "vertical" | "square" | "instagram" | "linkedin";

const COPY: Record<"instagram" | "linkedin", string> = {
  instagram: `A parent starts the story.\nA grandparent gives it a voice.\nA child chooses what happens next.\n\nThree people finish one story.\n\nTry One Story, Together by MemReel.`,
  linkedin: `Can one small story bring three people into the same moment?\n\nWe built a MemReel prototype to test this. A parent chooses what the child likes. A grandparent records a prepared story. The child listens, chooses, and plays a part.\n\nThe signal is simple: does the family complete the story together?`,
};

function CampaignReview() {
  const [active, setActive] = useState<Format>("vertical");
  const [copied, setCopied] = useState(false);
  const isCopy = active === "instagram" || active === "linkedin";

  const copyText = async () => {
    if (!isCopy) return;
    await navigator.clipboard.writeText(COPY[active]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link to="/" className="font-display text-2xl">Mem<span className="text-primary">Reel</span></Link>
          <span className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" /> Internal review</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="border-b border-border pb-10">
          <p className="text-xs font-semibold uppercase text-primary">Campaign 04 · One Story, Together</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl leading-tight sm:text-6xl">Motion campaign direction</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">Draft wording and motion studies for review. No AI images are used.</p>
          <div className="mt-6 inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            <Film className="size-4 text-primary" /> Final videos will be rendered after the wording is approved.
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 pb-2" role="tablist" aria-label="Campaign review">
          {(["vertical", "square", "instagram", "linkedin"] as Format[]).map((key) => (
            <Button key={key} type="button" role="tab" aria-selected={active === key} variant={active === key ? "default" : "outline"} className="shrink-0 rounded-sm shadow-none" onClick={() => { setActive(key); setCopied(false); }}>
              {key === "vertical" ? "Vertical motion" : key === "square" ? "Square motion" : key === "instagram" ? "Instagram copy" : "LinkedIn copy"}
            </Button>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,.9fr)] lg:items-start">
          <div className="flex min-h-[38rem] items-center justify-center bg-secondary p-4 sm:p-8">
            {isCopy ? (
              <div className="w-full max-w-xl border border-border bg-card p-6 text-sm leading-relaxed whitespace-pre-line sm:p-8">{COPY[active]}</div>
            ) : (
              <MotionStudy square={active === "square"} />
            )}
          </div>

          <aside className="lg:sticky lg:top-8">
            <p className="text-xs font-semibold uppercase text-primary">{isCopy ? "Draft copy" : "Animated storyboard"}</p>
            <h2 className="mt-2 font-display text-4xl">{isCopy ? (active === "instagram" ? "Instagram" : "LinkedIn") : "Three people finish one story."}</h2>
            {isCopy ? (
              <Button variant="outline" className="mt-6 rounded-sm shadow-none" onClick={copyText}>{copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy text"}</Button>
            ) : (
              <div className="mt-6 space-y-5 border-t border-border pt-6 text-sm text-muted-foreground">
                <Beat number="01" title="The parent starts it." body="A story token appears when the parent chooses a theme." />
                <Beat number="02" title="The grandparent gives it a voice." body="Sound waves carry the token into the next scene." />
                <Beat number="03" title="The child completes it." body="The child makes a choice. All three parts join." />
                <p className="border-t border-border pt-5">Music: light rhythmic track. Sound: taps, a record cue, a page turn, and one playful finish.</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function Beat({ number, title, body }: { number: string; title: string; body: string }) {
  return <div className="grid grid-cols-[2rem_1fr] gap-3"><span className="font-display text-xl text-primary">{number}</span><div><p className="font-medium text-foreground">{title}</p><p className="mt-1">{body}</p></div></div>;
}

function MotionStudy({ square }: { square: boolean }) {
  return (
    <div className={`story-ad relative overflow-hidden bg-story-ink text-story-paper shadow-xl ${square ? "aspect-square w-full max-w-[34rem]" : "aspect-[9/16] w-full max-w-[21rem]"}`} aria-label="Animated campaign storyboard">
      <div className="story-ad-beat story-ad-beat-one absolute inset-0 flex flex-col justify-between p-[9%]">
        <p className="text-xs font-semibold uppercase text-story-yellow">One story, together</p>
        <div><p className="font-display text-[clamp(2rem,7vw,4.5rem)] leading-none">A parent<br />starts it.</p><div className="story-ad-token mt-8 size-24 rounded-full border-4 border-story-ink bg-story-lime" /></div>
      </div>
      <div className="story-ad-beat story-ad-beat-two absolute inset-0 flex flex-col justify-end bg-story-blue p-[9%]">
        <div className="story-wave mb-10 flex items-center gap-2" aria-hidden>{[1,2,3,4,5,6,7].map((x) => <span key={x} className="w-2 bg-story-coral" style={{ height: `${18 + (x % 4) * 12}px` }} />)}</div>
        <p className="font-display text-[clamp(2rem,7vw,4.5rem)] leading-none">A grandparent<br />gives it a voice.</p>
      </div>
      <div className="story-ad-beat story-ad-beat-three absolute inset-0 flex flex-col justify-between bg-story-coral p-[9%] text-story-ink">
        <div className="grid grid-cols-2 gap-3"><div className="aspect-square bg-story-yellow" /><div className="aspect-square bg-story-lime" /></div>
        <p className="font-display text-[clamp(2rem,7vw,4.5rem)] leading-none">A child<br />completes it.</p>
      </div>
      <div className="story-ad-beat story-ad-beat-four absolute inset-0 flex flex-col items-center justify-center bg-story-lime p-[9%] text-center text-story-ink">
        <div className="mb-8 flex -space-x-4"><span className="size-20 rounded-full bg-story-coral" /><span className="size-20 rounded-full bg-story-blue" /><span className="size-20 rounded-full bg-story-yellow" /></div>
        <p className="font-display text-[clamp(2.2rem,8vw,5rem)] leading-none">Three people finish one story.</p>
        <p className="mt-7 text-sm font-semibold uppercase">MemReel</p>
      </div>
    </div>
  );
}
