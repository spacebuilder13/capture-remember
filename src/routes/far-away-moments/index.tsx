import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import reel from "@/assets/far-away/come-and-look-reel.mp4.asset.json";
import poster from "@/assets/far-away/reel-poster.jpg.asset.json";
import tower from "@/assets/far-away/tower.jpg.asset.json";
import twoHomes from "@/assets/far-away/two-homes.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { logMomentEvent, rewriteMoment, submitMoment } from "@/lib/moments.functions";

export const Route = createFileRoute("/far-away-moments/")({
  head: () => ({
    meta: [
      { title: "Far-Away Moments | MemReel" },
      {
        name: "description",
        content: "The photo usually gets there. MemReel helps the rest of the moment reach family far away: one photo, a few words about what happened.",
      },
      { property: "og:title", content: "Far-Away Moments | MemReel" },
      { property: "og:description", content: "One photo and a few words about what happened, so the moment reaches them too." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FarAwayMoments,
});

type Step = 1 | 2 | 3 | "done";
type Delivery = "whatsapp" | "email" | "imessage";

const NOTE_PROMPTS = ["Right before this, they…", "They shouted…", "The funny part was…", "Write my own"];
const WHO = ["Pop Pop", "Nani", "Oma", "Grandma"];
const DELIVERY: Array<[Delivery, string]> = [["whatsapp", "WhatsApp"], ["email", "Email"], ["imessage", "iMessage"]];

function useSessionId() {
  const [id, setId] = useState("");
  useEffect(() => {
    let v = sessionStorage.getItem("memreel_moments_sid");
    if (!v) {
      v = crypto.randomUUID();
      sessionStorage.setItem("memreel_moments_sid", v);
    }
    setId(v);
  }, []);
  return id;
}

function FarAwayMoments() {
  const sid = useSessionId();
  const log = useServerFn(logMomentEvent);
  const rewrite = useServerFn(rewriteMoment);
  const submit = useServerFn(submitMoment);

  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [who, setWho] = useState("");
  const [moment, setMoment] = useState("");
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inviteRef = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (sid) log({ data: { sessionId: sid, event: "page_view" } }).catch(() => {});
  }, [sid]);

  const startInvite = () => {
    inviteRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!started.current && sid) {
      started.current = true;
      log({ data: { sessionId: sid, event: "invite_start" } }).catch(() => {});
    }
  };

  const note = prompt && prompt !== "Write my own" ? `${prompt.replace("…", "")} ${answer}`.trim() : answer.trim();
  const whoLabel = who.trim() || "them";

  const onPhoto = (f: File | undefined) => {
    setError("");
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return setError("Please choose a JPG, PNG or WebP photo.");
    if (f.size > 8 * 1024 * 1024) return setError("That photo is over 8 MB. Try a smaller one.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(2);
    if (sid) log({ data: { sessionId: sid, event: "photo_selected" } }).catch(() => {});
  };

  const onRewrite = async () => {
    setError("");
    setBusy(true);
    try {
      const r = await rewrite({ data: { sessionId: sid, note, grandparentName: who.trim() || undefined } });
      if ("error" in r && r.error) setError(r.error);
      else if ("moment" in r && r.moment) {
        setMoment(r.moment);
        setStep(3);
      }
    } catch {
      setError("We couldn't write that up just now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async () => {
    if (!file || !delivery) return;
    setError("");
    setBusy(true);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      const r = await submit({
        data: {
          sessionId: sid,
          note,
          rewritten: moment,
          grandparentName: who.trim() || undefined,
          delivery,
          photoBase64: btoa(bin),
          photoType: file.type as "image/jpeg",
        },
      });
      if ("error" in r && r.error) setError(r.error);
      else setStep("done");
    } catch {
      setError("We couldn't save your moment. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="font-display text-2xl" aria-label="MemReel experiments">
          Mem<span className="font-sans text-base font-semibold">Reel</span>
        </Link>
        <button onClick={startInvite} className="text-sm font-medium text-primary underline underline-offset-4">
          Try it with one photo
        </button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-4 sm:px-8 md:grid-cols-[minmax(0,340px)_1fr] md:gap-16">
        <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-md bg-muted">
          <video
            src={reel.url}
            poster={poster.url}
            autoPlay
            muted
            loop
            playsInline
            className="aspect-[9/16] w-full object-cover"
            aria-label="A boy shows off his cushion tower; far away, his grandfather laughs and claps"
          />
        </div>
        <div>
          <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            He turned round to show someone. Four thousand miles away, Pop Pop was already clapping.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            The photo usually gets there. What happened around it often doesn't: the wobble, the shout, the look on
            his face just before.
          </p>
          <Button onClick={startInvite} size="lg" className="mt-8 h-12 rounded-sm px-6 shadow-none">
            Pick one moment that didn't quite travel <ArrowRight />
          </Button>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <p className="text-xs font-semibold uppercase text-primary">An illustrative example</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl sm:text-4xl">From the note you'd scribble, to the moment Pop Pop gets.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto_1.3fr] md:items-center">
            <figure className="border border-border bg-background p-4">
              <img src={tower.url} alt="A toddler carefully stacking floor cushions" loading="lazy" width={1024} height={1024} className="aspect-square w-full object-cover" />
              <figcaption className="mt-4 text-sm text-muted-foreground">"cushion tower in the hall, 3 high. shouted for someone to come and look"</figcaption>
            </figure>
            <span aria-hidden className="hidden font-display text-4xl text-primary md:block">→</span>
            <blockquote className="font-display text-2xl leading-relaxed sm:text-[1.7rem]">
              Pop Pop, he built a tower of three cushions in the hallway tonight, all on his own. The moment the last one
              stayed up, he spun round and shouted for someone to come and see.
            </blockquote>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">A fictional family, shown as an example. Nothing gets added that you didn't write.</p>
        </div>
      </section>

      <section ref={inviteRef} className="mx-auto max-w-3xl scroll-mt-8 px-5 py-20 sm:px-8">
        <p className="text-xs font-semibold uppercase text-primary">Your turn</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">They already see a lot. Which one didn't make it through?</h2>
        {step !== "done" && (
          <p className="mt-6 text-sm font-medium text-muted-foreground" aria-live="polite">Step {step} of 3</p>
        )}

        <div className="mt-6">
          {step === 1 && (
            <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border bg-card px-6 py-14 text-center transition hover:border-primary">
              <ImagePlus className="size-8 text-primary" />
              <span className="mt-3 font-display text-2xl">Choose one real photo</span>
              <span className="mt-2 text-sm text-muted-foreground">One you've already sent, or one you never did. JPG, PNG or WebP, up to 8 MB.</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose a photo" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
          )}

          {step !== 1 && step !== "done" && preview && (
            <img src={preview} alt="Your chosen photo" className="mb-8 max-h-64 w-auto rounded-sm object-contain" />
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <p className="font-display text-2xl">What happened right before this?</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {NOTE_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={prompt === p}
                      onClick={() => setPrompt(p)}
                      className={`border px-4 py-3 text-left transition ${prompt === p ? "border-primary bg-card text-primary" : "border-border bg-background hover:border-primary"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {prompt && (
                  <input
                    autoFocus
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    maxLength={180}
                    aria-label="Finish the sentence"
                    placeholder={prompt === "Write my own" ? "A few words is plenty" : "finish the sentence…"}
                    className="mt-3 h-12 w-full border border-input bg-card px-4 outline-none focus:border-primary"
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Who's it for? <span className="font-normal text-muted-foreground">(optional)</span></p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WHO.map((w) => (
                    <button
                      key={w}
                      type="button"
                      aria-pressed={who === w}
                      onClick={() => setWho(who === w ? "" : w)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${who === w ? "border-primary text-primary" : "border-border hover:border-primary"}`}
                    >
                      {w}
                    </button>
                  ))}
                  <input
                    value={WHO.includes(who) ? "" : who}
                    onChange={(e) => setWho(e.target.value)}
                    maxLength={40}
                    aria-label="Another name"
                    placeholder="Another name"
                    className="h-10 w-36 rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <Button disabled={busy || note.length < 8} onClick={onRewrite} className="h-11 rounded-sm shadow-none">
                {busy ? "Writing it up…" : `See it the way ${whoLabel} will`}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">Here's how it reads. Only your facts are used; tap the text to change anything.</p>
              <textarea
                aria-label="Your moment"
                value={moment}
                onChange={(e) => setMoment(e.target.value)}
                rows={4}
                className="w-full border border-input bg-card p-5 font-display text-xl leading-relaxed outline-none focus:border-primary"
              />
              <div>
                <p className="font-medium">How does {whoLabel} usually hear from you?</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {DELIVERY.map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={delivery === v}
                      onClick={() => {
                        setDelivery(v);
                        log({ data: { sessionId: sid, event: "delivery_chosen" } }).catch(() => {});
                      }}
                      className={`border px-4 py-3 text-left font-medium transition ${delivery === v ? "border-primary bg-card text-primary" : "border-border hover:border-primary"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This is an early prototype, so nothing gets sent yet. Your photo and words are stored privately so we can learn whether this is worth building.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={!delivery || busy || moment.trim().length < 8}
                  onClick={() => {
                    log({ data: { sessionId: sid, event: "message_approved" } }).catch(() => {});
                    onSubmit();
                  }}
                  className="h-11 rounded-sm shadow-none"
                >
                  {busy ? "Saving…" : "This is right, save it"}
                </Button>
                <Button variant="outline" onClick={() => setStep(2)} className="h-11 rounded-sm shadow-none">Change my note</Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="border border-border bg-card p-8">
              <p className="font-display text-3xl">Saved. Thank you for picking this one.</p>
              <p className="mt-4 text-muted-foreground">
                In the finished version this would arrive on {DELIVERY.find(([v]) => v === delivery)?.[1]} with your photo. For now, you've helped us learn whether the small moments are worth carrying.
              </p>
            </div>
          )}
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <img src={twoHomes.url} alt="A boy in his hallway and his grandfather laughing at breakfast in another home" loading="lazy" width={1376} height={768} className="w-full object-cover" />
      </section>
    </main>
  );
}
