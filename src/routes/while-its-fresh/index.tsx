import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Copy, ImagePlus, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";

import { RememberTextarea } from "@/components/remember-textarea";
import { BigButton, RememberShell, Rise, StoryCard, ownerLink, shrinkPhoto } from "@/components/remember-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSpeech } from "@/hooks/use-speech";
import { supabase } from "@/integrations/supabase/client";
import { isPreviewBot } from "@/lib/remember-share";
import { WIF_SPARKS, WIF_SPARK_KEYS, type WifSparkKey } from "@/lib/remember-sparks";
import { saveRememberStory, uploadRememberPhoto } from "@/lib/remember.functions";
import { photoAgeDays } from "@/lib/wif-photo-age";

export const Route = createFileRoute("/while-its-fresh/")({
  head: () => ({
    meta: [
      { title: "While It's Fresh | MemReel" },
      { name: "description", content: "Something happened this week. Keep the why on the photo before the chat moves on." },
      { property: "og:title", content: "While It's Fresh | MemReel" },
      { property: "og:description", content: "Something happened this week. Keep the why on the photo before the chat moves on." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhileItsFresh,
});

type Stage = "open" | "moment" | "photo" | "why" | "kept";
const emailSchema = z.string().trim().email().max(320);

function WhileItsFresh() {
  const [stage, setStage] = useState<Stage>("open");
  const [spark, setSpark] = useState<WifSparkKey | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [ageDays, setAgeDays] = useState<number | null>(null);
  const [mode, setMode] = useState<"spoken" | "typed">("typed");
  const [ownerToken, setOwnerToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailDone, setEmailDone] = useState(false);
  const visited = useRef(false);

  const speech = useSpeech(60);
  const upload = useServerFn(uploadRememberPhoto);
  const save = useServerFn(saveRememberStory);

  useEffect(() => {
    if (visited.current) return;
    visited.current = true;
    if (!isPreviewBot(navigator.userAgent)) {
      window.__lovableEvents?.track?.("project.wif_visit", {});
    }
  }, []);

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  const go = (s: Stage) => {
    setError("");
    setStage(s);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const onPickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const detectedAge = await photoAgeDays(file);
      const small = await shrinkPhoto(file);
      const fd = new FormData();
      fd.append("photo", small);
      const res = await upload({ data: fd });
      if ("error" in res) {
        setError(res.error ?? "We could not save your photo. Please try again.");
        return;
      }
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      setPhotoUrl(URL.createObjectURL(small));
      setPhotoPath(res.path);
      setAgeDays(detectedAge);
      go("why");
    } catch {
      setError("We could not save your photo. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onKeep = async () => {
    if (!spark || !photoPath || speech.text.trim().length < 3) return;
    setBusy(true);
    setError("");
    try {
      const res = await save({
        data: {
          photoPath,
          spark,
          story: speech.text,
          mode,
          source: "wif",
          photoAgeDays: ageDays,
        },
      });
      if ("error" in res) return setError(res.error ?? "Please try again.");
      window.__lovableEvents?.track?.("project.wif_story_kept", { photo_age_days: ageDays });
      setOwnerToken(res.ownerToken);
      go("kept");
    } catch {
      setError("We could not save your memory. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onJoinKeep = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setEmailMsg("Please enter a valid email.");
    setEmailBusy(true);
    setEmailMsg("");
    const { error: err } = await supabase.from("journal_waitlist").insert({ email: parsed.data, source: "wif" });
    setEmailBusy(false);
    if (err) return setEmailMsg("That didn't go through. Please try again.");
    window.__lovableEvents?.track?.("project.wif_keep_signup", {});
    setEmail(parsed.data);
    setEmailDone(true);
  };

  if (stage === "open") {
    return (
      <RememberShell badge="Private to you">
        <Rise className="py-10 sm:py-16">
          <p className="text-xs font-semibold uppercase text-primary">While it's fresh</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.06] sm:text-6xl">
            Something happened this week. You can still tell it word for word.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Keep the why on the photo before the chat moves on. One photo, a minute, in your own words.
          </p>
          <div className="mt-9 max-w-sm">
            <BigButton onClick={() => go("moment")}>
              Keep this moment <ArrowRight className="ml-2 size-5" />
            </BigButton>
          </div>
        </Rise>
      </RememberShell>
    );
  }

  if (stage === "moment") {
    return (
      <RememberShell step={1} badge="Private to you">
        <Rise>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">What kind of moment was it?</h1>
          <p className="mt-3 text-muted-foreground">Pick the one that fits this week's moment.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {WIF_SPARK_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { setSpark(k); go("photo"); }}
                className="flex min-h-20 items-center justify-between rounded-sm border-2 border-border bg-background px-5 py-4 text-left text-lg font-semibold transition hover:border-primary hover:bg-secondary active:scale-[0.99]"
              >
                <span>{WIF_SPARKS[k].title}</span>
                <ArrowRight className="size-4 text-primary" />
              </button>
            ))}
          </div>
        </Rise>
      </RememberShell>
    );
  }

  if (stage === "photo") {
    return (
      <RememberShell step={2} badge="Private to you">
        <Rise>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">Add the photo from that moment</h1>
          <p className="mt-3 text-muted-foreground">One photo is enough. It stays private to your link.</p>
          <label className={`mt-8 flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-primary/70 bg-secondary/40 px-6 py-10 text-center transition hover:bg-secondary ${busy ? "pointer-events-none opacity-60" : ""}`}>
            <ImagePlus className="size-8 text-primary" />
            <span className="text-base font-semibold">{busy ? "Saving your photo…" : "Choose a photo"}</span>
            <span className="text-xs text-muted-foreground">JPG, PNG, WebP or HEIC, up to 5 MB</span>
            <input type="file" accept="image/*" className="sr-only" aria-label="Choose a photo" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void onPickPhoto(f); }} />
          </label>
          {error && <p role="alert" className="mt-4 text-sm text-primary">{error}</p>}
        </Rise>
      </RememberShell>
    );
  }

  if (stage === "why") {
    const canSpeak = speech.supported !== false && !speech.denied;
    const chars = speech.text.length;
    return (
      <RememberShell step={3} badge="Private to you">
        <Rise>
          {photoUrl && (
            <img src={photoUrl} alt="Your chosen photo" className="mb-6 max-h-56 w-auto rotate-[-1deg] border-[5px] border-background object-contain shadow-md" />
          )}
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">What was said? What made you laugh? Why did it matter?</h1>
          <p className="mt-3 text-muted-foreground">In your own words — type it or speak it out loud.</p>

          <div className="mt-6">
            <RememberTextarea
              value={speech.text}
              maxLength={400}
              placeholder="Write it the way you'd tell a friend…"
              aria-label="Your memory"
              onChange={(e) => { setMode("typed"); speech.setText(e.target.value); }}
              className="w-full border-b-2 border-border bg-transparent py-3 font-display text-2xl leading-snug placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{chars} / 400</span>
              {canSpeak && (
                <button
                  type="button"
                  onClick={() => {
                    if (speech.listening) { speech.stop(); }
                    else { setMode("spoken"); speech.start(); }
                  }}
                  className="inline-flex items-center gap-1.5 font-semibold text-primary"
                >
                  {speech.listening ? <><Square className="size-3.5 fill-current" /> Stop speaking</> : <><Mic className="size-3.5" /> Speak instead</>}
                </button>
              )}
            </div>
          </div>

          {error && <p role="alert" className="mt-4 text-sm text-primary">{error}</p>}
          <div className="mt-8">
            <BigButton disabled={busy || speech.text.trim().length < 3} onClick={onKeep}>
              {busy ? "Keeping…" : "Keep this memory"}
            </BigButton>
          </div>
        </Rise>
      </RememberShell>
    );
  }

  const privateUrl = ownerToken ? ownerLink(ownerToken) : "";

  return (
    <RememberShell step={4} badge="Private to you">
      <Rise>
        <p className="text-xs font-semibold uppercase text-primary">Kept</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">You kept it while it was fresh.</h1>
        <div className="mt-6">
          <StoryCard title={spark ? WIF_SPARKS[spark].title : "Your memory"} story={speech.text} photoUrl={photoUrl} />
        </div>

        {privateUrl && (
          <div className="mt-6 border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Your private link</p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-sm shadow-none"
                onClick={async () => {
                  await navigator.clipboard.writeText(privateUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
              >
                {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Save this link to come back to your memory or delete it. Only people with this link can open it.</p>
          </div>
        )}

        <section className="mt-10 border-t border-border pt-8">
          {emailDone ? (
            <div role="status" className="border border-border bg-secondary/50 p-6 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-6" />
              </span>
              <h2 className="mt-4 font-display text-3xl">Invite requested</h2>
              <p className="mt-2 break-words text-sm text-muted-foreground">
                We've noted <span className="font-medium text-foreground">{email}</span>. We'll send your free Keep invite as spots open.
              </p>
            </div>
          ) : (
            <form onSubmit={onJoinKeep} className="space-y-4">
              <h2 className="font-display text-3xl leading-tight">Want a place to keep these every week?</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Request an invite to MemReel's free Keep tier. We'll email you when your spot opens — no instant account needed today.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="h-12 rounded-sm bg-background"
                />
                <Button type="submit" disabled={emailBusy} className="h-12 shrink-0 rounded-sm px-6">
                  {emailBusy ? "Requesting…" : "Request my Keep invite"}
                </Button>
              </div>
              {emailMsg && <p role="alert" className="text-sm text-primary">{emailMsg}</p>}
            </form>
          )}
        </section>
      </Rise>
    </RememberShell>
  );
}