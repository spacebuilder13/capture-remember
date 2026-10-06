import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Lock, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import incompletePhotograph from "@/assets/incomplete-photograph-preview.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Preserve one memory | MemReel" },
      {
        name: "description",
        content: "Give one family photo the story it cannot hold on its own.",
      },
      { property: "og:title", content: "Preserve one memory | MemReel" },
      {
        property: "og:description",
        content: "Give one family photo the story it cannot hold on its own.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type MemoryDraft = {
  happened: string;
  remembers: string;
  missing: string;
  email: string;
};

const EMPTY_DRAFT: MemoryDraft = { happened: "", remembers: "", missing: "", email: "" };

function Index() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draft, setDraft] = useState<MemoryDraft>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const canContinue = useMemo(() => {
    if (step === 0) return photo !== null;
    if (step === 4) return /^\S+@\S+\.\S+$/.test(draft.email);
    return true;
  }, [draft.email, photo, step]);

  const begin = () => {
    setStarted(true);
    requestAnimationFrame(() => document.querySelector("#memory-flow")?.scrollIntoView({ behavior: "smooth" }));
  };

  const updateDraft = (field: keyof MemoryDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const choosePhoto = (file?: File) => {
    setError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose a photo smaller than 10 MB.");
      return;
    }
    setPhoto(file);
  };

  const submitMemory = async () => {
    if (!photo || !canContinue) return;
    setSubmitting(true);
    setError("");

    const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
    const photoPath = `incoming/${crypto.randomUUID()}.${extension}`;
    const upload = await supabase.storage.from("memory-contributions").upload(photoPath, photo, {
      contentType: photo.type,
      upsert: false,
    });

    if (upload.error) {
      setError("Your photo could not be saved. Please try again.");
      setSubmitting(false);
      return;
    }

    const insert = await supabase.from("memory_contributions").insert({
      photo_path: photoPath,
      happened: draft.happened.trim() || null,
      remembers: draft.remembers.trim() || null,
      missing: draft.missing.trim() || null,
      email: draft.email.trim(),
      status: "requested",
    });

    if (insert.error) {
      await supabase.storage.from("memory-contributions").remove([photoPath]);
      setError("Your memory could not be saved. Please try again.");
      setSubmitting(false);
      return;
    }

    setComplete(true);
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <a href="https://memreel.io/" className="font-display text-2xl text-foreground" aria-label="MemReel home">
          Mem<span className="text-primary">Reel</span>
        </a>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3.5" /> Private to you
        </span>
      </header>

      <section className="relative flex min-h-[92svh] items-end bg-foreground">
        <img
          src={incompletePhotograph}
          alt="Illustrative parent and child building a blanket fort, with part of the photograph left intentionally blank"
          className="absolute inset-0 h-full w-full object-cover object-[63%_center] opacity-90"
          width={1280}
          height={720}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_15%,oklch(0.19_0.01_30/.15)_44%,oklch(0.19_0.01_30/.88)_100%)]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 sm:pb-14 lg:px-12">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-medium text-primary-foreground/75">The incomplete photograph</p>
            <h1 className="font-display text-5xl leading-[1.02] text-primary-foreground sm:text-7xl">
              A photo can’t remember for you.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              It kept the light, the faces, the room. What did it leave out?
            </p>
            <Button size="lg" onClick={begin} className="mt-7 h-12 rounded-sm px-6 text-base shadow-none">
              Preserve one memory <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">An illustrative example</p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">The photograph kept the fort.</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              But not the name she gave it. Not the rule about who could come inside. Not the way she whispered the password.
            </p>
          </div>
          <div className="relative">
            <img
              src={incompletePhotograph}
              alt="Illustrative memory of a parent and child making a blanket fort"
              className="aspect-[16/10] w-full object-cover shadow-[0_24px_70px_oklch(0.28_0.02_30/.16)]"
              width={1280}
              height={720}
              loading="lazy"
            />
            <div className="relative -mt-10 ml-5 max-w-md border-l-2 border-primary bg-background px-5 py-4 shadow-lg sm:ml-auto sm:mr-8">
              <p className="font-display text-xl leading-snug">“You can come in, but only if you bring snacks.”</p>
              <p className="mt-2 text-xs text-muted-foreground">A fictional example of the detail a photo cannot hold.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="memory-flow" className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          {!started ? (
            <div className="text-center">
              <Sparkles className="mx-auto size-6 text-primary" />
              <h2 className="mt-5 font-display text-4xl sm:text-5xl">What does one of your photos no longer tell you?</h2>
              <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted-foreground">
                Choose one ordinary photo. Add only what you still remember. It is okay to leave something blank.
              </p>
              <Button size="lg" onClick={begin} className="mt-8 h-12 rounded-sm px-6 text-base shadow-none">
                Preserve one memory <ArrowRight />
              </Button>
            </div>
          ) : complete ? (
            <Completion photoUrl={previewUrl} draft={draft} />
          ) : (
            <div>
              <div className="mb-10 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-primary">Your memory</p>
                  <p className="mt-1 text-sm text-muted-foreground">Step {step + 1} of 5</p>
                </div>
                <div className="flex gap-1.5" aria-label={`Step ${step + 1} of 5`}>
                  {[0, 1, 2, 3, 4].map((item) => (
                    <span key={item} className={`h-1.5 w-8 ${item <= step ? "bg-primary" : "bg-border"}`} />
                  ))}
                </div>
              </div>

              {step === 0 && (
                <div>
                  <h2 className="font-display text-4xl">Choose one photo.</h2>
                  <p className="mt-3 text-muted-foreground">JPG, PNG, or WebP. Up to 10 MB.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => choosePhoto(event.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-7 flex aspect-[16/9] w-full cursor-pointer items-center justify-center overflow-hidden border border-dashed border-primary/50 bg-secondary text-center transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Your selected memory" className="h-full w-full object-contain" />
                    ) : (
                      <span className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                        <ImagePlus className="size-8 text-primary" /> Choose a photo
                      </span>
                    )}
                  </button>
                </div>
              )}

              {step === 1 && (
                <PromptStep
                  title="What was happening?"
                  hint="A few words are enough."
                  value={draft.happened}
                  placeholder="We had just finished breakfast…"
                  onChange={(value) => updateDraft("happened", value)}
                />
              )}
              {step === 2 && (
                <PromptStep
                  title="What do you still remember?"
                  hint="A phrase, a feeling, a small detail."
                  value={draft.remembers}
                  placeholder="She kept calling the blanket fort…"
                  onChange={(value) => updateDraft("remembers", value)}
                />
              )}
              {step === 3 && (
                <PromptStep
                  title="What can’t the photo show?"
                  hint="If you cannot remember, you can leave this blank."
                  value={draft.missing}
                  placeholder="The words she used, the reason we were laughing…"
                  onChange={(value) => updateDraft("missing", value)}
                />
              )}
              {step === 4 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-primary">One last detail</p>
                  <h2 className="mt-3 font-display text-4xl">Where should we send your memory?</h2>
                  <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                    Your photo and words stay private. This early experience prepares your memory for the MemReel team to deliver.
                  </p>
                  <label className="mt-7 block text-sm font-medium" htmlFor="email">Email address</label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={draft.email}
                    onChange={(event) => updateDraft("email", event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 h-12 rounded-sm bg-background text-base"
                  />
                  <div className="mt-8 grid gap-6 border-y border-border py-6 sm:grid-cols-[9rem_1fr]">
                    {previewUrl && <img src={previewUrl} alt="Memory preview" className="aspect-square w-full object-cover" />}
                    <div className="space-y-3 text-sm">
                      <PreviewLine label="What happened" value={draft.happened} />
                      <PreviewLine label="What you remember" value={draft.remembers} />
                      <PreviewLine label="What is missing" value={draft.missing} />
                    </div>
                  </div>
                </div>
              )}

              {error && <p role="alert" className="mt-5 text-sm text-destructive">{error}</p>}
              <div className="mt-8 flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={() => (step === 0 ? setStarted(false) : setStep((current) => current - 1))}
                >
                  <ArrowLeft /> Back
                </Button>
                {step < 4 ? (
                  <Button
                    onClick={() => setStep((current) => current + 1)}
                    disabled={!canContinue}
                    className="rounded-sm shadow-none"
                  >
                    {step > 0 && !draft[["happened", "remembers", "missing"][step - 1] as keyof MemoryDraft] ? "Skip" : "Continue"}
                    <ArrowRight />
                  </Button>
                ) : (
                  <Button onClick={submitMemory} disabled={!canContinue || submitting} className="rounded-sm shadow-none">
                    {submitting ? "Saving…" : "Preserve this memory"}
                    {!submitting && <ArrowRight />}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border bg-background px-5 py-8 text-center text-xs text-muted-foreground">
        <p>MemReel · Private family memories, with the story still attached.</p>
      </footer>
    </main>
  );
}

function PromptStep({
  title,
  hint,
  value,
  placeholder,
  onChange,
}: {
  title: string;
  hint: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{hint}</p>
      <Textarea
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={800}
        className="mt-7 min-h-44 resize-none rounded-sm bg-background p-4 text-base leading-relaxed"
      />
      <p className="mt-2 text-right text-xs text-muted-foreground">{value.length}/800</p>
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-foreground">{value || "Left open"}</p>
    </div>
  );
}

function Completion({ photoUrl, draft }: { photoUrl: string | null; draft: MemoryDraft }) {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-5" />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase text-primary">Memory preserved</p>
      <h2 className="mx-auto mt-3 max-w-xl font-display text-4xl leading-tight sm:text-5xl">The photo has more of its story now.</h2>
      <div className="mx-auto mt-10 grid max-w-2xl gap-0 bg-secondary text-left sm:grid-cols-2">
        {photoUrl && <img src={photoUrl} alt="Your preserved memory" className="aspect-square h-full w-full object-cover" />}
        <div className="flex flex-col justify-center p-7 sm:p-9">
          <p className="font-display text-2xl leading-snug">{draft.remembers || draft.happened || "One moment, held with more than a photograph."}</p>
          {draft.missing && <p className="mt-5 border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground">The photo could not show: {draft.missing}</p>}
        </div>
      </div>
      <p className="mx-auto mt-7 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Your request is safely recorded for {draft.email}. Email delivery is being prepared for this early experience.
      </p>
    </div>
  );
}
