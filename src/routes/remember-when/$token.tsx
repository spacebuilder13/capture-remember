import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { RememberTextarea } from "@/components/remember-textarea";

import { AddPhotoButton, BigButton, PhotoStrip, RememberShell, Rise, StoryCard, shrinkPhoto } from "@/components/remember-ui";
import { useSpeech } from "@/hooks/use-speech";
import { SPARKS, type SparkKey } from "@/lib/remember-sparks";
import { familyLinkHead, isPreviewBot } from "@/lib/remember-share";
import { addRememberPhoto, addRememberReply, getRememberPreviewMeta, getRememberStory } from "@/lib/remember.functions";

export const Route = createFileRoute("/remember-when/$token")({
  loader: ({ params }) => getRememberPreviewMeta({ data: { token: params.token } }).catch(() => null),
  head: ({ params, loaderData }) => familyLinkHead(params.token, loaderData),
  component: FamilyLink,
});

function FamilyLink() {
  const { token } = Route.useParams();
  const get = useServerFn(getRememberStory);
  const add = useServerFn(addRememberReply);
  const speech = useSpeech(60);
  const addPhoto = useServerFn(addRememberPhoto);
  const [story, setStory] = useState<{ spark: string; story: string; senderName?: string | null; childName?: string | null; photoUrl?: string | null; photos: { url: string; addedBy: string | null }[] } | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMsg, setPhotoMsg] = useState("");
  const onPhoto = async (f: File) => {
    setPhotoBusy(true); setPhotoMsg("");
    try {
      const fd = new FormData();
      fd.append("token", token);
      if (name.trim()) fd.append("name", name.trim());
      fd.append("photo", await shrinkPhoto(f));
      const res = await addPhoto({ data: fd });
      if ("error" in res) { window.__lovableEvents?.track?.("project.remember_photo_add_failed", {}); return setPhotoMsg(res.error ?? "Please try again."); }
      setStory((s) => (s ? { ...s, photos: res.photos } : s));
      setPhotoMsg("Photo added.");
      window.__lovableEvents?.track?.("project.remember_photo_added", { role: "family" });
    } catch { window.__lovableEvents?.track?.("project.remember_photo_add_failed", {}); setPhotoMsg("We could not save your photo. Please try again."); }
    finally { setPhotoBusy(false); }
  };
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const memory = speech.text;

  useEffect(() => {
    if (isPreviewBot(navigator.userAgent)) return; // preview readers are not visitors
    get({ data: { token } })
      .then((r) => ("error" in r ? setError(r.error ?? "") : setStory(r)))
      .catch(() => setError("This link does not work."));
  }, [token, get]);

  const onAdd = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await add({ data: { token, memory, name: name || undefined } });
      if ("error" in res) return setError(res.error ?? "Please try again.");
      window.__lovableEvents?.track?.("project.remember_reply_added", {});
      setDone(true);
    } catch { setError("We could not save your memory. Please try again."); }
    finally { setBusy(false); }
  };

  if (!story) return <RememberShell><p className={error ? "text-lg" : "text-muted-foreground"}>{error || "Loading the story…"}</p></RememberShell>;

  const title = SPARKS[story.spark as SparkKey]?.title ?? "A family story";
  const who = story.senderName || "Someone in your family";
  const kid = story.childName || "your little one";
    const STARTERS = ["I remember when…", "The funny part was…", "What you don't know is…"];

  return (
    <RememberShell>
      <p className="mb-4 font-display text-2xl leading-snug">{who} is telling {kid} this story tonight.</p>
      <StoryCard title={title} story={story.story} photoUrl={story.photoUrl} />
      <PhotoStrip photos={story.photos} />

      {done ? (
        <Rise className="mt-10">
          <p className="flex items-center gap-2 font-display text-3xl leading-tight">
            <Check className="size-7 text-primary" /> Added.
          </p>
          <p className="mt-2 text-lg text-muted-foreground">{name.trim() ? `Thank you, ${name.trim()}. ` : ""}{story.childName || "They"} will hear your part tonight.</p>
          <Link to="/remember-when" className="mt-8 block rounded-sm border-2 border-primary bg-background px-5 py-4 text-center text-lg font-semibold hover:bg-secondary">
            Share a story of your own
          </Link>
        </Rise>
      ) : (
        <div className="mt-10">
          <h1 className="font-display text-4xl leading-tight">What do you remember that {story.senderName || "they"} might not?</h1>
          <p className="mt-3 text-muted-foreground">One line is enough. {story.senderName || "They"} will read it to {kid} tonight, in your name.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {STARTERS.map((t) => (
              <button key={t} type="button" onClick={() => speech.setText(t + " ")} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-primary">{t}</button>
            ))}
          </div>
          <blockquote className="relative mt-8 px-8 sm:px-10">
            <span aria-hidden className="absolute -top-4 left-0 font-display text-6xl leading-none text-primary">“</span>
            <RememberTextarea
              value={speech.listening ? `${memory} ${speech.interim}`.trim() : memory}
              readOnly={speech.listening}
              onChange={(e) => speech.setText(e.target.value.slice(0, 400))}
              placeholder="I remember when…"
              aria-label="What you remember"
              rows={3}
              className="block w-full resize-none overflow-hidden border-b border-transparent bg-transparent font-display text-xl leading-snug outline-none placeholder:text-muted-foreground focus:border-border sm:text-2xl"
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
            How should {story.childName || "they"} know you? <span className="font-normal text-muted-foreground">(optional)</span>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder="For example, Nani" className="mt-2 block h-12 w-full rounded-sm border border-border bg-background px-4 text-base outline-none focus:border-primary" />
          </label>
          <p className="mt-8 text-sm font-semibold">Have a photo from that time? <span className="font-normal text-muted-foreground">(optional)</span></p>
          <AddPhotoButton busy={photoBusy} onFile={onPhoto} />
          <p className="mt-2 text-xs text-muted-foreground">Anyone with this link can see and add to this story.</p>
          {photoMsg && <p role="status" className="mt-2 text-sm text-primary">{photoMsg}</p>}
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
