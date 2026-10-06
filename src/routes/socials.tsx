import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download, Images, Lock } from "lucide-react";
import { useState } from "react";

import portraitArtwork from "@/assets/memreel-social-portrait.jpg";
import squareArtwork from "@/assets/memreel-social-square.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/socials")({
  head: () => ({
    meta: [
      { title: "Social campaign assets | MemReel" },
      { name: "description", content: "Review and download MemReel's Captured ≠ Remembered social campaign." },
      { property: "og:title", content: "Social campaign assets | MemReel" },
      { property: "og:description", content: "Review and download MemReel's Captured ≠ Remembered social campaign." },
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
    filename: "memreel-instagram-feed.jpg",
    alt: "Parent and child building a blanket fort beside the words A photo can't remember for you",
    caption: `You saved the photo.

But do you remember what she said? What made you laugh? The name she gave the blanket fort?

A photo can keep the room, the faces, the light. It cannot remember the moment for you.

Preserve one memory while it is still yours to tell.`,
  },
  story: {
    label: "Instagram story",
    format: "Portrait · 4:5",
    image: portraitArtwork,
    filename: "memreel-instagram-portrait.jpg",
    alt: "Parent and child building a blanket fort with an intentionally unfinished paper edge",
    caption: `Frame 1: A photo can’t remember for you.

Frame 2: What did this photo leave out?

Frame 3: Choose one. Preserve what you still remember.

Link text: Preserve one memory`,
  },
  linkedin: {
    label: "LinkedIn",
    format: "Square · 1:1",
    image: squareArtwork,
    filename: "memreel-linkedin.jpg",
    alt: "Parent and child building a blanket fort beside the words A photo can't remember for you",
    caption: `We take thousands of photos of our children.

I have been thinking about what those photos actually preserve.

They hold the light, the faces, the room. But years later, they may not tell us what our child had just said, why everyone was laughing, or the strange little name they gave that afternoon.

The picture stayed. The story became harder to reach.

We built a small MemReel experiment around that gap. It does not ask you to document everything. It asks you to choose one ordinary photo and add the detail the image could not hold.

If you try it, the meaningful signal for us is not a like. It is whether one real photo brings one real memory forward.`,
  },
};

function SocialsPage() {
  const [active, setActive] = useState<Channel>("instagram");
  const [copied, setCopied] = useState(false);
  const channel = CHANNELS[active];

  const copyCaption = async () => {
    await navigator.clipboard.writeText(channel.caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link to="/" className="font-display text-2xl" aria-label="MemReel experiment">
            Mem<span className="text-primary">Reel</span>
          </Link>
          <span className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" /> Internal review</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Captured ≠ Remembered</p>
            <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">Social campaign assets</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">Review the approved artwork and copy, then download what you need.</p>
          </div>
          <Button asChild className="h-11 rounded-sm shadow-none">
            <a href="/downloads/memreel-social-assets.zip" download>
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