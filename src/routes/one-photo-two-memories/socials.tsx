import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download, Video } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { GRID_IMAGE, UNBLUR_SLIDES, VIDEO_SLOTS } from "@/lib/opt2m-creatives";

export const Route = createFileRoute("/one-photo-two-memories/socials")({
  head: () => ({
    meta: [
      { title: "One Photo, Two Memories - creatives | MemReel" },
      { name: "description", content: "Creatives for One Photo, Two Memories by MemReel." },
      { property: "og:title", content: "One Photo, Two Memories - creatives" },
      { property: "og:description", content: "What if the photo only brings back half of the memory?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Socials,
});

const VIDEO_CAPTION = `I asked my spouse the question & I lived the moment from her eyes too.

Going down the memory lane with your family is the best bonding activity out there. Both of us saw the one moment with such different lenses because while I exclaimed with joy, hers had a pinch of sadness. She was sad to see them grow older so fast while I was happy to see the light in their eyes.

Pick a picture, drop it in the comments and tag your loved ones for their side of the moment!`;
const VIDEO_RUN = "Run dark ads on the reel version with copy together in one line. Dark ads because the tone is from a first person pov (not suitable for brand page) and reel because it has a more cinematic vibe. The one with copy together because it is easier to read.";

const CAROUSEL_CAPTION = `What is a memory if not an amalgamation of povs?🥹🫂

I probably would've never realised my daughter loved pockets so much had my wife never joined in the convo. This had me thinking that maybe this could be a regular fun activity for us. So from now on, we discuss memories over pictures & pizzas!

Share this to the one you wanna have more tiny intentional moments with✨`;
const CAROUSEL_RUN = "Even though this is sort of first person pov, this can be posted on memreel IG and boosted. That is because it is much polished and looks like a post rather than a clip from a parent.";

const GRID_CAPTION = `A photo brings back what you remember, but what might your spouse add? You know she was playing with sand, but castle or not may be a mystery… until someone else remembers that part.

Tonight, pick a photo from a moment you shared, be it about your kids or a picnic. Tell your spouse one thing you remember and ask for theirs to see what else comes back.

Comment "memory" for the link to a mystery tool!`;
const GRID_HOOKS = ["Simply remove the first line and the caption works as is with CTA changed.", "Your loved ones hold the remaining picture <3", "You were not the only one there, why be the only one reminiscing?"];

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button size="sm" variant="outline" className="rounded-sm shadow-none" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? <Check /> : <Copy />} {done ? "Copied" : "Copy caption"}
    </Button>
  );
}

function Block({ n, title, kind, children, caption, run, extra }: { n: number; title: string; kind: string; children: ReactNode; caption: string; run?: string; extra?: ReactNode }) {
  return (
    <section className="border-t border-border py-12">
      <p className="text-xs font-semibold uppercase text-primary">Block {n} · {kind}</p>
      <h2 className="mt-2 font-display text-4xl">{title}</h2>
      <div className="mt-8">{children}</div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Caption</h3><CopyButton text={caption} /></div>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/85">{caption}</p>
        </div>
        <div className="space-y-6">
          {run && <div className="border border-border bg-card p-6"><h3 className="font-semibold">Where to run it</h3><p className="mt-3 leading-relaxed text-foreground/85">{run}</p></div>}
          {extra}
        </div>
      </div>
    </section>
  );
}

function Dl({ href }: { href: string }) {
  return <Button asChild size="sm" variant="outline" className="rounded-sm shadow-none"><a href={href} download><Download /> Download</a></Button>;
}

function Socials() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="font-display text-2xl">Mem<span className="font-sans text-base font-semibold">Reel</span></Link>
          <span className="text-xs text-muted-foreground">05</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="py-14">
          <h1 className="font-display text-5xl leading-tight">One Photo, Two Memories - creatives</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">Creatives and their run instructions are being added one at a time.</p>
        </div>

        <Block n={1} title="Video" kind="Reel or gif" caption={VIDEO_CAPTION} run={VIDEO_RUN}>
          <div className="grid items-start gap-6 sm:grid-cols-3">
            {VIDEO_SLOTS.map((v) => (
              <figure key={v.label} className="border border-border bg-card p-3">
                {v.src ? (
                  <video src={v.src} controls playsInline className={`w-full ${v.shape === "square" ? "aspect-square" : "aspect-video"} object-cover`} />
                ) : (
                  <div className={`flex w-full flex-col items-center justify-center gap-2 border border-dashed border-border text-muted-foreground ${v.shape === "square" ? "aspect-square" : "aspect-video"}`}>
                    <Video className="size-7" /><span className="text-sm">Video coming soon</span>
                  </div>
                )}
                <figcaption className="mt-3 flex items-center justify-between text-sm">{v.label}{v.src && <Dl href={v.src} />}</figcaption>
              </figure>
            ))}
          </div>
        </Block>

        <Block n={2} title="Unblurring" kind="Carousel, 7 slides" caption={CAROUSEL_CAPTION} run={CAROUSEL_RUN}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {UNBLUR_SLIDES.map((src, i) => (
              <figure key={src} className="border border-border bg-card p-2">
                <img src={src} alt={`Unblurring slide ${i + 1}`} className="h-auto w-full" />
                <figcaption className="mt-2 flex flex-col gap-2 text-sm">Slide {i + 1}<Dl href={src} /></figcaption>
              </figure>
            ))}
          </div>
        </Block>

        <Block
          n={3}
          title="Grid"
          kind="Static"
          caption={GRID_CAPTION}
          extra={<div className="border border-border bg-card p-6"><h3 className="font-semibold">Hook options</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/85">{GRID_HOOKS.map((h) => <li key={h}>{h}</li>)}</ul></div>}
        >
          <figure className="max-w-md border border-border bg-card p-3">
            <img src={GRID_IMAGE} alt="What if the photo only brings back half of the memory?" className="h-auto w-full" />
            <figcaption className="mt-3 flex items-center justify-between text-sm">Grid<Dl href={GRID_IMAGE} /></figcaption>
          </figure>
        </Block>
      </div>
    </main>
  );
}
