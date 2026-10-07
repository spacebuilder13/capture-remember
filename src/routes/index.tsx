import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Images } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MemReel experiments | Hypotheses we are testing" },
      { name: "description", content: "Every MemReel product hypothesis in one place, with its live experience and social campaign." },
      { property: "og:title", content: "MemReel experiments" },
      { property: "og:description", content: "Every MemReel product hypothesis in one place, with its live experience and social campaign." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Registry,
});

const EXPERIMENTS = [
  {
    number: "01",
    name: "Captured ≠ Remembered",
    hypothesis:
      "Parents of young children will preserve a memory once they notice a photo no longer tells them the story behind it.",
    signal: "A real photo with a remembered detail",
    status: "Live",
    experience: "/captured-remembered",
    socials: "/captured-remembered/socials",
  },
  {
    number: "02",
    name: "Journal Context",
    hypothesis:
      "If MemReel captures short daily journal entries and understands what has been on your mind, it can bring back the right memory at the right moment.",
    signal: "“This feels right” on a surfaced memory",
    status: "Prototype",
    experience: "/journal",
    socials: "/journal/socials",
  },
] as const;

function Registry() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <span className="font-display text-2xl">
            Mem<span className="font-sans text-base font-semibold">Reel</span>
          </span>
          <span className="text-xs text-muted-foreground">Experiments registry</span>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-xs font-semibold uppercase text-primary">What we are testing</p>
        <h1 className="mt-3 max-w-2xl font-display text-5xl leading-tight sm:text-6xl">One hypothesis at a time.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">Each idea has its own experience to try and its own social campaign to review.</p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {EXPERIMENTS.map((x) => (
            <article key={x.name} className="flex flex-col border border-border bg-card p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl text-muted-foreground">{x.number}</span>
                <span className="rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary">{x.status}</span>
              </div>
              <h2 className="mt-6 font-display text-4xl leading-tight">{x.name}</h2>
              <p className="mt-4 leading-relaxed text-foreground/85">{x.hypothesis}</p>
              <p className="mt-5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Strong signal:</span> {x.signal}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 pt-2 md:mt-auto">
                <Button asChild className="rounded-sm shadow-none">
                  <Link to={x.experience}>Open experience <ArrowRight /></Link>
                </Button>
                <Button asChild variant="outline" className="rounded-sm shadow-none">
                  <Link to={x.socials}><Images /> View socials</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
