import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronRight, Send } from "lucide-react";
import { useState } from "react";

import { ChoiceButton, Field, FooterAction, Progress, ScreenShell, StoryHeader, StoryToken } from "@/components/story-ui";
import { Button } from "@/components/ui/button";
import { THEMES, deviceType, whatsappShare, type AgeBand, type StoryTheme, type ThemeKey } from "@/lib/story-themes";
import { createStory, submitSetupRequest } from "@/lib/story.functions";

export const Route = createFileRoute("/one-story-together/")({
  head: () => ({
    meta: [
      { title: "One Story, Together | MemReel" },
      { name: "description", content: "Bring a far-away grandparent into story time with a story told in their own voice." },
      { property: "og:title", content: "One Story, Together | MemReel" },
      { property: "og:description", content: "Childhood will not wait for the next visit. Bring Daadi into story time with MemReel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OneStoryTogether,
});

type Stage = "welcome" | "setup" | "setup-done" | "parent" | "parent-preview" | "sent";
const LABELS = ["Daadi", "Nani", "Ba"];

const inputClass =
  "h-14 w-full border border-story-ink/25 bg-story-paper px-4 text-lg text-story-ink outline-none placeholder:text-story-ink/55 focus:border-story-blue";

function OneStoryTogether() {
  const router = useRouter();
  const create = useServerFn(createStory);
  const [stage, setStage] = useState<Stage>("welcome");
  const [name, setName] = useState("Maya");
  const [age, setAge] = useState<AgeBand>("3–4");
  const [themeKey, setThemeKey] = useState<ThemeKey>("dinosaurs");
  const [detail, setDetail] = useState("Makes a big roar");
  const [customDetail, setCustomDetail] = useState("");
  const [label, setLabel] = useState("Daadi");
  const [tokens, setTokens] = useState<{ grandparentToken: string; childToken: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [setupFor, setSetupFor] = useState({ label: "Daadi", child: "" });

  const theme = THEMES[themeKey];
  const safeName = name.trim() || "your child";
  const selectedDetail = customDetail.trim() || detail;

  const moveTo = (next: Stage) => {
    setStage(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const ensureStory = async () => {
    if (tokens) return tokens;
    setBusy(true);
    setError("");
    try {
      const res = await create({
        data: { childName: safeName, ageBand: age, theme: themeKey, detail: selectedDetail, grandparentLabel: label, device: deviceType() },
      });
      if ("error" in res) {
        setError(res.error ?? "Something went wrong.");
        return null;
      }
      setTokens(res);
      return res;
    } catch {
      setError("We could not save the story. Check the internet. Then try again.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const link = (t: string) => `${window.location.origin}/one-story-together/s/${t}`;

  return (
    <main className="min-h-screen bg-story-ink text-story-paper">
      <StoryHeader />
      {(stage === "parent" || stage === "parent-preview") && <Progress step={1} />}

      {stage === "welcome" && (
        <section className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden px-5 py-10 sm:px-8">
          <StoryWorld theme={theme} />
          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between gap-10">
            <div className="max-w-3xl pt-6 sm:pt-14">
              <p className="text-sm font-semibold uppercase text-story-yellow">One Story, Together</p>
              <h1 className="mt-5 font-display text-[3.4rem] leading-[0.96] sm:text-8xl lg:text-9xl">
                Bring Daadi into<br />story time.
              </h1>
              <div className="mt-7 max-w-xl border-l border-story-paper/40 bg-story-ink/90 py-1 pl-5 text-lg text-story-paper sm:text-xl">
                <p className="story-memory-line story-memory-line-one">Your child is three.</p>
                <p className="story-memory-line story-memory-line-two mt-2">You remember Daadi’s Panchatantra stories at bedtime.</p>
                <p className="story-memory-line story-memory-line-three mt-2">Now, an ocean separates them.</p>
                <p className="story-memory-line story-memory-line-four mt-2 font-semibold">Childhood will not wait for the next visit.</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 pb-6 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-14 rounded-sm bg-story-coral px-8 text-base text-story-ink shadow-none hover:bg-story-coral/90"
                onClick={() => moveTo("setup")}
              >
                Set up Daadi’s first story <ChevronRight />
              </Button>
              <button type="button" className="bg-story-ink/90 px-1 text-base font-semibold text-story-paper underline underline-offset-4" onClick={() => moveTo("parent")}>
                Start their story
              </button>
            </div>
          </div>
        </section>
      )}

      {stage === "setup" && (
        <SetupForm
          onDone={(l, c) => {
            setSetupFor({ label: l, child: c });
            moveTo("setup-done");
          }}
        />
      )}

      {stage === "setup-done" && (
        <ScreenShell
          role="Thank you"
          title={`We’ll set up ${setupFor.label}’s first story for ${setupFor.child} this week.`}
          helper="Bhavik will message you on WhatsApp. We’re testing this with a small group of families."
        >
          <StoryToken theme={theme} />
        </ScreenShell>
      )}

      {stage === "parent" && (
        <ScreenShell role="Parent" title="Start with what your child likes." helper="Choose the story. This takes less than one minute.">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-8">
              <Field label="Child’s first name">
                <input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} className={inputClass} aria-label="Child’s first name" />
              </Field>
              <Field label="What does your child call the grandparent?">
                <div className="flex flex-wrap gap-3">
                  {LABELS.map((l) => (
                    <ChoiceButton key={l} compact selected={label === l} onClick={() => setLabel(l)}>{l}</ChoiceButton>
                  ))}
                </div>
              </Field>
              <Field label="Child’s age">
                <div className="grid grid-cols-2 gap-3">
                  {(["3–4", "5–7"] as AgeBand[]).map((item) => (
                    <ChoiceButton key={item} selected={age === item} onClick={() => setAge(item)}>Age {item}</ChoiceButton>
                  ))}
                </div>
              </Field>
              <Field label="Choose one theme">
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                    <ChoiceButton
                      key={key}
                      selected={themeKey === key}
                      onClick={() => {
                        setThemeKey(key);
                        setDetail(THEMES[key].detailChoices[0] ?? "");
                        setCustomDetail("");
                      }}
                      className="min-h-28 flex-col text-left"
                    >
                      <span className="text-3xl" aria-hidden>{key === "dinosaurs" ? "◭" : key === "space" ? "✦" : "●"}</span>
                      {THEMES[key].label}
                    </ChoiceButton>
                  ))}
                </div>
              </Field>
              <Field label="Choose one true detail">
                <div className="flex flex-wrap gap-3">
                  {theme.detailChoices.map((item) => (
                    <ChoiceButton key={item} selected={!customDetail && detail === item} onClick={() => { setDetail(item); setCustomDetail(""); }} compact>
                      {item}
                    </ChoiceButton>
                  ))}
                </div>
                <input
                  value={customDetail}
                  maxLength={80}
                  onChange={(e) => setCustomDetail(e.target.value)}
                  placeholder="Or write one short detail"
                  className={`mt-3 ${inputClass} h-12 text-base`}
                  aria-label="One short detail"
                />
              </Field>
            </div>
            <aside className="self-start border border-story-ink/15 bg-story-ink p-6 text-story-paper lg:sticky lg:top-8">
              <StoryToken theme={theme} small />
              <p className="mt-6 text-xs font-semibold uppercase text-story-paper/75">Story preview</p>
              <h2 className="mt-2 font-display text-3xl">{theme.title}</h2>
              <p className="mt-4 text-sm text-story-paper/80">Made for {safeName}</p>
            </aside>
          </div>
          <FooterAction label="Review the invitation" onClick={() => moveTo("parent-preview")} disabled={!name.trim()} />
        </ScreenShell>
      )}

      {stage === "parent-preview" && (
        <ScreenShell role="Parent" title="The invitation is ready." helper={`Check the story. Then send it to ${label}.`}>
          <div className="border border-story-ink/15 bg-story-paper p-6 sm:p-9">
            <p className="text-xs font-semibold uppercase text-story-coral-deep">For {label}</p>
            <h2 className="mt-3 font-display text-4xl text-story-ink sm:text-5xl">{safeName} has a story for you.</h2>
            <p className="mt-4 max-w-2xl text-story-ink/75">
              {safeName} likes {theme.label.toLowerCase()}. The story is ready. You can record it in your own voice.
            </p>
            <div className="mt-8 flex items-center gap-4 border-t border-story-ink/10 pt-6">
              <StoryToken theme={theme} small />
              <div>
                <p className="font-semibold text-story-ink">{theme.title}</p>
                <p className="text-sm text-story-ink/70">About {age === "3–4" ? "40" : "60"} seconds</p>
              </div>
            </div>
          </div>
          {error && <p className="mt-4 font-semibold text-story-coral-deep">{error}</p>}
          <div className="mt-10 flex flex-col gap-3 border-t border-story-ink/15 pt-6 sm:flex-row sm:items-center">
            <Button
              size="lg"
              disabled={busy}
              className="h-13 rounded-sm bg-story-ink px-7 text-base text-story-paper hover:bg-story-ink/90"
              onClick={async () => {
                const popup = window.open("", "_blank");
                const t = await ensureStory();
                if (!t) {
                  popup?.close();
                  return;
                }
                const url = whatsappShare(`${safeName} has a story for you, ${label}. Open this link and tell it in your voice: ${link(t.grandparentToken)}`);
                if (popup) popup.location.href = url;
                else window.location.href = url;
                moveTo("sent");
              }}
            >
              <Send /> {busy ? "Preparing…" : `Send to ${label} on WhatsApp`}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={busy}
              className="h-13 rounded-sm border-story-ink/40 bg-transparent text-story-ink hover:bg-story-paper"
              onClick={async () => {
                const t = await ensureStory();
                if (t) router.navigate({ to: "/one-story-together/s/$token", params: { token: t.grandparentToken } });
              }}
            >
              Grandparent is here with me
            </Button>
          </div>
        </ScreenShell>
      )}

      {stage === "sent" && tokens && (
        <ScreenShell role="Parent" title={`The story is with ${label}.`} helper={`${label} records it on their phone. Then ${label} sends you ${safeName}’s link on WhatsApp.`}>
          <div className="flex items-center gap-3 bg-story-paper p-5">
            <Check className="size-5 text-story-ink" />
            <p>Keep {safeName}’s link. You can open it when {label} is done.</p>
          </div>
          <FooterAction
            label={`Open ${safeName}’s link`}
            onClick={() => router.navigate({ to: "/one-story-together/s/$token", params: { token: tokens.childToken } })}
          />
        </ScreenShell>
      )}
    </main>
  );
}

function SetupForm({ onDone }: { onDone: (label: string, child: string) => void }) {
  const submit = useServerFn(submitSetupRequest);
  const [f, setF] = useState({
    parentName: "",
    parentWhatsapp: "",
    childName: "",
    childAge: "",
    favouriteThing: "",
    grandparentLabel: "Daadi",
    otherLabel: "",
    grandparentWhatsapp: "",
  });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const label = f.grandparentLabel === "Other" ? f.otherLabel.trim() : f.grandparentLabel;
  const ready =
    f.parentName.trim() && f.parentWhatsapp.trim() && f.childName.trim() && f.childAge.trim() && f.favouriteThing.trim() && label && f.grandparentWhatsapp.trim().startsWith("+") && consent;

  return (
    <ScreenShell role="Set up" title="Set up Daadi’s first story." helper="Tell us about your family. We set it up with you on WhatsApp.">
      <form
        className="grid gap-6 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!ready) return;
          setBusy(true);
          setError("");
          try {
            const res = await submit({
              data: {
                parentName: f.parentName,
                parentWhatsapp: f.parentWhatsapp,
                childName: f.childName,
                childAge: f.childAge,
                favouriteThing: f.favouriteThing,
                grandparentLabel: label,
                grandparentWhatsapp: f.grandparentWhatsapp,
                consented: true,
              },
            });
            if ("error" in res) setError(res.error ?? "Something went wrong.");
            else onDone(label, f.childName.trim());
          } catch {
            setError("Check the WhatsApp numbers. Then try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Your first name"><input className={inputClass} value={f.parentName} onChange={set("parentName")} maxLength={40} autoComplete="given-name" /></Field>
        <Field label="Your WhatsApp number"><input className={inputClass} value={f.parentWhatsapp} onChange={set("parentWhatsapp")} inputMode="tel" placeholder="+1 555 123 4567" autoComplete="tel" /></Field>
        <Field label="Child’s first name"><input className={inputClass} value={f.childName} onChange={set("childName")} maxLength={30} /></Field>
        <Field label="Child’s age"><input className={inputClass} value={f.childAge} onChange={set("childAge")} inputMode="numeric" maxLength={10} placeholder="3" /></Field>
        <div className="sm:col-span-2">
          <Field label="Your child’s favourite thing right now"><input className={inputClass} value={f.favouriteThing} onChange={set("favouriteThing")} maxLength={80} placeholder="Dinosaurs" /></Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="What does your child call the grandparent?">
            <div className="flex flex-wrap gap-3">
              {[...LABELS, "Other"].map((l) => (
                <ChoiceButton key={l} compact selected={f.grandparentLabel === l} onClick={() => setF({ ...f, grandparentLabel: l })}>{l}</ChoiceButton>
              ))}
            </div>
            {f.grandparentLabel === "Other" && <input className={`mt-3 ${inputClass}`} value={f.otherLabel} onChange={set("otherLabel")} maxLength={20} placeholder="Name" aria-label="Other name" />}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Grandparent’s WhatsApp number, with country code">
            <input className={inputClass} value={f.grandparentWhatsapp} onChange={set("grandparentWhatsapp")} inputMode="tel" placeholder="+91 98765 43210" />
          </Field>
        </div>
        <label className="flex items-start gap-3 sm:col-span-2">
          <input type="checkbox" className="mt-1 size-5 accent-[var(--story-ink)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>I’m happy for Memreel to contact us on WhatsApp to set this up.</span>
        </label>
        {error && <p className="font-semibold text-story-coral-deep sm:col-span-2">{error}</p>}
        <div className="border-t border-story-ink/15 pt-6 sm:col-span-2">
          <Button type="submit" size="lg" disabled={!ready || busy} className="h-13 w-full rounded-sm bg-story-ink px-7 text-base text-story-paper hover:bg-story-ink/90 sm:w-auto">
            {busy ? "Sending…" : "Set up the first story"} <ChevronRight />
          </Button>
        </div>
      </form>
    </ScreenShell>
  );
}

function StoryWorld({ theme }: { theme: StoryTheme }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <div className="absolute -bottom-24 -right-32 size-72 rounded-full bg-story-coral sm:-bottom-32 sm:-right-24 sm:size-[26rem]" />
      <div className="absolute bottom-[-18rem] right-[30%] hidden size-[32rem] rotate-12 bg-story-blue lg:block" />
      <div className="absolute bottom-24 right-[6%] hidden story-float lg:block"><StoryToken theme={theme} /></div>
      <div className="absolute right-[6%] top-[6%] font-display text-7xl text-story-yellow">✦</div>
    </div>
  );
}
