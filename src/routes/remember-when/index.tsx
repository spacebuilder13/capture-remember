import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, ImagePlus, Keyboard, Lock, Mail, Mic, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { BigButton, MemHeader, RememberShell, Rise, SparkCard, StoryCard, emailLink, familyLink, ownerLink } from "@/components/remember-ui";
import storyImage from "@/assets/one-story-together/remember-when/story.jpg.asset.json";
import squareImage from "@/assets/one-story-together/remember-when/square.jpg.asset.json";
import { ANIMALS } from "@/components/remember-animals";
import { useSpeech } from "@/hooks/use-speech";
import { SPARKS, SPARK_KEYS, type SparkKey } from "@/lib/remember-sparks";
import { saveRememberStory, setRememberNames, uploadRememberPhoto } from "@/lib/remember.functions";

const search = z.object({
  src: z.enum(["feed", "story"]).optional().catch(undefined),
  from: z.enum(["nominee"]).optional().catch(undefined),
});

export const Route = createFileRoute("/remember-when/")({
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

type Stage = "open" | "photo" | "spark" | "tell" | "tonight";

async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const b = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.85));
    return b ?? file;
  } catch {
    return file;
  }
}

function RememberWhen() {
  const { src, from } = Route.useSearch();
  const [stage, setStage] = useState<Stage>("open");
  const [spark, setSpark] = useState<SparkKey | null>(null);
  const [mode, setMode] = useState<"spoken" | "typed">("spoken");
  const [token, setToken] = useState<string | null>(null);
  const [ownerToken, setOwnerToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sender, setSender] = useState("");
  const [child, setChild] = useState("");
  const saveNames = useServerFn(setRememberNames);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const speech = useSpeech(60);
  const save = useServerFn(saveRememberStory);
  const upload = useServerFn(uploadRememberPhoto);
  const [picks, setPicks] = useState<{ file: File; url: string }[]>([]);
  const [chosen, setChosen] = useState(0);
  const [photo, setPhoto] = useState<{ url: string } | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [uploadedIdx, setUploadedIdx] = useState<number | null>(null);

  useEffect(() => () => picks.forEach((p) => URL.revokeObjectURL(p.url)), [picks]);

  const onPick = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/") || f.type === "").slice(0, 6);
    if (!files.length) return;
    setError("");
    window.__lovableEvents?.track?.(picks.length ? "project.remember_photo_replaced" : "project.remember_photo_picked", picks.length ? {} : { count: files.length });
    setPicks(files.map((file) => ({ file, url: URL.createObjectURL(file) })));
    setChosen(0);
    setPhotoPath(null);
    setUploadedIdx(null);
  };

  const onUsePhoto = async () => {
    const pick = picks[chosen];
    if (!pick) return;
    if (photoPath && uploadedIdx === chosen) return go("tell");
    setBusy(true);
    setError("");
    window.__lovableEvents?.track?.("project.remember_photo_chosen", { position: chosen + 1, count: picks.length });
    const blob = await shrink(pick.file);
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto({ url: URL.createObjectURL(blob) });
    const fd = new FormData();
    fd.append("photo", new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" }));
    try {
      const res = await upload({ data: fd });
      if ("error" in res) throw new Error(res.error);
      setPhotoPath(res.path);
      setUploadedIdx(chosen);
      go("tell");
    } catch (e) {
      window.__lovableEvents?.track?.("project.remember_photo_failed", {});
      setError(e instanceof Error && e.message ? e.message : "We could not save your photo. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const typedOnly = speech.supported === false || speech.denied || mode === "typed";
  const story = speech.text;

  const go = (s: Stage) => {
    setStage(s);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const onSave = async () => {
    if (!spark || !photoPath || story.trim().length < 3) return;
    setBusy(true);
    setError("");
    const res = await save({ data: { photoPath, spark, story, mode: typedOnly ? "typed" : mode, source: src, nominatedBy: from } });
    setBusy(false);
    if ("error" in res) return setError(res.error ?? "Please try again.");
    window.__lovableEvents?.track?.("project.remember_story_saved", { spark, mode: typedOnly ? "typed" : mode, length: story.length });
    setToken(res.token);
    setOwnerToken(res.ownerToken);
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
        <div className="hidden [@media(min-aspect-ratio:3/4)]:block [@media(min-aspect-ratio:3/4)]:absolute [@media(min-aspect-ratio:3/4)]:inset-x-0 [@media(min-aspect-ratio:3/4)]:top-0 [@media(min-aspect-ratio:3/4)]:z-20"><MemHeader /></div>
        <h1 className="sr-only [@media(min-aspect-ratio:3/4)]:hidden">Who's that baby?</h1>
        <section className="flex flex-col items-center bg-secondary [@media(min-aspect-ratio:3/4)]:hidden">
          <div className="relative w-full max-w-[calc(82svh*9/16)]">
            <MemHeader overPhoto />
            <img src={storyImage.url} alt="A father, mother and their two-year-old look at a baby photo on a phone. Who's that baby?" className="block h-auto w-full" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-foreground/45 to-transparent" />
          </div>
          <div className="w-full max-w-[calc(82svh*9/16)] px-5 py-5">{startButton}</div>
        </section>
        <section className="hidden min-h-svh bg-secondary [@media(min-aspect-ratio:3/4)]:grid [@media(min-aspect-ratio:3/4)]:grid-cols-[1fr_auto]">
          <div className="flex flex-col justify-center px-8 pt-20 pb-12 lg:px-16">
            <h1 className="max-w-lg font-display text-4xl leading-tight lg:text-6xl">What's the first story your little one would ask about?</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">Pick one. Tell it in your own words. Tell it to them tonight.</p>
            <div className="mt-8">{startButton}</div>
          </div>
          <img src={squareImage.url} alt="A father, mother and their two-year-old look at a baby photo on a phone. Who's that baby?" className="aspect-square mr-[4vw] w-[50vw] max-w-[88svh] self-center rounded-sm shadow-lg object-cover" />
        </section>
        <section className="bg-secondary py-20 sm:py-28 [@media(min-aspect-ratio:3/4)]:hidden">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className="font-display text-4xl leading-tight sm:text-5xl">What's the first story your little one would ask about?</p>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">Pick one. Tell it in your own words. Tell it to them tonight.</p>
          </div>
        </section>
      </main>
    );

  if (stage === "photo")
    return (
      <RememberShell step={2}>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Add the photo.</h1>
        <p className="mt-3 text-muted-foreground">{spark ? <>Find a photo for: <span className="font-semibold text-foreground">{SPARKS[spark].title}</span></> : "Find the photo they would ask about."}</p>
        {picks.length === 1 ? (
          <Rise className="mt-8 flex flex-col items-center">
            <img src={picks[0]?.url} alt="The photo you picked" className="max-h-[50svh] w-auto rotate-[-1.5deg] border-8 border-background object-contain shadow-lg" />
            <label className="mt-5 cursor-pointer text-sm underline">
              Pick again
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { onPick(e.target.files); e.target.value = ""; }} />
            </label>
          </Rise>
        ) : picks.length > 1 ? (
          <div className="mt-8">
            <p className="mb-4 font-display text-2xl">Which one would they ask about?</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {picks.map((p, i) => (
                <Rise key={p.url} delay={60 * i}>
                  <button
                    type="button"
                    aria-label={`Photo ${i + 1}`}
                    aria-pressed={chosen === i}
                    onClick={() => setChosen(i)}
                    className={`relative block w-full border-[6px] bg-background shadow-md transition ${chosen === i ? "rotate-[-2deg] border-primary" : "border-background hover:border-border"}`}
                  >
                    <img src={p.url} alt="" className="aspect-square w-full object-cover" />
                    {chosen === i && (
                      <span className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-4" />
                      </span>
                    )}
                  </button>
                </Rise>
              ))}
            </div>
            <label className="mt-5 block cursor-pointer text-center text-sm underline">
              Pick again
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { onPick(e.target.files); e.target.value = ""; }} />
            </label>
          </div>
        ) : (
          <label className="mt-8 flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-primary bg-secondary text-center transition hover:bg-secondary/70">
            <ImagePlus className="size-12 text-primary" />
            <span className="text-lg font-semibold">Pick a few photos</span>
            <span className="text-sm text-muted-foreground">Up to 6 from your phone</span>
            <input type="file" accept="image/*" multiple aria-label="Pick photos" className="sr-only" onChange={(e) => { onPick(e.target.files); e.target.value = ""; }} />
          </label>
        )}
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" /> Only you and the people you send it to can see this photo.</p>
        {error && <p className="mt-4 text-sm text-primary">{error}</p>}
        <div className="mt-6">
          <BigButton onClick={onUsePhoto} disabled={!picks.length || busy}>{busy ? "Saving photo…" : "Use this photo"}</BigButton>
        </div>
      </RememberShell>
    );

  if (stage === "spark")
    return (
      <RememberShell step={1}>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Pick a story to tell.</h1>
        <p className="mt-3 text-muted-foreground">Tap one.</p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {SPARK_KEYS.map((k, i) => (
            <SparkCard
              key={k}
              index={i}
              art={ANIMALS[k]()}
              onClick={() => {
                window.__lovableEvents?.track?.("project.remember_spark_picked", { spark: k });
                setSpark(k);
                speech.setText("");
                window.__lovableEvents?.track?.("project.remember_photo_step_shown", {});
                go("photo");
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
      <RememberShell step={3}>
        <p className="text-xs font-semibold uppercase text-primary">{SPARKS[spark].title}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Tell it in your own words.</h1>
        <blockquote className="relative mt-8 px-8 sm:px-10">
          <span aria-hidden className="absolute -top-4 left-0 font-display text-6xl leading-none text-primary">“</span>
          {typedOnly || !speech.listening ? (
            <textarea
              value={story}
              onChange={(e) => {
                speech.setText(e.target.value.slice(0, 400));
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder={SPARKS[spark].starter}
              aria-label="Your story"
              rows={2}
              className="block w-full resize-none overflow-hidden border-b border-transparent bg-transparent font-display text-xl leading-snug outline-none placeholder:text-muted-foreground/70 focus:border-border sm:text-2xl"
            />
          ) : (
            <p className="min-h-[3.5rem] font-display text-xl leading-snug sm:text-2xl" aria-live="polite">
              {story || <span className="text-muted-foreground/70">{story ? "" : SPARKS[spark].starter}</span>} <span className="text-muted-foreground">{speech.interim}</span>
              <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-primary align-middle" />
            </p>
          )}
          <span aria-hidden className="absolute -bottom-8 right-0 font-display text-6xl leading-none text-primary">”</span>
          <p className="mt-1 text-right text-xs text-muted-foreground">{story.length}/400</p>
        </blockquote>

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

  const names = { sender: sender.trim(), child: child.trim() };
  const namesOk = !!names.sender && !!names.child;
  const persistNames = () => (ownerToken ? saveNames({ data: { token: ownerToken, ...names } }).catch(() => {}) : Promise.resolve());

  return (
    <RememberShell step={4}>
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">Tell it to them tonight.</h1>
      <div className="mt-6">{spark && <StoryCard title={SPARKS[spark].title} story={story} photoUrl={photo?.url} />}</div>
      <Rise delay={300} className="mt-10">
        {sent ? (
          <p className="flex items-center gap-2 text-lg font-semibold">
            <Check className="size-5 text-primary" /> Sent. Tell it tonight.
          </p>
        ) : (
          <p className="font-display text-2xl leading-snug">Who else was there? Ask them to add their part.</p>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Your name
            <input value={sender} onChange={(e) => setSender(e.target.value.slice(0, 40))} placeholder="For example, Priya" className="mt-2 block h-12 w-full rounded-sm border border-border bg-background px-4 text-base font-normal outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-semibold">
            Your little one's name
            <input value={child} onChange={(e) => setChild(e.target.value.slice(0, 40))} placeholder="For example, Arjun" className="mt-2 block h-12 w-full rounded-sm border border-border bg-background px-4 text-base font-normal outline-none focus:border-primary" />
          </label>
        </div>
        <a
          href={spark && token ? familyLink(SPARKS[spark].title, names, token) : "#"}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!namesOk}
          onClick={(e) => {
            if (!namesOk) return e.preventDefault();
            void persistNames();
            window.__lovableEvents?.track?.("project.remember_family_shared", {});
            setSent(true);
          }}
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <Send className="size-5" /> Send it on WhatsApp
        </a>
        <a
          href={spark && token ? emailLink(SPARKS[spark].title, names, token) : "#"}
          aria-disabled={!namesOk}
          onClick={(e) => {
            if (!namesOk) return e.preventDefault();
            void persistNames();
            window.__lovableEvents?.track?.("project.remember_email_shared", {});
            setSent(true);
          }}
          className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-sm border-2 border-primary bg-background px-6 text-base font-semibold text-foreground transition hover:bg-secondary aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <Mail className="size-5" /> Send it by email
        </a>
        {sent && ownerToken && (
          <div className="mt-8 rounded-sm bg-secondary px-5 py-4">
            <p className="font-semibold">Save your private link</p>
            <p className="mt-1 text-sm text-muted-foreground">See what family add, and tell us how tonight went.</p>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(ownerLink(ownerToken)).catch(() => {});
                window.__lovableEvents?.track?.("project.remember_owner_link_copied", {});
                setCopied(true);
              }}
              className="mt-3 inline-flex h-11 items-center gap-2 rounded-sm border border-border bg-background px-4 text-sm font-semibold hover:border-primary"
            >
              {copied ? <><Check className="size-4 text-primary" /> Copied</> : "Copy my private link"}
            </button>
          </div>
        )}
      </Rise>
    </RememberShell>
  );
}
