import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Keyboard, Mic, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { BigButton, Eyebrow, RememberShell, Rise, SparkCard, StoryCard, nomineeLink } from "@/components/remember-ui";
import squareImage from "@/assets/one-story-together/remember-when/square.jpg.asset.json";
import { useSpeech } from "@/hooks/use-speech";
import { SPARKS, SPARK_KEYS, type SparkKey } from "@/lib/remember-sparks";
import { saveRememberEmail, saveRememberStory } from "@/lib/remember.functions";

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
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const speech = useSpeech(60);
  const save = useServerFn(saveRememberStory);
  const saveEmail = useServerFn(saveRememberEmail);
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


  const onEmail = async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    const res = await saveEmail({ data: { token, email } });
    setBusy(false);
    if ("error" in res) return setError(res.error ?? "Please check your email address.");
    window.__lovableEvents?.track?.("project.remember_email_sent", {});
    setSent(true);
  };

  if (stage === "open")
    return (
      <RememberShell tone="ink">
        <Rise><img src={squareImage.url} alt="A father, mother and their two-year-old look at a baby photo on a phone." className="h-auto w-full rounded-sm" /></Rise>
        <Rise delay={250} className="mt-8"><Eyebrow tone="ink">Remember When</Eyebrow></Rise>
        <Rise delay={400}><h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">What's the first story your little one would ask about?</h1></Rise>
        <Rise delay={600} className="mt-8">
          <BigButton
            onClick={() => {
              window.__lovableEvents?.track?.("project.remember_start_clicked", { src: src ?? "direct", nominee: from === "nominee" });
              go("spark");
            }}
          >
            Pick a story to tell
          </BigButton>
        </Rise>
      </RememberShell>
    );

  if (stage === "spark")
    return (
      <RememberShell>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Pick a story to tell.</h1>
        <p className="mt-3 text-story-ink/75">Tap one.</p>
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
      <RememberShell>
        <p className="text-xs font-semibold uppercase text-story-coral-deep">{SPARKS[spark].title}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Tell it in your own words.</h1>
        <p className="mt-4 border-l-2 border-story-coral-deep pl-4 italic text-story-ink/80">“{SPARKS[spark].starter}”</p>

        <div className="mt-6 min-h-32 rounded-sm border border-story-ink/15 bg-card p-4">
          {typedOnly || !speech.listening ? (
            <textarea
              value={story}
              onChange={(e) => speech.setText(e.target.value.slice(0, 400))}
              placeholder={typedOnly ? SPARKS[spark].starter : "Your words appear here as you talk."}
              aria-label="Your story"
              rows={5}
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-story-ink/50"
            />
          ) : (
            <p className="text-[15px] leading-relaxed" aria-live="polite">
              {story} <span className="text-story-ink/55">{speech.interim}</span>
              <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-story-coral-deep align-middle" />
            </p>
          )}
          <p className="mt-2 text-right text-xs text-story-ink/60">{story.length}/400</p>
        </div>

        {!typedOnly && (
          <div className="mt-8 flex flex-col items-center">
          <div className="relative">
            {speech.listening && <span aria-hidden className="rw-ring absolute inset-0 rounded-full bg-story-coral" />}
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
            className={`relative flex size-28 touch-none select-none items-center justify-center rounded-full shadow-lg transition active:scale-95 sm:size-32 ${speech.listening ? "bg-story-coral-deep text-story-paper" : "bg-story-coral text-story-ink"}`}
          >
            <Mic className="size-10" />
          </button>
          </div>
          <p className="mt-3 text-base font-semibold">{speech.listening ? "Listening… let go to stop" : "Hold to talk"}</p>
          </div>
        )}
        {speech.denied && <p className="mt-3 text-sm text-story-coral-deep">The microphone is off. You can type your story instead.</p>}
        {speech.supported === false && <p className="mt-3 text-sm text-story-ink/70">This browser cannot listen. Please type your story.</p>}
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

        {error && <p className="mt-4 text-sm text-story-coral-deep">{error}</p>}
        <div className="mt-8">
          <BigButton onClick={onSave} disabled={busy || story.trim().length < 3 || speech.listening}>
            {busy ? "Saving…" : "Save my story"}
          </BigButton>
        </div>
      </RememberShell>
    );

  return (
    <RememberShell>
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">Tell it to them tonight.</h1>
      <div className="mt-6">{spark && <StoryCard title={SPARKS[spark].title} story={story} />}</div>

      {sent ? (
        <Rise className="mt-8">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <Check className="size-5 text-story-coral-deep" /> Sent. Tell it tonight.
          </p>
          <a
            href={typeof window === "undefined" ? "#" : nomineeLink()}
            target="_blank"
            rel="noreferrer"
            onClick={() => window.__lovableEvents?.track?.("project.remember_nominate", { from: "tonight" })}
            className="mt-4 inline-block text-sm underline"
          >
            Ask someone to share theirs
          </a>
        </Rise>
      ) : (
        <Rise delay={300} className="mt-10">
          <label htmlFor="rw-email" className="font-display text-3xl leading-tight">Who should get this memory?</label>
          <input
            id="rw-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Their email"
            className="mt-4 h-14 w-full rounded-sm border border-story-ink/30 bg-card px-4 text-lg outline-none focus:border-story-coral-deep"
          />
          {error && <p className="mt-2 text-sm text-story-coral-deep">{error}</p>}
          <div className="mt-4">
            <BigButton onClick={onEmail} disabled={busy || !email.includes("@")}>
              <Send className="mr-2 size-5" /> {busy ? "Sending…" : "Send the memory"}
            </BigButton>
          </div>
          <p className="mt-3 text-xs text-story-ink/70">We use this email only to send this memory.</p>
        </Rise>
      )}
    </RememberShell>
  );
}
