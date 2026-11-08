import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { AddPhotoButton, BigButton, PhotoStrip, RememberShell, StoryCard, nomineeLink, shrinkPhoto } from "@/components/remember-ui";
import { SPARKS, type SparkKey } from "@/lib/remember-sparks";
import { addRememberPhoto, answerRememberFollowup, deleteRememberStory, getRememberOwnerStory } from "@/lib/remember.functions";

export const Route = createFileRoute("/remember-when/me/$token")({
  head: () => ({
    meta: [
      { title: "Your story | Remember When" },
      { name: "description", content: "Your story and what your family added." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Your story | Remember When" },
      { property: "og:description", content: "Your story and what your family added." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerLink,
});

type Answer = "joined" | "just_me" | "not_yet";
type Who = "partner" | "grandparent" | "child" | "someone_else";
const WHO: Record<Who, string> = { partner: "Partner", grandparent: "Grandparent", child: "My child", someone_else: "Someone else" };
const isAnswer = (value: string): value is Answer => ["joined", "just_me", "not_yet"].includes(value);
const isWho = (value: string): value is Who => Object.hasOwn(WHO, value);
type Data = { spark: string; story: string; childName: string | null; photoUrl: string | null; photos: { url: string; addedBy: string | null }[]; replies: { name: string | null; memory: string }[] };

function OwnerLink() {
  const { token } = Route.useParams();
  const get = useServerFn(getRememberOwnerStory);
  const answerFn = useServerFn(answerRememberFollowup);
  const del = useServerFn(deleteRememberStory);
  const [story, setStory] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [who, setWho] = useState<Who[]>([]);
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const addPhoto = useServerFn(addRememberPhoto);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMsg, setPhotoMsg] = useState("");
  const onPhoto = async (f: File) => {
    setPhotoBusy(true); setPhotoMsg("");
    try {
      const fd = new FormData();
      fd.append("token", token);
      fd.append("name", "You");
      fd.append("photo", await shrinkPhoto(f));
      const res = await addPhoto({ data: fd });
      if ("error" in res) { window.__lovableEvents?.track?.("project.remember_photo_add_failed", {}); return setPhotoMsg(res.error ?? "Please try again."); }
      setStory((s) => (s ? { ...s, photos: res.photos } : s));
      setPhotoMsg("Photo added.");
      window.__lovableEvents?.track?.("project.remember_photo_added", { role: "owner" });
    } catch { window.__lovableEvents?.track?.("project.remember_photo_add_failed", {}); setPhotoMsg("We could not save your photo. Please try again."); }
    finally { setPhotoBusy(false); }
  };

  useEffect(() => {
    get({ data: { token } })
      .then((r) => {
        if ("error" in r) return setError(r.error ?? "");
        setStory(r);
        if (r.last && isAnswer(r.last.answer)) {
          setAnswer(r.last.answer);
          setWho((r.last.who ?? []).filter(isWho));
        }
      })
      .catch(() => setError("This link does not work."));
  }, [token, get]);

  const pick = async (a: Answer) => {
    setBusy(true); setError("");
    try {
      const res = await answerFn({ data: { token, answer: a, who: [] } });
      if ("error" in res) return setError(res.error ?? "Please try again.");
      setAnswer(a);
      window.__lovableEvents?.track?.("project.remember_checkin_answered", { answer: a });
    } catch { setError("We could not save your answer. Please try again."); }
    finally { setBusy(false); }
  };
  const toggleWho = async (w: Who) => {
    const next = who.includes(w) ? who.filter((x) => x !== w) : [...who, w];
    setBusy(true); setError("");
    try {
      const res = await answerFn({ data: { token, answer: "joined", who: next } });
      if ("error" in res) return setError(res.error ?? "Please try again.");
      setWho(next);
      if (!who.includes(w)) window.__lovableEvents?.track?.("project.remember_who_joined", { who: w });
    } catch { setError("We could not save your answer. Please try again."); }
    finally { setBusy(false); }
  };

  if (deleted) return <RememberShell><p className="text-lg">Your story is deleted.</p></RememberShell>;
  if (!story) return <RememberShell><p className={error ? "text-lg" : "text-muted-foreground"}>{error || "Loading your story…"}</p></RememberShell>;

  const title = SPARKS[story.spark as SparkKey]?.title ?? "Your story";

  return (
    <RememberShell>
      <p className="mb-4 text-sm font-semibold uppercase text-primary">Your story</p>
      <StoryCard title={title} story={story.story} photoUrl={story.photoUrl} />
      <PhotoStrip photos={story.photos} />
      <AddPhotoButton busy={photoBusy} onFile={onPhoto} />
      {photoMsg && <p role="status" className="mt-2 text-sm text-primary">{photoMsg}</p>}

      <section className="mt-10">
        <h2 className="font-display text-3xl leading-tight">What your family added</h2>
        {story.replies.length > 0 && <p className="mt-2 text-muted-foreground">Read these to {story.childName || "them"} tonight.</p>}
        {story.replies.length ? (
          <ul className="mt-5 grid gap-4">
            {story.replies.map((r, i) => (
              <li key={i} className="border-l-2 border-primary bg-secondary px-5 py-4">
                <p className="font-display text-xl leading-snug">“{r.memory}”</p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">{r.name || "Someone in the family"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted-foreground">Nothing yet. When family add a memory, it shows here.</p>
        )}
      </section>

      {!answer ? (
        <div className="mt-12 border-t border-border pt-8">
          <h1 className="font-display text-3xl leading-tight">Did you tell it? Did anyone join in?</h1>
          <div className="mt-6 grid gap-3">
            <BigButton disabled={busy} onClick={() => pick("joined")}>Yes, someone added to it</BigButton>
            <BigButton disabled={busy} variant="outline" onClick={() => pick("just_me")}>I told it, just me</BigButton>
            <BigButton disabled={busy} variant="outline" onClick={() => pick("not_yet")}>Not yet</BigButton>
          </div>
        </div>
      ) : (
        <div className="mt-12 border-t border-border pt-8">
          {answer === "joined" && (
            <>
              <h1 className="font-display text-3xl leading-tight">Lovely. Who joined?</h1>
              <div className="mt-5 flex flex-wrap gap-2">
                {(Object.keys(WHO) as Who[]).map((w) => (
                  <button key={w} type="button" disabled={busy} onClick={() => toggleWho(w)} aria-pressed={who.includes(w)} className={`rounded-full border border-border px-5 py-2.5 font-semibold transition ${who.includes(w) ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}>
                    {WHO[w]}
                  </button>
                ))}
              </div>
            </>
          )}
          {answer === "just_me" && <h1 className="font-display text-3xl leading-tight">Thank you for telling it.</h1>}
          {answer === "not_yet" && <h1 className="font-display text-3xl leading-tight">That's fine. Tonight works too.</h1>}
          <div className="mt-10">
            <p className="font-display text-2xl">Who else has a story like this?</p>
            <a href={nomineeLink()} target="_blank" rel="noreferrer" onClick={() => window.__lovableEvents?.track?.("project.remember_nominate", { from: "checkin" })} className="mt-4 block rounded-sm border border-border bg-background px-5 py-4 text-center text-lg font-semibold hover:border-primary">
              Ask someone to share theirs
            </a>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-6 text-sm text-primary">{error}</p>}
      <p className="mt-12 text-center text-sm text-muted-foreground">Keep this link to yourself. It's the only way to check in or delete the story.</p>
      <button
        type="button"
        disabled={busy}
        className="mx-auto mt-4 block text-xs text-muted-foreground underline"
        onClick={async () => {
          if (!window.confirm("Delete this story?")) return;
          setBusy(true); setError("");
          try {
            const res = await del({ data: { token } });
            if ("error" in res) return setError(res.error ?? "Please try again.");
            setDeleted(true);
          } catch { setError("We could not delete your story. Please try again."); }
          finally { setBusy(false); }
        }}
      >
        Delete my story
      </button>
    </RememberShell>
  );
}
