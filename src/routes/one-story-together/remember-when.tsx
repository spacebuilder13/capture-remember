import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Keyboard, Mic, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { BigButton, MemHeader, RememberShell, Rise, SparkCard, StoryCard, familyLink } from "@/components/remember-ui";
import storyImage from "@/assets/one-story-together/remember-when/story.jpg.asset.json";
import squareImage from "@/assets/one-story-together/remember-when/square.jpg.asset.json";
import { useSpeech } from "@/hooks/use-speech";
import { SPARKS, SPARK_KEYS, type SparkKey } from "@/lib/remember-sparks";
import { saveRememberStory } from "@/lib/remember.functions";

const search = z.object({
  src: z.enum(["feed", "story"]).optional().catch(undefined),
  from: z.enum(["nominee"]).optional().catch(undefined),
});

export const Route = createFileRoute("/one-story-together/remember-when")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Who's that baby? | Remember When" },
      { name: "description", content: "Pick one family story your little one would ask about, and tell it tonight." },
      { property: "og:title", content: "Who's that baby? | Remember When" },
      { property: "og:description", content: "What's the first story your little one would ask about? Tell it tonight." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RememberWhen,
});

type Stage = "open" | "spark" | "tell" | "tonight";

function RememberWhen() {
  const { src, from } = Route.useSearch();
  const [stage, setStage] = useState<Stage>("open");
  const [spark, setSpark] = useState<SparkKey | null>(null);
  const [mode, setMode] = useState<"spoken" | "typed">("spoken");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const speech = useSpeech(60);
  const save = useServerFn(saveRememberStory);
  const typedOnly = speech.supported === false || speech.denied || mode === "typed";
  const story = speech.text;

  const go = (s: Stage) => {
    setStage(s);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const onSave = async () => {
    if (!spark || story.trim().length < 3) return;
    setBusy(true);
    setError("");
    const res = await save({ data: { spark, story, mode: typedOnly ? "typed" : mode, source: src, nominatedBy: from } });
    setBusy(false);
    if ("error" in res) return setError(res.error ?? "Please try again.");
    window.__lovableEvents?.track?.("project.remember_story_saved", { spark, mode: typedOnly ? "typed" : mode, length: story.length });
    setToken(res.token);
    go("tonight");
  };


  const startButton = (
    <button
      type="button"
      onClick={() => {
        window.__lovableEvents?.track?.("project.remember_start_clicked", { src: src ?? "direct", nominee: from === "nominee" });
        go("spark");
      }}
      className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-6 text-base font-medium text-primary-foreground transition hover:bg-primary/90"
    >
      Pick a story to tell <ArrowRight className="size-4" />
    </button>
  );

  if (stage === "open")
    return (
      <main className="min-h-screen bg-background text-foreground">
        <MemHeader overPhoto />
        <h1 className="sr-only landscape:hidden">Who's that baby?</h1>
        <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-foreground landscape:hidden">
          <img src={storyImage.url} alt="A father, mother and their two-year-old look at a baby photo on a phone. Who's that baby?" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-foreground/45 to-transparent" />
          <div className="relative z-10 w-full px-5 pb-10">{startButton}</div>
        </section>
        <section className="hidden min-h-svh bg-secondary landscape:grid landscape:grid-cols-[1fr_auto]">
          <div className="flex flex-col justify-center px-8 pt-20 pb-12 lg:px-16">
            <h1 className="max-w-lg font-display text-4xl leading-tight lg:text-6xl">What's the first story your little one would ask about?</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">Pick one. Tell it in your own words. Tell it to them tonight.</p>
            <div className="mt-8">{startButton}</div>
          </div>
          <img src={squareImage.url} alt="A father, mother and their two-year-old look at a baby photo on a phone. Who's that baby?" className="h-svh w-auto max-w-[60vw] object-cover" />
        </section>
        <section className="bg-secondary py-20 sm:py-28 landscape:hidden">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className="font-display text-4xl leading-tight sm:text-5xl">What's the first story your little one would ask about?</p>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">Pick one. Tell it in your own words. Tell it to them tonight.</p>
          </div>
        </section>
      </main>
    );

  if (stage === "spark")
    return (
      <RememberShell step={1}>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Pick a story to tell.</h1>
        <p className="mt-3 text-muted-foreground">Tap one.</p>
        <div className="mt-8 grid gap-3">
          {SPARK_KEYS.map((k, i) => (
            <SparkCard
              key={k}
              index={i}
              onClick={() => {
                window.__lovableEvents?.track?.("project.remember_spark_picked", { spark: k });
                setSpark(k);
                speech.setText("");
                go("tell");
              }}
            >
              {SPARKS[k].title}
            </SparkCard>
          ))}
        </div>
      </RememberShell>
    );

  if (stage === "tell" && spark)
    return (
      <RememberShell step={2}>
        <p className="text-xs font-semibold uppercase text-primary">{SPARKS[spark].title}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Tell it in your own words.</h1>
        <p className="mt-4 border-l-2 border-primary pl-4 italic text-muted-foreground">“{SPARKS[spark].starter}”</p>

        <div className="mt-6 min-h-32 rounded-sm border border-border bg-background p-4">
          {typedOnly || !speech.listening ? (
            <textarea
              value={story}
              onChange={(e) => speech.setText(e.target.value.slice(0, 400))}
              placeholder={typedOnly ? SPARKS[spark].starter : "Your words appear here as you talk."}
              aria-label="Your story"
              rows={5}
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
            />
          ) : (
            <p className="text-[15px] leading-relaxed" aria-live="polite">
              {story} <span className="text-muted-foreground">{speech.interim}</span>
              <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-primary-deep align-middle" />
            </p>
          )}
          <p className="mt-2 text-right text-xs text-muted-foreground">{story.length}/400</p>
        </div>

        {!typedOnly && (
          <div className="mt-8 flex flex-col items-center">
          <div className="relative">
            {speech.listening && <span aria-hidden className="rw-ring absolute inset-0 rounded-full bg-primary" />}
          <button
            type="button"
            aria-label={speech.listening ? "Listening, let go to stop" : "Hold to talk"}
            onPointerDown={(e) => {
              e.preventDefault();
              window.__lovableEvents?.track?.("project.remember_talk_started", {});
              speech.start();
            }}
            onPointerUp={speech.stop}
            onPointerLeave={() => speech.listening && speech.stop()}
            onContextMenu={(e) => e.preventDefault()}
            className={`relative flex size-28 touch-none select-none items-center justify-center rounded-full shadow-lg transition active:scale-95 sm:size-32 ${speech.listening ? "bg-primary/80 text-primary-foreground" : "bg-primary text-primary-foreground"}`}
          >
            <Mic className="size-10" />
          </button>
          </div>
          <p className="mt-3 text-base font-semibold">{speech.listening ? "Listening… let go to stop" : "Hold to talk"}</p>
          </div>
        )}
        {speech.denied && <p className="mt-3 text-sm text-primary">The microphone is off. You can type your story instead.</p>}
        {speech.supported === false && <p className="mt-3 text-sm text-muted-foreground">This browser cannot listen. Please type your story.</p>}
        {!typedOnly && (
          <button
            type="button"
            onClick={() => {
              window.__lovableEvents?.track?.("project.remember_type_instead", {});
              speech.stop();
              setMode("typed");
            }}
            className="mx-auto mt-3 flex items-center gap-2 text-sm underline"
          >
            <Keyboard className="size-4" /> Type instead
          </button>
        )}

        {error && <p className="mt-4 text-sm text-primary">{error}</p>}
        <div className="mt-8">
          <BigButton onClick={onSave} disabled={busy || story.trim().length < 3 || speech.listening}>
            {busy ? "Saving…" : "Save my story"}
          </BigButton>
        </div>
      </RememberShell>
    );

  return (
    <RememberShell step={3}>
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">Tell it to them tonight.</h1>
      <div className="mt-6">{spark && <StoryCard title={SPARKS[spark].title} story={story} />}</div>
      {sent ? (
        <Rise className="mt-10">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <Check className="size-5 text-primary" /> Sent. Tell it tonight.
          </p>
        </Rise>
      ) : (
        <Rise delay={300} className="mt-10">
          <p className="font-display text-2xl leading-snug">Who else should hear this? Send it to them.</p>
          <a
            href={spark && token && typeof window !== "undefined" ? familyLink(SPARKS[spark].title, story, token) : "#"}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              window.__lovableEvents?.track?.("project.remember_family_shared", { spark });
              setSent(true);
            }}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Send className="size-5" /> Send it to family on WhatsApp
          </a>
        </Rise>
      )}
    </RememberShell>
  );
}
