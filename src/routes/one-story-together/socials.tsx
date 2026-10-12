import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download, Film, Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import campaignPackage from "@/assets/one-story-together/distance-campaign-package.zip.asset.json";
import squareCover from "@/assets/one-story-together/distance-square-cover.png.asset.json";
import squareVideo from "@/assets/one-story-together/distance-square-video.mp4.asset.json";
import verticalCover from "@/assets/one-story-together/distance-vertical-cover.png.asset.json";
import verticalVideo from "@/assets/one-story-together/distance-vertical-video.mp4.asset.json";

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
  instagram: `Your child is three.\n\nAt bedtime, you remember how Daadi told you Panchatantra stories until you fell asleep.\n\nNow, an ocean separates them. Childhood will not wait for the next visit.\n\nWith MemReel, Daadi can tell those stories in her own voice. Your child can listen, choose, and become part of them.\n\nOne Story, Together. Bring Daadi into story time.`,
  linkedin: `Your child is three. At bedtime, you remember the Panchatantra stories Daadi told you until you fell asleep.\n\nNow, Daadi and your child live an ocean apart. Calls help. Visits matter. But childhood keeps moving between them.\n\nMemReel brings Daadi into story time now. She tells a story in her own voice. Your child listens, makes a choice, and becomes part of it.\n\nOne Story, Together. Bring far-away grandparents into story time.`,
};

function CampaignReview() {
  const [active, setActive] = useState<Format>("vertical");
  const [copied, setCopied] = useState(false);
  const isCopy = active === "instagram" || active === "linkedin";
  const isSquare = active === "square";
  const activeVideo = isSquare ? squareVideo : verticalVideo;
  const activeCover = isSquare ? squareCover : verticalCover;

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
          <h1 className="mt-3 max-w-4xl font-display text-5xl leading-tight sm:text-6xl">Campaign creatives</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">A distance-led story about bringing Daadi into story time now. No AI images are used.</p>
          <div className="mt-6 inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            <Film className="size-4 text-primary" /> Two final 21-second videos with captions and sound.
          </div>
          <Button asChild className="mt-6 rounded-sm shadow-none sm:ml-3 sm:mt-0">
            <a href={campaignPackage.url} download><Download /> Download all assets</a>
          </Button>
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
              <video
                key={active}
                className={`block h-auto w-full bg-story-ink shadow-xl ${isSquare ? "max-w-[34rem]" : "max-w-[21rem]"}`}
                controls
                playsInline
                preload="metadata"
                poster={activeCover.url}
              >
                <source src={activeVideo.url} type="video/mp4" />
                Your browser cannot play this video.
              </video>
            )}
          </div>

          <aside className="lg:sticky lg:top-8">
            <p className="text-xs font-semibold uppercase text-primary">{isCopy ? "Campaign copy" : "Final motion asset"}</p>
            <h2 className="mt-2 font-display text-4xl">{isCopy ? (active === "instagram" ? "Instagram" : "LinkedIn") : "Childhood will not wait."}</h2>
            {isCopy ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-sm shadow-none" onClick={copyText}>{copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy text"}</Button>
                <Button asChild variant="outline" className="rounded-sm shadow-none">
                  <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(COPY[active])}`} download={`one-story-together-${active}.txt`}><Download /> Download text</a>
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-6 border-t border-border pt-6 text-sm text-muted-foreground">
                <div className="overflow-hidden border border-border bg-card">
                  <img src={activeCover.url} alt={`${isSquare ? "Square" : "Vertical"} One Story, Together campaign cover with a Start their story invitation.`} className="h-auto w-full" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-sm shadow-none"><a href={activeVideo.url} download><Download /> Download video</a></Button>
                  <Button asChild variant="outline" className="rounded-sm shadow-none"><a href={activeCover.url} download><Download /> Download cover</a></Button>
                </div>
                <p className="border-t border-border pt-5">Captions carry the full message without sound. Music and effects are included.</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
