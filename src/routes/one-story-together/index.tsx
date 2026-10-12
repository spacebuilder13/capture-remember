import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Download,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/one-story-together/")({
  head: () => ({
    meta: [
      { title: "One Story, Together | MemReel" },
      {
        name: "description",
        content: "Bring a far-away grandparent into story time with a story told in their own voice.",
      },
      { property: "og:title", content: "One Story, Together | MemReel" },
      {
        property: "og:description",
        content: "Childhood will not wait for the next visit. Bring Daadi into story time with MemReel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OneStoryTogether,
});

type ThemeKey = "dinosaurs" | "space" | "animals";
type AgeBand = "3–4" | "5–7";
type Stage =
  | "welcome"
  | "parent"
  | "parent-preview"
  | "handoff-grandparent"
  | "grandparent-invite"
  | "grandparent-record"
  | "handoff-child"
  | "child-listen"
  | "child-choice"
  | "child-action"
  | "complete";
type RecorderState = "idle" | "requesting" | "recording" | "ready" | "denied" | "unsupported";
type LogEvent = { event: string; time: string; theme: ThemeKey };

type StoryTheme = {
  label: string;
  color: string;
  softColor: string;
  character: string;
  object: string;
  title: string;
  detailChoices: string[];
  paths: [string, string];
  pathIcons: [string, string];
  action: string;
  ending: string;
};

const THEMES: Record<ThemeKey, StoryTheme> = {
  dinosaurs: {
    label: "Dinosaurs",
    color: "var(--story-lime)",
    softColor: "var(--story-lime-soft)",
    character: "Dodo",
    object: "egg",
    title: "The dinosaur who lost his roar",
    detailChoices: ["Makes a big roar", "Stomps at breakfast", "Knows dinosaur names"],
    paths: ["the noisy waterfall", "the quiet cave"],
    pathIcons: ["≈", "◒"],
    action: "Give Dodo your biggest dinosaur roar.",
    ending: "Dodo heard you. Dodo found his roar.",
  },
  space: {
    label: "Space",
    color: "var(--story-blue)",
    softColor: "var(--story-blue-soft)",
    character: "Pip",
    object: "rocket",
    title: "The moon that needed a friend",
    detailChoices: ["Counts down to launch", "Looks for the moon", "Builds box rockets"],
    paths: ["the bright moon", "the purple planet"],
    pathIcons: ["●", "✦"],
    action: "Count down from five. Then launch your rocket.",
    ending: "Pip heard you. The rocket flew into the stars.",
  },
  animals: {
    label: "Animals",
    color: "var(--story-coral)",
    softColor: "var(--story-coral-soft)",
    character: "Bobo",
    object: "hat",
    title: "The bear who lost his hat",
    detailChoices: ["Walks like a bear", "Sleeps with a teddy", "Looks for animal tracks"],
    paths: ["the flower garden", "the secret forest"],
    pathIcons: ["✿", "♣"],
    action: "Show Bobo your best bear walk.",
    ending: "Bobo saw you. Bobo found the missing hat.",
  },
};

const STAGE_STEP: Record<Stage, number> = {
  welcome: 0,
  parent: 1,
  "parent-preview": 1,
  "handoff-grandparent": 1,
  "grandparent-invite": 2,
  "grandparent-record": 2,
  "handoff-child": 2,
  "child-listen": 3,
  "child-choice": 3,
  "child-action": 3,
  complete: 3,
};

function OneStoryTogether() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [name, setName] = useState("Maya");
  const [age, setAge] = useState<AgeBand>("3–4");
  const [themeKey, setThemeKey] = useState<ThemeKey>("dinosaurs");
  const [detail, setDetail] = useState("Makes a big roar");
  const [customDetail, setCustomDetail] = useState("");
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [choice, setChoice] = useState("");
  const [response, setResponse] = useState("");
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const theme = THEMES[themeKey];
  const safeName = name.trim() || "your child";
  const selectedDetail = customDetail.trim() || detail;
  const story = storyFor(theme, safeName, age, selectedDetail);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const log = (event: string) => {
    setEvents((current) => [...current, { event, time: new Date().toISOString(), theme: themeKey }]);
  };

  const moveTo = (next: Stage, event?: string) => {
    if (event) log(event);
    setStage(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecorderState("unsupported");
      log("microphone_unsupported");
      return;
    }
    try {
      setRecorderState("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setRecorderState("ready");
        log("grandparent_recording_completed");
      };
      recorder.start();
      setRecorderState("recording");
      log("grandparent_recording_started");
    } catch {
      setRecorderState("denied");
      log("microphone_permission_denied");
    }
  };

  const stopRecording = () => recorderRef.current?.stop();

  const clearRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecorderState("idle");
    setIsPlaying(false);
    log("grandparent_recording_retried");
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      log("child_played_recording");
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const downloadLog = () => {
    const payload = {
      experience: "One Story, Together",
      exported_at: new Date().toISOString(),
      setup: { age, theme: themeKey, personal_detail_used: Boolean(selectedDetail) },
      completion: {
        parent_prepared: events.some((item) => item.event === "parent_prepared_story"),
        grandparent_recorded: events.some((item) => item.event === "grandparent_recording_completed"),
        child_listened: events.some((item) => item.event === "child_played_recording"),
        child_chose: events.some((item) => item.event === "child_made_story_choice"),
        family_completed: stage === "complete",
      },
      events,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "one-story-together-activity.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const reset = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setStage("welcome");
    setName("Maya");
    setAge("3–4");
    setThemeKey("dinosaurs");
    setDetail("Makes a big roar");
    setCustomDetail("");
    setRecorderState("idle");
    setAudioUrl(null);
    setChoice("");
    setResponse("");
    setEvents([]);
    setIsPlaying(false);
  };

  return (
    <main className="min-h-screen bg-story-ink text-story-paper">
      <header className="relative z-20 border-b border-story-paper/15">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-story-paper/80">
            <ArrowLeft className="size-4" /> Experiments
          </Link>
          <span className="font-display text-2xl">MemReel</span>
          <span className="text-xs text-story-paper/60">04</span>
        </div>
      </header>

      {stage !== "welcome" && !stage.startsWith("handoff") && (
        <Progress step={STAGE_STEP[stage]} />
      )}

      {stage === "welcome" && (
        <section className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden px-5 py-10 sm:px-8">
          <StoryWorld theme={theme} mode="welcome" />
          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between">
            <div className="max-w-3xl pt-8 sm:pt-16">
              <p className="text-sm font-semibold uppercase text-story-yellow">One Story, Together</p>
              <h1 className="mt-5 font-display text-6xl leading-[0.96] sm:text-8xl lg:text-9xl">
                Bring Daadi into<br />story time.
              </h1>
              <div className="mt-7 max-w-xl border-l border-story-paper/25 pl-5 text-lg text-story-paper/78 sm:text-xl">
                <p className="story-memory-line story-memory-line-one">Your child is three.</p>
                <p className="story-memory-line story-memory-line-two mt-2">You remember Daadi’s Panchatantra stories at bedtime.</p>
                <p className="story-memory-line story-memory-line-three mt-2">Now, an ocean separates them.</p>
                <p className="story-memory-line story-memory-line-four mt-2 font-semibold text-story-paper">Childhood will not wait for the next visit.</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 pb-6 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-14 rounded-sm bg-story-coral px-8 text-base text-story-ink shadow-none hover:bg-story-coral/90"
                onClick={() => moveTo("parent", "story_started")}
              >
                Start their story <ChevronRight />
              </Button>
              <p className="max-w-xs text-sm text-story-paper/60">Daadi tells it. Your child helps finish it.</p>
            </div>
          </div>
        </section>
      )}

      {stage === "parent" && (
        <ScreenShell role="Parent" title="Start with what your child likes." helper="Choose the story. This takes less than one minute.">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-8">
              <Field label="Child’s first name">
                <input
                  value={name}
                  maxLength={30}
                  onChange={(event) => setName(event.target.value)}
                  className="h-14 w-full border border-story-ink/20 bg-story-paper px-4 text-lg text-story-ink outline-none focus:border-story-blue"
                  aria-label="Child’s first name"
                />
              </Field>
              <Field label="Child’s age">
                <div className="grid grid-cols-2 gap-3">
                  {(["3–4", "5–7"] as AgeBand[]).map((item) => (
                    <ChoiceButton key={item} selected={age === item} onClick={() => setAge(item)}>
                      Age {item}
                    </ChoiceButton>
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
                  onChange={(event) => setCustomDetail(event.target.value)}
                  placeholder="Or write one short detail"
                  className="mt-3 h-12 w-full border border-story-ink/20 bg-story-paper px-4 text-story-ink outline-none placeholder:text-story-ink/45 focus:border-story-blue"
                  aria-label="One short detail"
                />
              </Field>
            </div>
            <MiniStory theme={theme} name={safeName} />
          </div>
          <FooterAction label="Review the invitation" onClick={() => moveTo("parent-preview", "parent_choices_completed")} disabled={!name.trim()} />
        </ScreenShell>
      )}

      {stage === "parent-preview" && (
        <ScreenShell role="Parent" title="The invitation is ready." helper="Check the story. Then pass the device to the grandparent.">
          <div className="border border-story-ink/15 bg-story-paper p-6 sm:p-9">
            <p className="text-xs font-semibold uppercase text-story-coral">For the grandparent</p>
            <h2 className="mt-3 font-display text-4xl text-story-ink sm:text-5xl">{safeName} has a story for you.</h2>
            <p className="mt-4 max-w-2xl text-story-ink/65">
              {safeName} likes {theme.label.toLowerCase()}. The story is ready. You can record it in your own voice.
            </p>
            <div className="mt-8 flex items-center gap-4 border-t border-story-ink/10 pt-6">
              <StoryToken theme={theme} small />
              <div>
                <p className="font-semibold text-story-ink">{theme.title}</p>
                <p className="text-sm text-story-ink/60">About {age === "3–4" ? "40" : "60"} seconds</p>
              </div>
            </div>
          </div>
          <FooterAction label="Pass to the grandparent" onClick={() => moveTo("handoff-grandparent", "parent_prepared_story")} />
        </ScreenShell>
      )}

      {stage === "handoff-grandparent" && (
        <Handoff
          theme={theme}
          eyebrow="Part 2 of 3"
          title="Please pass the device to the grandparent."
          body="The next screen has a story to record."
          action="I have the device"
          onContinue={() => moveTo("grandparent-invite", "grandparent_received_device")}
        />
      )}

      {stage === "grandparent-invite" && (
        <ScreenShell role="Grandparent" title={`${safeName} has a story for you.`} helper="The story is ready. You only need to add your voice.">
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <StoryToken theme={theme} />
            <div className="bg-story-yellow p-6 text-story-ink sm:p-8">
              <p className="text-sm font-semibold">{theme.title}</p>
              <p className="mt-3 text-lg">Will you tell this story to {safeName}?</p>
            </div>
          </div>
          <FooterAction label="Yes. Show me the story" onClick={() => moveTo("grandparent-record", "grandparent_accepted_invitation")} />
        </ScreenShell>
      )}

      {stage === "grandparent-record" && (
        <ScreenShell role="Grandparent" title="Read the story in your voice." helper="Press record. Read the text. Press stop when you finish.">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="border border-story-ink/15 bg-story-paper p-6 text-story-ink sm:p-9">
              <p className="whitespace-pre-line font-display text-2xl leading-relaxed sm:text-3xl">{story}</p>
            </div>
            <div className="flex min-h-64 flex-col items-center justify-center bg-story-blue p-6 text-center text-story-paper">
              {recorderState === "recording" ? (
                <>
                  <div className="story-recording-pulse mb-6 flex size-24 items-center justify-center rounded-full bg-story-coral text-story-ink">
                    <span className="font-display text-3xl">REC</span>
                  </div>
                  <p className="font-semibold">Recording now</p>
                  <Button className="mt-5 h-12 rounded-sm bg-story-paper text-story-ink hover:bg-story-paper/90" onClick={stopRecording}>
                    <Square /> Stop
                  </Button>
                </>
              ) : recorderState === "ready" && audioUrl ? (
                <>
                  <Check className="size-10 text-story-lime" />
                  <p className="mt-3 font-semibold">Your recording is ready.</p>
                  <audio src={audioUrl} controls className="mt-5 w-full" />
                  <Button variant="outline" className="mt-4 rounded-sm border-story-paper/35 bg-transparent text-story-paper hover:bg-story-paper/10 hover:text-story-paper" onClick={clearRecording}>
                    <RotateCcw /> Record again
                  </Button>
                </>
              ) : recorderState === "denied" ? (
                <>
                  <Mic className="size-10" />
                  <p className="mt-3 font-semibold">The microphone is blocked.</p>
                  <p className="mt-2 text-sm text-story-paper/70">Allow microphone access. Then try again.</p>
                  <Button className="mt-5 rounded-sm bg-story-paper text-story-ink hover:bg-story-paper/90" onClick={startRecording}>Try again</Button>
                </>
              ) : recorderState === "unsupported" ? (
                <>
                  <Mic className="size-10" />
                  <p className="mt-3 font-semibold">This browser cannot record audio.</p>
                  <p className="mt-2 text-sm text-story-paper/70">Open this page in a current browser.</p>
                </>
              ) : (
                <>
                  <Button
                    aria-label="Start recording"
                    className="size-24 rounded-full bg-story-coral p-0 text-story-ink hover:bg-story-coral/90"
                    onClick={startRecording}
                    disabled={recorderState === "requesting"}
                  >
                    <Mic className="size-9" />
                  </Button>
                  <p className="mt-5 font-semibold">{recorderState === "requesting" ? "Opening the microphone…" : "Press to record"}</p>
                </>
              )}
            </div>
          </div>
          <FooterAction label={`Give the story to ${safeName}`} onClick={() => moveTo("handoff-child", "grandparent_finished_story")} disabled={!audioUrl} />
        </ScreenShell>
      )}

      {stage === "handoff-child" && (
        <Handoff
          theme={theme}
          eyebrow="Part 3 of 3"
          title={`Please pass the device to ${safeName} and a parent.`}
          body="The child will listen, choose, and play. An adult can help."
          action="We are ready"
          onContinue={() => moveTo("child-listen", "child_received_device")}
        />
      )}

      {stage === "child-listen" && audioUrl && (
        <ScreenShell role={`For ${safeName}`} title="A story is waiting for you." helper="Press play. Listen to the grandparent’s voice.">
          <div className="relative flex min-h-[22rem] flex-col items-center justify-center overflow-hidden bg-story-coral p-8 text-story-ink">
            <StoryToken theme={theme} />
            <Button
              aria-label={isPlaying ? "Pause the recording" : "Play the recording"}
              className="mt-8 size-20 rounded-full bg-story-ink p-0 text-story-paper hover:bg-story-ink/90"
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="size-7" /> : <Play className="size-7 fill-current" />}
            </Button>
            <p className="mt-4 font-semibold">{isPlaying ? "The story is playing" : "Play the story"}</p>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
          </div>
          <FooterAction label="Make a choice" onClick={() => moveTo("child-choice", "child_finished_listening")} />
        </ScreenShell>
      )}

      {stage === "child-choice" && (
        <ScreenShell role={`For ${safeName}`} title="Where should the story go?" helper="Choose one place.">
          <div className="grid gap-4 sm:grid-cols-2">
            {theme.paths.map((path, index) => (
              <Button
                key={path}
                variant="outline"
                className={`min-h-64 flex-col rounded-sm border-2 p-7 text-story-ink shadow-none transition-transform hover:-translate-y-1 ${choice === path ? "border-story-ink bg-story-lime" : "border-story-ink/15 bg-story-paper hover:bg-story-yellow"}`}
                onClick={() => {
                  setChoice(path);
                  log("child_made_story_choice");
                }}
              >
                <span className="font-display text-8xl" aria-hidden>{theme.pathIcons[index]}</span>
                <span className="mt-5 whitespace-normal text-center text-lg">{path}</span>
              </Button>
            ))}
          </div>
          <FooterAction label="See what happens" onClick={() => moveTo("child-action")} disabled={!choice} />
        </ScreenShell>
      )}

      {stage === "child-action" && (
        <ScreenShell role={`For ${safeName}`} title={theme.ending} helper={theme.action}>
          <div className="story-celebration relative flex min-h-72 items-center justify-center overflow-hidden bg-story-yellow text-story-ink">
            <StoryToken theme={theme} />
            <span className="absolute left-[12%] top-[18%] font-display text-5xl">✦</span>
            <span className="absolute bottom-[16%] right-[14%] font-display text-6xl">●</span>
            <span className="absolute right-[20%] top-[14%] font-display text-4xl">+</span>
          </div>
          <Field label="Parent: What did the child do?">
            <div className="grid gap-3 sm:grid-cols-3">
              {["Did the action", "Laughed and tried again", "Made a new version"].map((item) => (
                <ChoiceButton key={item} selected={response === item} onClick={() => setResponse(item)}>{item}</ChoiceButton>
              ))}
            </div>
          </Field>
          <FooterAction label="Complete the story" onClick={() => moveTo("complete", "family_completed_story")} disabled={!response} />
        </ScreenShell>
      )}

      {stage === "complete" && (
        <section className="min-h-[calc(100svh-4rem)] bg-story-lime px-5 py-12 text-story-ink sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-semibold uppercase">One Story, Together</p>
            <h1 className="mt-4 max-w-3xl font-display text-6xl leading-none sm:text-8xl">Daadi was here for story time.</h1>
            <div className="mt-12 grid gap-px bg-story-ink/20 sm:grid-cols-3">
              {[
                ["1", "Parent", `Started with ${theme.label.toLowerCase()}.`],
                ["2", "Grandparent", "Added a real voice."],
                ["3", safeName, `Chose ${choice}.`],
              ].map(([number, label, text]) => (
                <div key={number} className="bg-story-paper p-7">
                  <span className="font-display text-4xl text-story-coral">{number}</span>
                  <h2 className="mt-5 text-lg font-semibold">{label}</h2>
                  <p className="mt-2 text-sm text-story-ink/65">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-12 rounded-sm bg-story-ink text-story-paper hover:bg-story-ink/90" onClick={downloadLog}>
                <Download /> Download activity
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-sm border-story-ink bg-transparent hover:bg-story-paper/50" onClick={reset}>
                <RotateCcw /> Start over
              </Button>
            </div>
          </div>
        </section>
      )}

      {stage !== "welcome" && stage !== "complete" && (
        <FacilitatorPanel events={events} onDownload={downloadLog} onReset={reset} />
      )}
    </main>
  );
}

function storyFor(theme: StoryTheme, name: string, age: AgeBand, detail: string) {
  const extra = detail ? `${name} ${detail.toLowerCase()}.` : "";
  if (age === "3–4") {
    return `${name}, this story is for you.\n\n${theme.character} went on an adventure. ${extra}\n\nShould ${theme.character} go to ${theme.paths[0]} or ${theme.paths[1]}?\n\nYou can choose. I want to hear what happens.`;
  }
  return `${name}, I made this story for you.\n\nOne morning, ${theme.character} found a map. The map showed two paths. ${extra}\n\nOne path led to ${theme.paths[0]}. The other path led to ${theme.paths[1]}.\n\nWhich path should ${theme.character} take? You choose what happens next.`;
}

function Progress({ step }: { step: number }) {
  return (
    <div className="bg-story-paper text-story-ink">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4 sm:px-8">
        {["Parent", "Grandparent", "Child"].map((label, index) => {
          const number = index + 1;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${step >= number ? "bg-story-ink text-story-paper" : "bg-story-ink/10"}`}>
                {step > number ? <Check className="size-3.5" /> : number}
              </span>
              <span className="hidden text-xs font-medium sm:block">{label}</span>
              {index < 2 && <span className="ml-auto h-px flex-1 bg-story-ink/15" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScreenShell({ role, title, helper, children }: { role: string; title: string; helper: string; children: React.ReactNode }) {
  return (
    <section className="min-h-[calc(100svh-8rem)] bg-story-mist px-5 py-10 text-story-ink sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase text-story-coral">{role}</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-story-ink/65">{helper}</p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}

function ChoiceButton({ selected, onClick, compact = false, className = "", children }: { selected: boolean; onClick: () => void; compact?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={selected}
      onClick={onClick}
      className={`${compact ? "h-auto min-h-11 px-4 py-2" : "h-auto min-h-14 p-4"} rounded-sm border-2 whitespace-normal shadow-none ${selected ? "border-story-ink bg-story-lime text-story-ink hover:bg-story-lime/90" : "border-story-ink/15 bg-story-paper text-story-ink hover:bg-story-yellow"} ${className}`}
    >
      {selected && <Check className="size-4" />}{children}
    </Button>
  );
}

function FooterAction({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="mt-10 border-t border-story-ink/15 pt-6">
      <Button size="lg" className="h-13 w-full rounded-sm bg-story-ink px-7 text-base text-story-paper hover:bg-story-ink/90 sm:w-auto" onClick={onClick} disabled={disabled}>
        {label} <ChevronRight />
      </Button>
    </div>
  );
}

function StoryToken({ theme, small = false }: { theme: StoryTheme; small?: boolean }) {
  return (
    <div
      className={`${small ? "size-16" : "size-36"} story-token relative flex shrink-0 items-center justify-center rounded-full border-4 border-story-ink text-story-ink`}
      style={{ backgroundColor: theme.color }}
      aria-label={`${theme.label} story token`}
    >
      <span className={`${small ? "text-2xl" : "text-6xl"} font-display`} aria-hidden>{theme.label === "Dinosaurs" ? "◭" : theme.label === "Space" ? "✦" : "●"}</span>
    </div>
  );
}

function MiniStory({ theme, name }: { theme: StoryTheme; name: string }) {
  return (
    <aside className="self-start border border-story-ink/15 bg-story-ink p-6 text-story-paper lg:sticky lg:top-8">
      <StoryToken theme={theme} small />
      <p className="mt-6 text-xs font-semibold uppercase text-story-paper/55">Story preview</p>
      <h2 className="mt-2 font-display text-3xl">{theme.title}</h2>
      <p className="mt-4 text-sm text-story-paper/65">Made for {name}</p>
    </aside>
  );
}

function Handoff({ theme, eyebrow, title, body, action, onContinue }: { theme: StoryTheme; eyebrow: string; title: string; body: string; action: string; onContinue: () => void }) {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-story-blue px-5 py-12 text-story-paper sm:px-8">
      <div className="story-handoff-orbit absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-story-paper/15" />
      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-story-lime">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-6xl leading-none sm:text-8xl">{title}</h1>
          <p className="mt-6 max-w-lg text-lg text-story-paper/70">{body}</p>
          <Button size="lg" className="mt-9 h-14 rounded-sm bg-story-coral px-8 text-story-ink hover:bg-story-coral/90" onClick={onContinue}>
            {action} <ChevronRight />
          </Button>
        </div>
        <StoryToken theme={theme} />
      </div>
    </section>
  );
}

function StoryWorld({ theme, mode }: { theme: StoryTheme; mode: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden data-mode={mode}>
      <div className="absolute -right-20 top-12 size-72 rounded-full bg-story-coral sm:size-[28rem]" />
      <div className="absolute bottom-[-14rem] right-[18%] size-[32rem] rotate-12 bg-story-blue sm:bottom-[-28rem] sm:size-[42rem] lg:bottom-[-14rem]" />
      <div className="absolute bottom-20 right-[8%] story-float"><StoryToken theme={theme} /></div>
      <div className="absolute left-[50%] top-[20%] font-display text-8xl text-story-yellow">✦</div>
    </div>
  );
}

function FacilitatorPanel({ events, onDownload, onReset }: { events: LogEvent[]; onDownload: () => void; onReset: () => void }) {
  return (
    <details className="mx-auto w-full max-w-5xl border-x border-b border-story-ink/15 bg-story-paper text-story-ink">
      <summary className="cursor-pointer px-4 py-3 text-xs font-semibold">Facilitator tools · {events.length} actions</summary>
      <div className="border-t border-story-ink/10 p-4">
        <div className="max-h-40 overflow-y-auto text-xs text-story-ink/60">
          {events.length ? events.slice().reverse().map((item) => <p key={`${item.event}-${item.time}`} className="border-b border-story-ink/10 py-2">{item.event.replaceAll("_", " ")}</p>) : <p>No actions yet.</p>}
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" className="rounded-sm" onClick={onDownload}><Download /> Log</Button>
          <Button size="sm" variant="outline" className="rounded-sm" onClick={onReset}><RotateCcw /> Reset</Button>
        </div>
      </div>
    </details>
  );
}
