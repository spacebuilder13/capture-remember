import { Link, createFileRoute } from "@tanstack/react-router";
import { Download, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import c0 from "@/assets/one-photo-two-memories/creative_0.png.asset.json";
import c1 from "@/assets/one-photo-two-memories/creative_1.png.asset.json";
import c2 from "@/assets/one-photo-two-memories/creative_2.png.asset.json";
import c3 from "@/assets/one-photo-two-memories/creative_3.png.asset.json";
import c4 from "@/assets/one-photo-two-memories/creative_4.png.asset.json";
import c5 from "@/assets/one-photo-two-memories/creative_5.png.asset.json";
import c6 from "@/assets/one-photo-two-memories/creative_6.png.asset.json";
import c7 from "@/assets/one-photo-two-memories/creative_7.png.asset.json";

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

const IMAGES = [c0, c1, c2, c3, c4, c5, c6, c7];
const VIDEOS = ["Video 1", "Video 2"];

function Socials() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="font-display text-2xl">Mem<span className="font-sans text-base font-semibold">Reel</span></Link>
          <span className="text-xs text-muted-foreground">05</span>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <h1 className="font-display text-5xl leading-tight">One Photo, Two Memories - creatives</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">Creatives and their run instructions are being added one at a time.</p>

        <h2 className="mt-12 font-display text-3xl">Images</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {IMAGES.map((img, i) => (
            <figure key={img.url} className="border border-border bg-card p-3">
              <img src={img.url} alt={`Creative ${i + 1}`} className="aspect-square w-full bg-secondary object-contain" />
              <figcaption className="mt-3 flex items-center justify-between text-sm">
                Creative {i + 1}
                <Button asChild size="sm" variant="outline" className="rounded-sm shadow-none">
                  <a href={img.url} download><Download /> Download</a>
                </Button>
              </figcaption>
            </figure>
          ))}
        </div>

        <h2 className="mt-12 font-display text-3xl">Videos</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {VIDEOS.map((v) => (
            <div key={v} className="flex aspect-[9/16] max-h-[520px] flex-col items-center justify-center gap-3 border border-dashed border-border bg-card text-muted-foreground">
              <Video className="size-8" />
              <p className="font-medium text-foreground">{v}</p>
              <p className="text-sm">Video coming soon</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
