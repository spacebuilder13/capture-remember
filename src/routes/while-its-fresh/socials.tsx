import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { WIF_APP_STORE_URL, WIF_PLAY_STORE_URL, WIF_CREATIVES, WIF_EXPERIENCE_URL, WIF_ORIGINALS_FOLDER, WIF_RUN_STEPS } from "@/lib/wif-creatives";

export const Route = createFileRoute("/while-its-fresh/socials")({
  head: () => ({
    meta: [
      { title: "While It's Fresh - creatives | MemReel" },
      { name: "description", content: "Creatives and run instructions for While It's Fresh by MemReel." },
      { property: "og:title", content: "While It's Fresh - creatives" },
      { property: "og:description", content: "Keep the why on the photo before the chat moves on." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhileItsFreshSocials,
});

function CopyButton({ text, label = "Copy caption" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="rounded-sm shadow-none"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check /> : <Copy />} {done ? "Copied" : label}
    </Button>
  );
}

function WhileItsFreshSocials() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="font-display text-2xl">
            Mem<span className="font-sans text-base font-semibold">Reel</span>
          </Link>
          <span className="text-xs text-muted-foreground">06</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="py-14">
          <h1 className="font-display text-5xl leading-tight">While It's Fresh - creatives</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            These videos are compressed review copies. For launch, use the original-quality files in Harsh's folder.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline" className="rounded-sm shadow-none">
              <a href={WIF_ORIGINALS_FOLDER} target="_blank" rel="noreferrer">
                <ExternalLink /> Open original-quality folder
              </a>
            </Button>
            <Button asChild size="sm" className="rounded-sm shadow-none">
              <Link to="/while-its-fresh">Open experience</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-sm shadow-none">
              <a href={WIF_APP_STORE_URL} target="_blank" rel="noopener noreferrer"><ExternalLink /> App Store</a>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-sm shadow-none">
              <a href={WIF_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"><ExternalLink /> Google Play</a>
            </Button>
          </div>
        </div>

        {WIF_CREATIVES.map((c) => (
          <section key={c.number} className="border-t border-border py-12">
            <p className="text-xs font-semibold uppercase text-primary">Creative {c.number} · {c.kind}</p>
            <h2 className="mt-2 font-display text-4xl">{c.title}</h2>

            <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
              <figure className="border border-border bg-card p-3">
                <video src={c.src} controls playsInline className="aspect-[9/16] w-full bg-muted object-contain" />
                <figcaption className="mt-3 flex items-center justify-between gap-2 text-sm">
                  <span>Review copy ({c.originalName} for launch)</span>
                  <Button asChild size="sm" variant="outline" className="rounded-sm shadow-none">
                    <a href={c.src} download={c.downloadName}><Download /> Download</a>
                  </Button>
                </figcaption>
              </figure>

              <div className="space-y-6">
                <div className="border border-border bg-card p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">Caption</h3>
                    <CopyButton text={c.caption} />
                  </div>
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/85">{c.caption}</p>
                </div>

                <div className="border border-border bg-card p-6">
                  <h3 className="font-semibold">Platform recommendation</h3>
                  <p className="mt-3 leading-relaxed text-foreground/85">{c.platformNote}</p>
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className="border-t border-border py-12">
          <h2 className="font-display text-3xl">Run instructions</h2>
          <div className="mt-6 border border-border bg-card p-6">
            <ul className="space-y-3 leading-relaxed text-foreground/85">
              {WIF_RUN_STEPS.map(([k, v]) => (
                <li key={k}><span className="font-semibold text-foreground">{k}:</span> {v}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">The link this campaign uses</h3>
              <CopyButton text={WIF_EXPERIENCE_URL} label="Copy link" />
            </div>
            <p className="mt-3 break-all font-mono text-sm">{WIF_EXPERIENCE_URL}</p>
          </div>
        </section>
      </div>
    </main>
  );
}