import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download, Share2, Video } from "lucide-react";
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

Share this with someone you want to have more intentional moments with✨`;
const CAROUSEL_RUN = "Even though this is sort of first person pov, this can be posted on memreel IG and boosted. That is because it is much polished and looks like a post rather than a clip from a parent.";

const GRID_CAPTION = `A photo brings back what you remember, but what might your spouse add? You know she was playing with sand, but castle or not may be a mystery… until someone else remembers that part.

Tonight, pick a photo from a moment you shared, be it about your kids or a picnic. Tell your spouse one thing you remember and ask for theirs to see what else comes back.

Your loved ones hold the remaining picture. Share your half with them, and start the full experience.`;
const GRID_HOOKS = ["Simply remove the first line and the caption works as is with CTA changed.", "Your loved ones hold the remaining picture <3", "You were not the only one there, why be the only one reminiscing?"];

function CopyButton({ text, label = "Copy caption" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button size="sm" variant="outline" className="rounded-sm shadow-none" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? <Check /> : <Copy />} {done ? "Copied" : label}
    </Button>
  );
}

const RUN_STEPS: Record<number, [string, string][]> = {
  1: [
    ["Before launch", "pick the final variant (the deck's recommendation is the reel with the copy together in one line; choice not yet confirmed) and use that exported file from this page - the deck screenshots are references, not launch assets. Lock the caption shown above. Set up the dark ad in Meta. Objective, audience, budget, duration, placements, launch date and who approves them are all unresolved - no spend until they are approved."],
    ["During", "check and reply to the ad's comments using the comment-management controls available for that ad in Meta. Confirm access before launch; don't rely only on profile notifications."],
    ["After", "report the engagement numbers (comments, tags, shares). Note for reading results: these show the ad's reach and engagement; they do not by themselves show whether couples actually had the private two-person exchange the brief tests."],
  ],
  2: [
    ["Before launch", "use the six exported slide files from this page in order. Lock the caption shown above. The plan is an organic Memreel Instagram brand post; any later boost is a separate decision, not part of the one dark ad. Do not boost unless separately approved. Boost parameters (audience, budget, duration), launch date and who approves them are unresolved - no spend until approved."],
    ["During", "watch shares and comments on the post; the counted signal for this creative is shares."],
    ["After", "report the engagement numbers. Note for reading results: shares and comments show reach and engagement; they do not by themselves show whether couples actually had the private two-person exchange the brief tests."],
  ],
  3: [
    ["Before launch", "use the exported grid image from this page. Lock the caption shown above, including the opening-hook choice (the hook options listed here; the choice is still open). The plan is an organic Memreel Instagram brand post; any later boost is a separate decision, not part of the one dark ad. Do not boost unless separately approved. Confirm the 05 experience link (shown under this block) is live and opens the experience. Boost parameters (audience, budget, duration), launch date and who approves them are unresolved - no spend until approved."],
    ["During", "watch link clicks, shares and comments. Spot-check that the experience link opens correctly."],
    ["After", "report the engagement numbers, plus the experience funnel for 05-tagged traffic (invitations created, invites opened, contributions saved). Note for reading results: the funnel shows recorded visits and contributions; the brief's strong signal (both people added something, and something new came up) needs actual feedback from people who tried it, not event counts alone. Read both against the brief's kill signals (\"we already do this\"; only one person adds anything)."],
  ],
};

const EXPERIENCE_URL = "https://capture-remember.lovable.app/one-photo-two-memories";

function Block({ n, title, kind, children, caption, run, extra }: { n: number; title: string; kind: string; children: ReactNode; caption: string; run?: string; extra?: ReactNode }) {
  return (
    <section className="border-t border-border py-12">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-semibold uppercase text-primary">Block {n} · {kind}</p>
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Draft creative - under review</span>
      </div>
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
      <div className="mt-6 border border-border bg-card p-6">
        <h3 className="font-semibold">Run instructions</h3>
        <ul className="mt-3 space-y-3 leading-relaxed text-foreground/85">
          {(RUN_STEPS[n] ?? []).map(([k, v]) => <li key={k}><span className="font-semibold text-foreground">{k}:</span> {v}</li>)}
        </ul>
      </div>
      {n === 3 && (
        <div className="mt-6 border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">The link this campaign uses</h3><CopyButton text={EXPERIENCE_URL} label="Copy link" /></div>
          <p className="mt-3 break-all font-mono text-sm">{EXPERIENCE_URL}</p>
        </div>
      )}
    </section>
  );
}

function ShareCarousel() {
  const [done, setDone] = useState(false);
  const share = async () => {
    window.__lovableEvents?.track?.("project.opt2m_carousel_shared", { src: "opt2m" });
    const url = `${window.location.origin}/one-photo-two-memories/socials`;
    try {
      if (navigator.share) await navigator.share({ title: "One Photo, Two Memories", url });
      else { await navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 1600); }
    } catch { /* user closed the share sheet */ }
  };
  return (
    <div className="border border-border bg-card p-6">
      <h3 className="font-semibold">Signal: shares</h3>
      <p className="mt-3 leading-relaxed text-foreground/85">This carousel does not lead into the flow. We count shares.</p>
      <Button onClick={share} size="sm" className="mt-4 rounded-sm">{done ? <Check /> : <Share2 />} {done ? "Link copied" : "Share"}</Button>
    </div>
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
                  <video src={v.src} controls playsInline className={`w-full ${v.shape === "portrait" ? "aspect-[4/5]" : "aspect-[25/18]"} bg-muted object-contain`} />
                ) : (
                  <div className={`flex w-full flex-col items-center justify-center gap-2 border border-dashed border-border text-muted-foreground ${v.shape === "portrait" ? "aspect-[4/5]" : "aspect-[25/18]"}`}>
                    <Video className="size-7" /><span className="text-sm">Video coming soon</span>
                  </div>
                )}
                <figcaption className="mt-3 flex items-center justify-between text-sm">{v.label}{v.src && <Dl href={v.src} />}</figcaption>
              </figure>
            ))}
          </div>
        </Block>

        <Block n={2} title="Unblurring" kind="Carousel, 6 slides" caption={CAROUSEL_CAPTION} run={CAROUSEL_RUN} extra={<ShareCarousel />}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
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
