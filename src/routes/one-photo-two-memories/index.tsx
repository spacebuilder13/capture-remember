import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { GRID_IMAGE } from "@/lib/opt2m-creatives";

export const Route = createFileRoute("/one-photo-two-memories/")({
  head: () => ({
    meta: [
      { title: "One Photo, Two Memories | MemReel" },
      { name: "description", content: "One photo. Two people who were there. Each remembers something the other forgot." },
      { property: "og:title", content: "One Photo, Two Memories" },
      { property: "og:description", content: "What if the photo only brings back half of the memory?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GridEntry,
});

function GridEntry() {
  return (
    <main className="flex min-h-svh flex-col items-center bg-background px-5 py-6 text-foreground">
      <Link to="/" className="self-start font-display text-2xl">Mem<span className="font-sans text-base font-semibold">Reel</span></Link>
      <div className="mt-4 w-full max-w-md">
        <img src={GRID_IMAGE} alt="What if the photo only brings back half of the memory?" className="h-auto w-full rounded-sm" />
        <p className="mt-6 text-center text-lg leading-relaxed">Your loved ones hold the remaining picture. Share your half with them.</p>
        <Link
          to="/remember-when"
          search={{ src: "opt2m", from: undefined }}
          onClick={() => window.__lovableEvents?.track?.("project.opt2m_cta_clicked", { src: "opt2m" })}
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Share your half <ArrowRight className="size-5" />
        </Link>
      </div>
    </main>
  );
}
