import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download, Images, Lock } from "lucide-react";
import { useState } from "react";

import posterAsset from "@/assets/far-away/reel-poster.jpg.asset.json";
import towerAsset from "@/assets/far-away/tower.jpg.asset.json";
import twoHomesAsset from "@/assets/far-away/two-homes.jpg.asset.json";

const portraitArtwork = posterAsset.url;
const squareArtwork = towerAsset.url;
const wideArtwork = twoHomesAsset.url;
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/far-away-moments/socials")({
  head: () => ({
    meta: [
      { title: "Far-Away Moments social assets | MemReel" },
      { name: "description", content: "Review and download MemReel's Far-Away Moments social campaign." },
      { property: "og:title", content: "Far-Away Moments social assets | MemReel" },
      { property: "og:description", content: "Review and download MemReel's Far-Away Moments social campaign." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SocialsPage,
});

type Channel = "instagram" | "story" | "linkedin";

const CHANNELS: Record<Channel, {
  label: string;
  format: string;
  image: string;
  filename: string;
  alt: string;
  caption: string;
}> = {
  instagram: {
    label: "Instagram feed",
    format: "Square · 1:1",
    image: squareArtwork,
    filename: "memreel-far-away-instagram-feed.jpg",
    alt: "A toddler carefully stacking floor cushions",
    caption: `Three cushions high. Then he turned round to show someone.

The photo gets to Pop Pop. The shout, the wobble, the look on his face just before usually don't.

MemReel turns one photo and a few words into the moment, written the way you'd tell it.

Pick one moment that didn't quite travel.`,
  },
  story: {
    label: "Instagram story",
    format: "Portrait · 9:16",
    image: portraitArtwork,
    filename: "memreel-far-away-instagram-story.jpg",
    alt: "A boy turning round to show off his cushion tower",
    caption: `Frame 1: He turned round to show someone.

Frame 2: Four thousand miles away, Pop Pop was already clapping.

Frame 3: Send the photo and what happened right before it.

Link text: Try it with one photo`,
  },
  linkedin: {
    label: "LinkedIn",
    format: "Landscape · 16:9",
    image: wideArtwork,
    filename: "memreel-far-away-linkedin.jpg",
    alt: "A boy in his hallway and his grandfather laughing at breakfast in another home",
    caption: `Families with grandparents far away send a lot of photos. In our conversations with parents, the same thing kept coming up: the photo arrives, but the story around it doesn't.

What they said right before. Why it was funny. The bit you'd tell if you were in the same room.

So we built a small MemReel experiment. You choose one photo, tap a prompt, and add a few words. MemReel writes it up for the person it's for, using only your facts, and you check it before anything is saved.

The signal we care about: does the parent say "this is right" and keep it?`,
  },
};

function SocialsPage() {
  const [active, setActive] = useState<Channel>("instagram");
  const [copied, setCopied] = useState(false);
  const channel = CHANNELS[active];

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(channel.caption);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = channel.caption;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      const didCopy = document.execCommand("copy");
      textArea.remove();
      if (didCopy) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link to="/" className="font-display text-2xl" aria-label="MemReel experiments">
            Mem<span className="text-primary">Reel</span>
          </Link>
          <span className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" /> Internal review</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Far-Away Moments</p>
            <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">Social campaign assets</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">Draft wording for your review. Read the captions, then download what you need.</p>
          </div>
          <Button asChild className="h-11 rounded-sm shadow-none">
            <a href="/downloads/memreel-far-away-social-assets.zip" download>
              <Images /> Download all
            </a>
          </Button>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Social platforms">
          {(Object.keys(CHANNELS) as Channel[]).map((key) => (
            <Button
              key={key}
              type="button"
              role="tab"
              aria-selected={active === key}
              variant={active === key ? "default" : "outline"}
              onClick={() => { setActive(key); setCopied(false); }}
              className="shrink-0 rounded-sm shadow-none"
            >
              {CHANNELS[key].label}
            </Button>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,.95fr)] lg:items-start">
          <div className="bg-secondary p-4 sm:p-8">
            <img
              src={channel.image}
              alt={channel.alt}
              className={`mx-auto max-h-[720px] w-full object-contain ${active === "story" ? "max-w-sm" : "max-w-2xl"}`}
            />
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">{channel.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{channel.format}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-sm shadow-none">
                <a href={channel.image} download={channel.filename}><Download /> Image</a>
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl">Caption</h2>
              <Button type="button" variant="outline" size="sm" onClick={copyCaption} className="rounded-sm shadow-none">
                {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="mt-4 max-h-[32rem] overflow-y-auto border border-border bg-card p-5 text-sm leading-relaxed whitespace-pre-line sm:p-6">
              {channel.caption}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}