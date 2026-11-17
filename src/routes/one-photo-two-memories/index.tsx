import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { UNBLUR_SLIDES } from "@/lib/opt2m-creatives";

export const Route = createFileRoute("/one-photo-two-memories/")({
  head: () => ({
    meta: [
      { title: "One Photo, Two Memories | MemReel" },
      { name: "description", content: "One photo. Two people who were there. Each remembers something the other forgot." },
      { property: "og:title", content: "One Photo, Two Memories" },
      { property: "og:description", content: "What is a memory if not everyone's side of it?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Unblur,
});

function Unblur() {
  const [i, setI] = useState(0);
  const last = UNBLUR_SLIDES.length - 1;
  const startX = useRef<number | null>(null);
  useEffect(() => {
    window.__lovableEvents?.track?.("project.opt2m_slide_seen", { src: "opt2m", slide: i + 1 });
  }, [i]);
  const go = (d: number) => setI((x) => Math.min(last, Math.max(0, x + d)));

  return (
    <main className="flex min-h-svh flex-col items-center bg-background px-5 py-6 text-foreground">
      <Link to="/" className="self-start font-display text-2xl">Mem<span className="font-sans text-base font-semibold">Reel</span></Link>
      <div className="mt-4 w-full max-w-md">
        <div
          className="relative aspect-[337/422] w-full touch-pan-y select-none overflow-hidden rounded-sm bg-card"
          onPointerDown={(e) => (startX.current = e.clientX)}
          onPointerUp={(e) => {
            if (startX.current === null) return;
            const dx = e.clientX - startX.current;
            startX.current = null;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            else go(e.clientX - e.currentTarget.getBoundingClientRect().left > e.currentTarget.clientWidth / 3 ? 1 : -1);
          }}
        >
          {UNBLUR_SLIDES.map((src, n) => (
            <img
              key={src}
              src={src}
              alt={`Slide ${n + 1} of ${UNBLUR_SLIDES.length}`}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition-[opacity,filter] duration-700 ease-out"
              style={{ opacity: n === i ? 1 : 0, filter: n === i ? "blur(0)" : "blur(12px)" }}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" aria-label="Previous" onClick={() => go(-1)} disabled={i === 0} className="grid size-11 place-items-center rounded-full border border-border disabled:opacity-30"><ArrowLeft className="size-5" /></button>
          <div className="flex gap-2" aria-label={`Slide ${i + 1} of ${UNBLUR_SLIDES.length}`}>
            {UNBLUR_SLIDES.map((s, n) => (
              <span key={s} className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-primary" : "w-2 bg-border"}`} />
            ))}
          </div>
          <button type="button" aria-label="Next" onClick={() => go(1)} disabled={i === last} className="grid size-11 place-items-center rounded-full border border-border disabled:opacity-30"><ArrowRight className="size-5" /></button>
        </div>
        <div className={`mt-6 transition-opacity duration-500 ${i === last ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={i !== last}>
          <Link
            to="/remember-when"
            search={{ src: "opt2m", from: undefined }}
            tabIndex={i === last ? 0 : -1}
            onClick={() => window.__lovableEvents?.track?.("project.opt2m_cta_clicked", { src: "opt2m" })}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Tonight, pick a photo <ArrowRight className="size-5" />
          </Link>
        </div>
        {i !== last && <p className="mt-2 text-center text-sm text-muted-foreground">Swipe or tap to see more</p>}
      </div>
    </main>
  );
}
