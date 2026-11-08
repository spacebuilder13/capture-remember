import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Mic } from "lucide-react";
import { useEffect, useState } from "react";

import { BigButton, RememberShell, Rise, StoryCard } from "@/components/remember-ui";
import { useSpeech } from "@/hooks/use-speech";
import { SPARKS, type SparkKey } from "@/lib/remember-sparks";
import { addRememberReply, getRememberStory } from "@/lib/remember.functions";

export const Route = createFileRoute("/remember-when/$token")({
  head: () => ({
    meta: [
      { title: "A story for tonight | Remember When" },
      { name: "description", content: "A family story is being told tonight. Add what you remember." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "A story for tonight | Remember When" },
      { property: "og:description", content: "A family story is being told tonight. Add what you remember." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FamilyLink,
});

function FamilyLink() {
  const { token } = Route.useParams();
  const get = useServerFn(getRememberStory);
  const add = useServerFn(addRememberReply);
  const speech = useSpeech(60);
  const [story, setStory] = useState<{ spark: string; story: string; photoUrl?: string | null } | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const memory = speech.text;

  useEffect(() => {
    get({ data: { token } })
      .then((r) => ("error" in r ? setError(r.error ?? "") : setStory(r)))
      .catch(() => setError("This link does not work."));
  }, [token, get]);

  const onAdd = async () => {
    setBusy(true);
    setError("");
    const res = await add({ data: { token, memory, name: name || undefined } });
    setBusy(false);
    if ("error" in res) return setError(res.error ?? "Please try again.");
    window.__lovableEvents?.track?.("project.remember_reply_added", {});
    setDone(true);
  };

  if (!story) return <RememberShell><p className={error ? "text-lg" : "text-muted-foreground"}>{error || "Loading the story…"}</p></RememberShell>;

  const title = SPARKS[story.spark as SparkKey]?.title ?? "A family story";

  return (
    <RememberShell>
      <p className="mb-4 text-sm font-semibold uppercase text-primary">This story is being told tonight</p>
      <StoryCard title={title} story={story.story} photoUrl={story.photoUrl} />

      {done ? (
        <Rise className="mt-10">
          <p className="flex items-center gap-2 font-display text-3xl leading-tight">
            <Check className="size-7 text-primary" /> Thank you.
          </p>
          <p className="mt-2 text-lg text-muted-foreground">They will hear your part tonight.</p>
          <Link to="/remember-when" className="mt-8 block rounded-sm border-2 border-primary bg-background px-5 py-4 text-center text-lg font-semibold hover:bg-secondary">
            Share a story of your own
          </Link>
        </Rise>
      ) : (
        <div className="mt-10">
          <h1 className="font-display text-4xl leading-tight">What do you remember about this?</h1>
          <blockquote className="relative mt-8 px-8 sm:px-10">
            <span aria-hidden className="absolute -top-4 left-0 font-display text-6xl leading-none text-primary">“</span>
            <textarea
              value={speech.listening ? `${memory} ${speech.interim}`.trim() : memory}
              readOnly={speech.listening}
              onChange={(e) => speech.setText(e.target.value.slice(0, 400))}
              placeholder="I remember when…"
              aria-label="What you remember"
              rows={3}
              className="block w-full resize-none border-b border-transparent bg-transparent font-display text-xl leading-snug outline-none placeholder:text-muted-foreground/70 focus:border-border sm:text-2xl"
            />
            <span aria-hidden className="absolute -bottom-8 right-0 font-display text-6xl leading-none text-primary">”</span>
            <p className="mt-1 text-right text-xs text-muted-foreground">{memory.length}/400</p>
          </blockquote>
          {speech.supported !== false && !speech.denied && (
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); speech.start(); }}
              onPointerUp={speech.stop}
              onPointerLeave={() => speech.listening && speech.stop()}
              onContextMenu={(e) => e.preventDefault()}
              className={`mx-auto mt-8 flex touch-none select-none items-center gap-2 rounded-full border-2 border-primary px-5 py-2.5 font-semibold ${speech.listening ? "bg-primary text-primary-foreground" : "bg-background"}`}
            >
              <Mic className="size-5" /> {speech.listening ? "Listening… let go to stop" : "Hold to talk"}
            </button>
          )}
          <label className="mt-8 block text-sm font-semibold">
            Your name <span className="font-normal text-muted-foreground">(optional)</span>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder="For example, Nani" className="mt-2 block h-12 w-full rounded-sm border border-border bg-background px-4 text-base outline-none focus:border-primary" />
          </label>
          {error && <p className="mt-4 text-sm text-primary">{error}</p>}
          <div className="mt-6">
            <BigButton onClick={onAdd} disabled={busy || memory.trim().length < 2 || speech.listening}>{busy ? "Adding…" : "Add my memory"}</BigButton>
          </div>
        </div>
      )}
      <p className="mt-12 text-center text-sm text-muted-foreground">Remember When, by MemReel.</p>
    </RememberShell>
  );
}
