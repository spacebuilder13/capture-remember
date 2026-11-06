import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import rwSquare from "@/assets/one-story-together/remember-when/square.jpg.asset.json";
import rwStory from "@/assets/one-story-together/remember-when/story.jpg.asset.json";
import redditPortrait from "@/assets/one-story-together/remember-when/reddit-portrait.png.asset.json";
import redditSquare from "@/assets/one-story-together/remember-when/reddit-square.png.asset.json";

export const Route = createFileRoute("/remember-when/socials")({
  head: () => ({
    meta: [
      { title: "Remember When | Social posts | MemReel" },
      { name: "description", content: "Instagram and Reddit posts for Remember When by MemReel." },
      { property: "og:title", content: "Remember When | MemReel" },
      { property: "og:description", content: "One question about an old photo, and a family story tonight." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Socials,
});

const RW_CAPTION = `A two-year-old finds a photo of herself at three weeks old and wants to know everything. Who was holding her, why she looked like that and what papa did after that.\n\nThen Mum and Papa start telling it differently, and nobody goes to bed on time. What's the first story your little one would ask about? Tell it to them tonight, and tell us who joined in.`;

function RememberWhenSection() {
  const [copied, setCopied] = useState(false);
  return (
    <section className="mx-auto max-w-7xl border-t border-border px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <p className="text-xs font-semibold uppercase text-primary">Remember When</p>
      <h2 className="mt-3 font-display text-4xl sm:text-5xl">Who's that baby?</h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr_minmax(18rem,1fr)]">
        {[
          { img: rwSquare, label: "Feed (square)", src: "feed" as const },
          { img: rwStory, label: "Story (tall)", src: "story" as const },
        ].map(({ img, label, src }) => (
          <div key={src}>
            <Link to="/remember-when" search={{ src }}>
              <img src={img.url} alt={`${label} image: a family looks at a baby photo on a phone.`} className="h-auto w-full border border-border" />
            </Link>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <a href={img.url} download className="inline-flex items-center gap-1 underline"><Download className="size-4" /> Download</a>
            </div>
          </div>
        ))}
        <div>
          <div className="border border-border bg-card p-5 text-sm leading-relaxed whitespace-pre-line">{RW_CAPTION}</div>
          <Button
            variant="outline"
            className="mt-4 rounded-sm shadow-none"
            onClick={async () => {
              await navigator.clipboard.writeText(RW_CAPTION);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy caption"}
          </Button>
        </div>
      </div>
    </section>
  );
}

const REDDIT_TITLE = "What’s the one story your parents told every single time the album came out?";
const REDDIT_BODY = `My dad took all the photos in our house and he also kept every album itemized and labelled, he was really good with that.

So whenever the albums came out it was a whole thing. He’d go one photo at a time telling us what was happening, who was there, what were the highlights... then my mother would join and tell me the same story completely differently. Watching the two of them argue over who was remembering it right was the best part of it all honestly.

He never stopped doing it either. So he took pictures at my office baby shower years later and that went into an album also. It was a small party my office folks threw in the conference room. There’s a whiteboard behind everyone, people are wearing these silly things on their heads, my mother is standing there with a crown on her head for some reason, and me in the middle of it, very pregnant. My son is obsessed with this although it must be a very strange photo for a kid to look at, right?

He’s been asking what’s going on in it every few months for about three years. It’s not super deep but every time the question is one step ahead of the last one. Started with why is everyone wearing that. Then why do I look so big (because I’m pregnant). Then where was he, and I got to say 'you weren’t born'. Last time it was why don’t we see these people anymore, because half of them moved to Austin.

And then of course everyone has a different answer for him and we’re right back to the arguing.

What was yours? And has it reached your kids yet or do they have their own by now?`;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      className="mt-3 rounded-sm shadow-none"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check /> : <Copy />} {copied ? "Copied" : label}
    </Button>
  );
}

function RedditSection() {
  return (
    <section className="mx-auto max-w-7xl border-t border-border px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <p className="text-xs font-semibold uppercase text-primary">Remember When · Reddit</p>
      <h2 className="mt-3 font-display text-4xl sm:text-5xl">The album story</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Post on Reddit with the photo, and use this text as the post. Do not plant replies.</p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {[
          { img: redditPortrait, label: "Portrait (4:5)" },
          { img: redditSquare, label: "Square (1:1)" },
        ].map(({ img, label }) => (
          <div key={label}>
            <img src={img.url} alt={`${label} photo: an album print of an office baby shower on a wooden table.`} className="h-auto w-full border border-border" />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <a href={img.url} download className="inline-flex items-center gap-1 underline"><Download className="size-4" /> Download</a>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Title</p>
          <div className="mt-2 border border-border bg-card p-5 font-semibold leading-relaxed">{REDDIT_TITLE}</div>
          <CopyButton text={REDDIT_TITLE} label="Copy title" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Post text</p>
          <div className="mt-2 border border-border bg-card p-5 text-sm leading-relaxed whitespace-pre-line">{REDDIT_BODY}</div>
          <CopyButton text={REDDIT_BODY} label="Copy post text" />
        </div>
      </div>
    </section>
  );
}

function Socials() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link to="/" className="font-display text-2xl">Mem<span className="text-primary">Reel</span></Link>
          <Link to="/remember-when" className="text-xs text-muted-foreground hover:text-foreground">Remember When</Link>
        </div>
      </header>
      <RememberWhenSection />
      <RedditSection />
    </main>
  );
}
