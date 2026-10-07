import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download, Images, Lock } from "lucide-react";
import { useState } from "react";

import portraitArtwork from "@/assets/journal-social-portrait.jpg";
import squareArtwork from "@/assets/journal-social-square.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/journal/socials")({
  head: () => ({
    meta: [
      { title: "Journal Context social assets | MemReel" },
      { name: "description", content: "Review and download MemReel's Journal Context social campaign." },
      { property: "og:title", content: "Journal Context social assets | MemReel" },
      { property: "og:description", content: "Review and download MemReel's Journal Context social campaign." },
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
    filename: "memreel-journal-instagram-feed.jpg",
    alt: "A mother recording a short voice note at the kitchen table while her toddler draws",
    caption: `Thirty seconds about your day.

The swim lesson. The thing she said in the car. Why you kept thinking about your dad.

MemReel listens to the little highlights and brings back the photo that belongs with them.

Tell it about today. It remembers the rest.`,
  },
  story: {
    label: "Instagram story",
    format: "Portrait · 4:5",
    image: portraitArtwork,
    filename: "memreel-journal-instagram-portrait.jpg",
    alt: "A father on the sofa with a handwritten notebook beside a printed photo of a grandfather and toddler at a lake",
    caption: `Frame 1: You wrote about him three times this week.

Frame 2: MemReel noticed.

Frame 3: Here’s the day at the lake.

Link text: Try 30 seconds tonight`,
  },
  linkedin: {
    label: "LinkedIn",
    format: "Square · 1:1",
    image: squareArtwork,
    filename: "memreel-journal-linkedin.jpg",
    alt: "A mother recording a short voice note at the kitchen table while her toddler draws",
    caption: `In our interviews with parents, one pattern kept coming up: people rarely go looking for old photos. Something in their day sends them there.

A song in the car. A first swim lesson. A week of missing someone.

Photo apps resurface memories by date. We wondered what would happen if they surfaced them by what is actually on your mind.

So we built a small MemReel experiment. You give it thirty seconds about your day: a voice note, a paste from the notes app you already use, or a photo of a notebook page. It reads the last week or so, privately, and brings back the photo that fits.

The signal we care about is simple: does the memory feel right?`,
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
            <p className="text-xs font-semibold uppercase text-primary">Journal Context</p>
            <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">Social campaign assets</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">Review the approved artwork and copy, then download what you need.</p>
          </div>
          <Button asChild className="h-11 rounded-sm shadow-none">
            <a href="/downloads/memreel-journal-social-assets.zip" download>
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
              className={`mx-auto max-h-[720px] w-full object-contain ${active === "story" ? "max-w-xl" : "max-w-2xl"}`}
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