import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Pause, Play, Send, Trash2, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  ChoiceButton,
  Field,
  FooterAction,
  Handoff,
  Progress,
  RecorderPanel,
  ScreenShell,
  StoryHeader,
  StoryToken,
} from "@/components/story-ui";
import { Button } from "@/components/ui/button";
import { useRecorder } from "@/hooks/use-recorder";
import {
  ACTION_DONE,
  THEMES,
  blobToBase64,
  deviceType,
  isTheme,
  questionFor,
  storyFor,
  whatsappShare,
} from "@/lib/story-themes";
import { deleteStory, getStory, saveChoice, trackStep, uploadRecording } from "@/lib/story.functions";

export const Route = createFileRoute("/one-story-together/s/$token")({
  head: () => ({
    meta: [
      { title: "A story is waiting | MemReel" },
      { name: "description", content: "A family story from MemReel. Open it to listen and take part." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "A story is waiting | MemReel" },
      { property: "og:description", content: "A family story from MemReel. Open it to listen and take part." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoryLink,
});

type StoryData = Exclude<Awaited<ReturnType<typeof getStory>>, { error: string }>;

function StoryLink() {
  const { token } = Route.useParams();
  const fetchStory = useServerFn(getStory);
  const [story, setStory] = useState<StoryData | null>(null);
  const [missing, setMissing] = useState(false);

  const load = async () => {
    try {
      const res = await fetchStory({ data: { token } });
      if ("error" in res) setMissing(true);
      else setStory(res);
    } catch {
      setMissing(true);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="min-h-screen bg-story-ink text-story-paper">
      <StoryHeader />
      {missing ? (
        <ScreenShell role="MemReel" title="This story is not here." helper="The link may be wrong, or the parent deleted the story.">
          <span />
        </ScreenShell>
      ) : !story ? (
        <div className="flex min-h-[60svh] items-center justify-center text-story-paper/80">Opening the story…</div>
      ) : story.role === "g" ? (
        <GrandparentFlow token={token} story={story} reload={load} />
      ) : story.role === "c" ? (
        <ChildFlow token={token} story={story} reload={load} />
      ) : (
        <ReplyFlow token={token} story={story} reload={load} />
      )}
    </main>
  );
}

function useStoryBits(story: StoryData) {
  const theme = THEMES[isTheme(story.theme) ? story.theme : "dinosaurs"];
  const label = story.grandparentLabel;
  const name = story.childName;
  return { theme, label, name };
}

function useUpload(token: string) {
  const upload = useServerFn(uploadRecording);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async (kind: "story" | "question" | "own_line" | "roar" | "reply", blob: Blob, seconds: number) => {
    setSaving(true);
    setError("");
    try {
      const res = await upload({ data: { token, kind, audioBase64: await blobToBase64(blob), mime: blob.type || "audio/webm", seconds } });
      if ("error" in res) {
        setError(res.error ?? "Something went wrong.");
        return false;
      }
      return true;
    } catch {
      setError("We could not save the recording. Check the internet. Then try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };
  return { save, saving, error };
}

function useTrack(token: string) {
  const track = useServerFn(trackStep);
  return (step: Parameters<typeof trackStep>[0]["data"]["step"]) => {
    void track({ data: { token, step, device: deviceType() } }).catch(() => undefined);
  };
}

function linkFor(token: string) {
  return `${window.location.origin}/one-story-together/s/${token}`;
}

/* ---------------- Grandparent ---------------- */

function GrandparentFlow({ token, story }: { token: string; story: StoryData; reload: () => Promise<void> }) {
  const { theme, label, name } = useStoryBits(story);
  const router = useRouter();
  const track = useTrack(token);
  const { save, saving, error } = useUpload(token);
  const [stage, setStage] = useState<"invite" | "story" | "question" | "own" | "send">("invite");
  const storyRec = useRecorder(300);
  const questionRec = useRecorder(30);
  const ownRec = useRecorder(30);
  const [starter, setStarter] = useState("");
  const text = storyFor(theme, name, story.ageBand, story.detail);
  const question = questionFor(theme);

  useEffect(() => track("grandparent_opened"), []); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (s: typeof stage) => {
    setStage(s);
    window.scrollTo({ top: 0 });
  };

  const childLink = story.links.child ? linkFor(story.links.child) : "";
  const shareText = `${label} recorded a story for ${name}. Open it with ${name}: ${childLink}`;

  return (
    <>
      {stage !== "invite" && <Progress step={2} />}
      {stage === "invite" && (
        <ScreenShell role={`For ${label}`} title={`${name} has a story for you.`} helper="The words are ready. You only add your voice.">
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <StoryToken theme={theme} />
            <div className="bg-story-yellow p-6 text-story-ink sm:p-8">
              <p className="text-sm font-semibold">{theme.title}</p>
              <p className="mt-3 text-lg">Will you tell this story to {name}?</p>
              <p className="mt-3 text-sm text-story-ink/80">No account. No password.</p>
            </div>
          </div>
          <FooterAction label="Yes. Show me the story" onClick={() => go("story")} />
        </ScreenShell>
      )}

      {stage === "story" && (
        <ScreenShell role={`Step 1 of 3 · ${label}`} title="Read the story in your voice." helper={`Tap Allow so ${name} can hear your voice. Tap the red button. Read the words. Tap again to stop.`}>
          <RecordLayout text={text} rec={storyRec} idle="Tap to record" />
          {error && <p className="mt-4 font-semibold text-story-coral-deep">{error}</p>}
          <FooterAction
            label={saving ? "Saving…" : "Next: ask the question"}
            disabled={!storyRec.blob || saving}
            onClick={async () => {
              if (storyRec.blob && (await save("story", storyRec.blob, storyRec.seconds))) go("question");
            }}
          />
        </ScreenShell>
      )}

      {stage === "question" && (
        <ScreenShell role={`Step 2 of 3 · ${label}`} title={`Ask ${name} one question.`} helper={`${name} will hear this when it is time to choose. Read one line.`}>
          <RecordLayout text={question} rec={questionRec} idle="Tap to record" maxSeconds={30} large />
          {error && <p className="mt-4 font-semibold text-story-coral-deep">{error}</p>}
          <FooterAction
            label={saving ? "Saving…" : "Next"}
            disabled={!questionRec.blob || saving}
            onClick={async () => {
              if (questionRec.blob && (await save("question", questionRec.blob, questionRec.seconds))) go("own");
            }}
          />
        </ScreenShell>
      )}

      {stage === "own" && (
        <ScreenShell role={`Step 3 of 3 · ${label}`} title="Add one line of your own." helper={`This is optional. Tell ${name} one true thing from your life. It plays at the end of the story.`}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <p className="mb-3 text-sm font-semibold">You can start like this:</p>
              <div className="flex flex-col gap-3">
                {["When your Papa was small…", "Do you know what I loved at your age…"].map((s) => (
                  <ChoiceButton key={s} selected={starter === s} onClick={() => setStarter(s)} className="justify-start text-left font-display text-xl">
                    {s}
                  </ChoiceButton>
                ))}
              </div>
            </div>
            <div className="flex min-h-64 flex-col items-center justify-center bg-story-blue p-6 text-story-paper">
              <RecorderPanel rec={ownRec} idleLabel="Tap to record (30 seconds)" maxSeconds={30} />
            </div>
          </div>
          {error && <p className="mt-4 font-semibold text-story-coral-deep">{error}</p>}
          <FooterAction
            label={saving ? "Saving…" : ownRec.blob ? "Add my line" : "Skip this"}
            disabled={saving || ownRec.state === "recording"}
            onClick={async () => {
              if (ownRec.blob) {
                if (!(await save("own_line", ownRec.blob, ownRec.seconds))) return;
              }
              go("send");
            }}
          />
        </ScreenShell>
      )}

      {stage === "send" && (
        <section className="relative flex min-h-[calc(100svh-8rem)] items-center overflow-hidden bg-story-blue px-5 py-12 text-story-paper sm:px-8">
          <div className="story-handoff-orbit absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-story-paper/15" />
          <div className="relative z-10 mx-auto w-full max-w-5xl">
            <p className="text-sm font-semibold uppercase text-story-lime">Your story is saved</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-none sm:text-7xl">Give the story to {name}.</h1>
            <p className="mt-6 max-w-lg text-lg text-story-paper/85">Send the link back on WhatsApp. {name}’s parent will open it with {name}.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 rounded-sm bg-story-coral px-8 text-story-ink hover:bg-story-coral/90">
                <a href={whatsappShare(shareText)} target="_blank" rel="noreferrer">
                  <Send /> Give the story to {name}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-sm border-story-paper/50 bg-transparent text-story-paper hover:bg-story-paper/10 hover:text-story-paper"
                onClick={() => story.links.child && router.navigate({ to: "/one-story-together/s/$token", params: { token: story.links.child } })}
              >
                {name} is here with me
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function RecordLayout({ text, rec, idle, maxSeconds, large = false }: { text: string; rec: ReturnType<typeof useRecorder>; idle: string; maxSeconds?: number; large?: boolean }) {
  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="border border-story-ink/15 bg-story-paper p-6 text-story-ink sm:p-9">
        <p className={`whitespace-pre-line font-display leading-relaxed ${large ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>{text}</p>
      </div>
      <div className="flex min-h-64 flex-col items-center justify-center bg-story-blue p-6 text-story-paper">
        <RecorderPanel rec={rec} idleLabel={idle} maxSeconds={maxSeconds} />
      </div>
    </div>
  );
}

/* ---------------- Child + parent ---------------- */

function ChildFlow({ token, story, reload }: { token: string; story: StoryData; reload: () => Promise<void> }) {
  const { theme, label, name } = useStoryBits(story);
  const track = useTrack(token);
  const save = useServerFn(saveChoice);
  const remove = useServerFn(deleteStory);
  const { save: upload, saving, error } = useUpload(token);
  const roar = useRecorder(30);
  const startStage = story.returnSent ? "complete" : story.recordings.story ? "handoff" : "waiting";
  const [stage, setStage] = useState<"waiting" | "handoff" | "listen" | "choice" | "action" | "roar" | "complete" | "deleted">(startStage);
  const [choice, setChoice] = useState(story.choice ?? "");
  const [response, setResponse] = useState("");
  const [shared, setShared] = useState(story.returnSent);

  const go = (s: typeof stage) => {
    setStage(s);
    window.scrollTo({ top: 0 });
  };

  // Poll for the grandparent's reply while waiting on the completion screen.
  useEffect(() => {
    if (stage !== "complete" || story.recordings.reply) return;
    const id = window.setInterval(() => void reload(), 15000);
    return () => window.clearInterval(id);
  }, [stage, story.recordings.reply, reload]);

  const pathIndex = Math.max(0, theme.paths.indexOf(choice as never));
  const themeKey = isTheme(story.theme) ? story.theme : "dinosaurs";
  const replyLink = story.links.reply ? linkFor(story.links.reply) : "";
  const message = `${name} chose ${choice} and ${ACTION_DONE[themeKey]}. ${theme.pathNext[pathIndex]} ${replyLink}`;

  if (stage === "deleted") {
    return (
      <ScreenShell role="MemReel" title="The story is deleted." helper="The story and all its recordings are gone.">
        <span />
      </ScreenShell>
    );
  }

  return (
    <>
      {stage !== "handoff" && stage !== "complete" && stage !== "waiting" && <Progress step={3} />}
      {stage === "waiting" && (
        <ScreenShell role="Parent" title={`${label} has not recorded yet.`} helper={`Open this link again after ${label} sends the story back.`}>
          <Button className="rounded-sm" onClick={() => void reload()}>Check again</Button>
        </ScreenShell>
      )}
      {stage === "handoff" && (
        <Handoff
          theme={theme}
          eyebrow={`From ${label}`}
          title={`${label} recorded a story for ${name}.`}
          body={`Sit with ${name}. Help ${name} press the buttons.`}
          action="We are ready"
          onContinue={() => go("listen")}
        />
      )}
      {stage === "listen" && story.recordings.story && (
        <ScreenShell role={`For ${name}`} title="A story is waiting for you." helper={`Press play. Listen to ${label}’s voice.`}>
          <StoryPlayer
            urls={[story.recordings.story, story.recordings.own_line].filter(Boolean) as string[]}
            theme={theme}
            onPlay={() => track("child_played")}
          />
          <FooterAction label="Make a choice" onClick={() => go("choice")} />
        </ScreenShell>
      )}
      {stage === "choice" && (
        <ScreenShell role={`For ${name}`} title="Where should the story go?" helper={`Listen to ${label}. Then tap one picture.`}>
          {story.recordings.question && <QuestionPlayer url={story.recordings.question} label={label} />}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {theme.paths.map((path, index) => (
              <button
                key={path}
                type="button"
                aria-pressed={choice === path}
                aria-label={path}
                className={`flex min-h-56 flex-col items-center justify-center rounded-sm border-4 p-5 text-story-ink transition-transform active:scale-95 sm:min-h-72 ${choice === path ? "border-story-ink bg-story-lime" : "border-story-ink/15 bg-story-paper hover:bg-story-yellow"}`}
                onClick={() => {
                  setChoice(path);
                  track("child_chose");
                  void save({ data: { token, choice: path } });
                  window.setTimeout(() => go("action"), 450);
                }}
              >
                <PathPicture index={index} theme={theme} />
                <span className="mt-4 text-center text-sm text-story-ink/75">{path}</span>
              </button>
            ))}
          </div>
        </ScreenShell>
      )}
      {stage === "action" && (
        <ScreenShell role={`For ${name}`} title={theme.ending} helper={theme.action}>
          <div className="story-celebration relative flex min-h-64 items-center justify-center overflow-hidden bg-story-yellow text-story-ink">
            <StoryToken theme={theme} />
            <span className="absolute left-[12%] top-[18%] font-display text-5xl">✦</span>
            <span className="absolute bottom-[16%] right-[14%] font-display text-6xl">●</span>
          </div>
          <Field label={`Parent: What did ${name} do?`}>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Did the action", "Laughed and tried again", "Made a new version"].map((item) => (
                <ChoiceButton key={item} selected={response === item} onClick={() => setResponse(item)}>{item}</ChoiceButton>
              ))}
            </div>
          </Field>
          <FooterAction
            label={`Send ${name}’s voice to ${label}`}
            disabled={!response}
            onClick={() => {
              void save({ data: { token, response } });
              go("roar");
            }}
          />
        </ScreenShell>
      )}
      {stage === "roar" && (
        <ScreenShell role="Parent and child" title={`Send ${name}’s ${themeKey === "dinosaurs" ? "roar" : "voice"} to ${label}.`} helper={`Hold the button for ${name}. ${name} does it again. Let go to stop. 30 seconds at most.`}>
          <div className="flex min-h-72 flex-col items-center justify-center bg-story-coral p-8 text-story-ink">
            <RecorderPanel rec={roar} idleLabel="Hold to record" hold maxSeconds={30} saving={saving} />
          </div>
          <div className="mt-6 border border-story-ink/15 bg-story-paper p-5">
            <p className="text-xs font-semibold uppercase text-story-coral-deep">Message to {label}</p>
            <p className="mt-2 text-lg">{message.replace(replyLink, "").trim()}</p>
          </div>
          {error && <p className="mt-4 font-semibold text-story-coral-deep">{error}</p>}
          <div className="mt-10 flex flex-col gap-3 border-t border-story-ink/15 pt-6 sm:flex-row">
            <Button
              size="lg"
              className="h-13 rounded-sm bg-story-ink px-7 text-base text-story-paper hover:bg-story-ink/90"
              disabled={!roar.blob || saving}
              onClick={async () => {
                if (!roar.blob) return;
                if (!(await upload("roar", roar.blob, roar.seconds))) return;
                window.open(whatsappShare(message), "_blank", "noopener");
                track("return_sent");
                setShared(true);
                go("complete");
              }}
            >
              <Send /> Send to {label} on WhatsApp
            </Button>
          </div>
        </ScreenShell>
      )}
      {stage === "complete" && (
        <section className="min-h-[calc(100svh-4rem)] bg-story-lime px-5 py-12 text-story-ink sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-semibold uppercase">One Story, Together</p>
            <h1 className="mt-4 max-w-3xl font-display text-6xl leading-none sm:text-8xl">Three people finished one story.</h1>
            <div className="mt-8 inline-flex items-center gap-3 bg-story-ink px-5 py-3 text-story-paper">
              <span className={`size-2.5 rounded-full ${story.recordings.reply ? "bg-story-lime" : "bg-story-yellow story-recording-pulse"}`} />
              <p className="font-semibold">
                {story.recordings.reply
                  ? `${label}’s next chapter is here.`
                  : story.replyHeard
                    ? `${label} has heard ${name}’s ${themeKey === "dinosaurs" ? "roar" : "voice"}. Waiting for ${label}’s next chapter.`
                    : shared
                      ? `Sent to ${label}. Waiting for ${label}’s next chapter.`
                      : `Waiting for ${label}’s next chapter.`}
              </p>
            </div>
            {story.recordings.reply && (
              <div className="mt-6 max-w-xl bg-story-paper p-6">
                <p className="font-semibold">{label}: what happens next</p>
                <audio src={story.recordings.reply} controls className="mt-4 w-full" onPlay={() => track("child_played")} />
              </div>
            )}
            <div className="mt-12 grid gap-px bg-story-ink/20 sm:grid-cols-3">
              {[
                ["1", "Parent", `Started with ${theme.label.toLowerCase()}.`],
                ["2", label, "Told it in a real voice."],
                ["3", name, choice ? `Chose ${choice}.` : "Listened and took part."],
              ].map(([n, l, t]) => (
                <div key={n} className="bg-story-paper p-7">
                  <span className="font-display text-4xl text-story-coral-deep">{n}</span>
                  <h2 className="mt-5 text-lg font-semibold">{l}</h2>
                  <p className="mt-2 text-sm text-story-ink/75">{t}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Button
                variant="outline"
                className="rounded-sm border-story-ink/40 bg-transparent hover:bg-story-paper/50"
                onClick={async () => {
                  if (!window.confirm("Delete this story and all its recordings?")) return;
                  await remove({ data: { token } });
                  go("deleted");
                }}
              >
                <Trash2 /> Delete this story
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function StoryPlayer({ urls, theme, onPlay }: { urls: string[]; theme: StoryData extends never ? never : (typeof THEMES)[keyof typeof THEMES]; onPlay: () => void }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative flex min-h-[22rem] flex-col items-center justify-center overflow-hidden bg-story-coral p-8 text-story-ink">
      <StoryToken theme={theme} />
      <Button
        aria-label={playing ? "Pause the story" : "Play the story"}
        className="mt-8 size-20 rounded-full bg-story-ink p-0 text-story-paper hover:bg-story-ink/90"
        onClick={async () => {
          const a = ref.current;
          if (!a) return;
          if (a.paused) {
            await a.play();
            setPlaying(true);
            onPlay();
          } else {
            a.pause();
            setPlaying(false);
          }
        }}
      >
        {playing ? <Pause className="size-7" /> : <Play className="size-7 fill-current" />}
      </Button>
      <p className="mt-4 font-semibold">{playing ? (index > 0 ? "One more thing…" : "The story is playing") : "Play the story"}</p>
      <audio
        ref={ref}
        src={urls[index]}
        onEnded={() => {
          if (index < urls.length - 1) {
            setIndex(index + 1);
            window.setTimeout(() => void ref.current?.play(), 50);
          } else {
            setPlaying(false);
            setIndex(0);
          }
        }}
      />
    </div>
  );
}

function QuestionPlayer({ url, label }: { url: string; label: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    ref.current?.play().catch(() => setBlocked(true));
  }, []);
  return (
    <div className="flex items-center gap-4">
      <Button
        size="lg"
        className="h-14 rounded-sm bg-story-blue px-6 text-story-paper hover:bg-story-blue/90"
        onClick={() => {
          if (!ref.current) return;
          ref.current.currentTime = 0;
          void ref.current.play();
          setBlocked(false);
        }}
      >
        <Volume2 /> {blocked ? `Hear ${label} ask` : `Hear ${label} ask again`}
      </Button>
      <audio ref={ref} src={url} />
    </div>
  );
}

function PathPicture({ index, theme }: { index: number; theme: (typeof THEMES)[keyof typeof THEMES] }) {
  const noisy = index === 0;
  return (
    <svg viewBox="0 0 160 120" className="h-32 w-full max-w-48 sm:h-40" aria-hidden>
      <rect x="0" y="0" width="160" height="120" rx="6" fill={noisy ? "var(--story-blue-soft)" : "var(--story-ink)"} />
      {noisy ? (
        <>
          <path d="M60 0 h40 v90 h-40z" fill="var(--story-blue)" />
          {[70, 80, 90].map((x) => (
            <path key={x} d={`M${x} 10 v70`} stroke="var(--story-paper)" strokeWidth="3" strokeDasharray="8 6" />
          ))}
          <ellipse cx="80" cy="98" rx="60" ry="14" fill="var(--story-blue)" />
          <circle cx="40" cy="96" r="5" fill="var(--story-paper)" />
          <circle cx="122" cy="92" r="4" fill="var(--story-paper)" />
        </>
      ) : (
        <>
          <path d="M20 120 Q20 30 80 26 Q140 30 140 120z" fill="var(--story-lime-soft)" />
          <path d="M48 120 Q50 62 80 60 Q110 62 112 120z" fill="var(--story-ink)" />
          <circle cx="130" cy="20" r="8" fill="var(--story-yellow)" />
        </>
      )}
      <circle cx={noisy ? 30 : 80} cy={noisy ? 40 : 100} r="10" fill={theme.color} stroke="var(--story-ink)" strokeWidth="3" />
    </svg>
  );
}

/* ---------------- Grandparent reply ---------------- */

function ReplyFlow({ token, story }: { token: string; story: StoryData; reload: () => Promise<void> }) {
  const { theme, label, name } = useStoryBits(story);
  const track = useTrack(token);
  const { save, saving, error } = useUpload(token);
  const rec = useRecorder(300);
  const [done, setDone] = useState(false);
  const themeKey = isTheme(story.theme) ? story.theme : "dinosaurs";
  const idx = Math.max(0, theme.paths.indexOf((story.choice ?? "") as never));

  useEffect(() => track("reply_opened"), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (done) {
    return (
      <ScreenShell role={`For ${label}`} title={`${name} will hear what happens next.`} helper={`Your reply is saved. ${name}’s parent can play it now.`}>
        <StoryToken theme={theme} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell role={`For ${label}`} title={`${name} sent you something.`} helper={`${name} chose ${story.choice ?? "a path"} and ${ACTION_DONE[themeKey]}. Press play.`}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-story-yellow p-6 text-story-ink">
          <p className="text-sm font-semibold">{name}’s choice</p>
          <PathPicture index={idx} theme={theme} />
          <p className="mt-3 font-display text-2xl">{story.choice ?? "—"}</p>
          {story.recordings.roar && <audio src={story.recordings.roar} controls className="mt-5 w-full" />}
        </div>
        <div className="flex min-h-72 flex-col items-center justify-center bg-story-blue p-6 text-story-paper">
          <p className="mb-6 text-center font-display text-2xl">{theme.pathNext[idx]}</p>
          <RecorderPanel rec={rec} idleLabel={`Tell ${name} what happens next`} saving={saving} />
        </div>
      </div>
      {error && <p className="mt-4 font-semibold text-story-coral-deep">{error}</p>}
      <FooterAction
        label={saving ? "Saving…" : `Send to ${name}`}
        disabled={!rec.blob || saving}
        onClick={async () => {
          if (rec.blob && (await save("reply", rec.blob, rec.seconds))) setDone(true);
        }}
      />
    </ScreenShell>
  );
}
