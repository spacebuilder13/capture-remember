import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { BigButton, RememberShell, StoryCard, nomineeLink } from "@/components/remember-ui";
import { SPARKS, type SparkKey } from "@/lib/remember-sparks";
import { answerRememberFollowup, deleteRememberStory, getRememberStory } from "@/lib/remember.functions";

export const Route = createFileRoute("/one-story-together/remember-when_/$token")({
  head: () => ({
    meta: [
      { title: "Your story | Remember When" },
      { name: "description", content: "Your family story for tonight." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Your story | Remember When" },
      { property: "og:description", content: "Your family story for tonight." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoryLink,
});

type Answer = "joined" | "just_me" | "not_yet";
type Who = "partner" | "grandparent" | "child" | "someone_else";
const WHO: Record<Who, string> = { partner: "Partner", grandparent: "Grandparent", child: "My child", someone_else: "Someone else" };

function StoryLink() {
  const { token } = Route.useParams();
  const get = useServerFn(getRememberStory);
  const answerFn = useServerFn(answerRememberFollowup);
  const del = useServerFn(deleteRememberStory);
  const [story, setStory] = useState<{ spark: string; story: string } | null>(null);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [who, setWho] = useState<Who[]>([]);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    get({ data: { token } })
      .then((r) => ("error" in r ? setError(r.error ?? "") : setStory(r)))
      .catch(() => setError("This link does not work."));
  }, [token, get]);

  const pick = async (a: Answer) => {
    setAnswer(a);
    window.__lovableEvents?.track?.("project.remember_checkin_answered", { answer: a });
    await answerFn({ data: { token, answer: a, who: [] } });
  };

  const toggleWho = async (w: Who) => {
    const next = who.includes(w) ? who.filter((x) => x !== w) : [...who, w];
    setWho(next);
    if (!who.includes(w)) window.__lovableEvents?.track?.("project.remember_who_joined", { who: w });
    await answerFn({ data: { token, answer: "joined", who: next } });
  };

  if (deleted) return <RememberShell><p className="text-lg">Your story is deleted.</p></RememberShell>;
  if (error) return <RememberShell><p className="text-lg">{error}</p></RememberShell>;
  if (!story) return <RememberShell><p className="text-story-ink/70">Loading your story…</p></RememberShell>;

  const title = SPARKS[story.spark as SparkKey]?.title ?? "Your story";

  return (
    <RememberShell>
      <StoryCard title={title} story={story.story} />

      {!answer ? (
        <div className="mt-10">
          <h1 className="font-display text-4xl leading-tight">Did anyone join in?</h1>
          <div className="mt-6 grid gap-3">
            <BigButton onClick={() => pick("joined")}>Yes, someone added to it</BigButton>
            <BigButton variant="outline" onClick={() => pick("just_me")}>I told it, just me</BigButton>
            <BigButton variant="outline" onClick={() => pick("not_yet")}>Not yet</BigButton>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          {answer === "joined" && (
            <>
              <h1 className="font-display text-4xl leading-tight">Lovely. Who joined?</h1>
              <div className="mt-5 flex flex-wrap gap-2">
                {(Object.keys(WHO) as Who[]).map((w) => (
                  <button key={w} type="button" onClick={() => toggleWho(w)} aria-pressed={who.includes(w)} className={`rounded-full border-2 border-story-ink px-4 py-2 font-semibold ${who.includes(w) ? "bg-story-ink text-story-paper" : "bg-card"}`}>
                    {WHO[w]}
                  </button>
                ))}
              </div>
            </>
          )}
          {answer === "just_me" && <h1 className="font-display text-4xl leading-tight">Thank you for telling it.</h1>}
          {answer === "not_yet" && <h1 className="font-display text-4xl leading-tight">That's fine. Tonight works too.</h1>}

          <div className="mt-12 border-t-2 border-story-ink/15 pt-8">
            <p className="font-display text-2xl">Who else has a story like this?</p>
            <a
              href={nomineeLink()}
              target="_blank"
              rel="noreferrer"
              onClick={() => window.__lovableEvents?.track?.("project.remember_nominate", { from: "checkin" })}
              className="mt-4 block rounded-sm border-2 border-story-ink bg-card px-5 py-4 text-lg font-semibold hover:bg-story-mist"
            >
              Ask someone to share theirs
            </a>
          </div>
        </div>
      )}

      <p className="mt-12 text-center text-sm text-story-ink/70">Remember When, by MemReel.</p>
      <button
        type="button"
        className="mx-auto mt-4 block text-xs text-story-ink/60 underline"
        onClick={async () => {
          if (!window.confirm("Delete this story?")) return;
          await del({ data: { token } });
          setDeleted(true);
        }}
      >
        Delete my story
      </button>
    </RememberShell>
  );
}
