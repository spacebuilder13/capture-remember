import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, ClipboardPaste, ImagePlus, Loader2, Mic, Sparkles, Square, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { addNotebookEntry, addVoiceEntry, captionPhoto, surfaceMemory } from "@/lib/journal.functions";

export const Route = createFileRoute("/journal/app")({
  head: () => ({
    meta: [
      { title: "Your journal | MemReel" },
      { name: "description", content: "Your private MemReel journal and today's memory." },
      { property: "og:title", content: "Your journal | MemReel" },
      { property: "og:description", content: "Your private MemReel journal and today's memory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JournalApp,
});

type Entry = Database["public"]["Tables"]["journal_entries"]["Row"];
type Photo = Database["public"]["Tables"]["journal_photos"]["Row"] & { url?: string | undefined };
type Surfacing = Database["public"]["Tables"]["memory_surfacings"]["Row"];
const BUCKET = "journal-media";
const TABS = ["Today", "Memory", "Photos", "Journal"] as const;

function JournalApp() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Photos");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [surfacing, setSurfacing] = useState<Surfacing | null>(null);
  const [loaded, setLoaded] = useState(false);
  const uid = session?.user.id;

  useEffect(() => {
    if (ready && !session) navigate({ to: "/journal" });
  }, [ready, session, navigate]);

  const load = useCallback(async () => {
    if (!uid) return;
    const [e, p, s] = await Promise.all([
      supabase.from("journal_entries").select("*").order("created_at", { ascending: false }),
      supabase.from("journal_photos").select("*").order("created_at", { ascending: false }),
      supabase.from("memory_surfacings").select("*").order("created_at", { ascending: false }).limit(1),
    ]);
    const ph = p.data ?? [];
    if (ph.length) {
      const signed = await supabase.storage.from(BUCKET).createSignedUrls(ph.map((x) => x.photo_path), 3600);
      ph.forEach((x, i) => ((x as Photo).url = signed.data?.[i]?.signedUrl ?? undefined));
    }
    setEntries(e.data ?? []);
    setPhotos(ph);
    setSurfacing(s.data?.[0] ?? null);
    if (!loaded) setTab(ph.length ? "Today" : "Photos");
    setLoaded(true);
  }, [uid, loaded]);

  useEffect(() => {
    load();
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!uid) return <main className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></main>;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="font-display text-2xl">Mem<span className="font-sans text-base font-semibold">Reel</span></Link>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <nav className="flex gap-2 overflow-x-auto pb-2" role="tablist">
          {TABS.map((t) => (
            <Button key={t} role="tab" aria-selected={tab === t} variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)} className="shrink-0 rounded-sm shadow-none">
              {t}
            </Button>
          ))}
        </nav>
        <div className="mt-10">
          {tab === "Photos" && <PhotosTab uid={uid} photos={photos} reload={load} onDone={() => setTab("Today")} />}
          {tab === "Today" && <TodayTab uid={uid} count={entries.length} reload={load} onDone={() => setTab("Memory")} />}
          {tab === "Memory" && <MemoryTab surfacing={surfacing} photos={photos} entries={entries.length} reload={load} />}
          {tab === "Journal" && <JournalTab entries={entries} reload={load} />}
        </div>
      </div>
    </main>
  );
}

function ErrorLine({ text }: { text: string }) {
  return text ? <p role="alert" className="mt-4 text-sm text-destructive">{text}</p> : null;
}

function PhotosTab({ uid, photos, reload, onDone }: { uid: string; photos: Photo[]; reload: () => Promise<void>; onDone: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const caption = useServerFn(captionPhoto);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files).filter((f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size < 10 * 1024 * 1024).slice(0, 20 - photos.length);
    for (const [i, f] of list.entries()) {
      setBusy(`Adding photo ${i + 1} of ${list.length}…`);
      const path = `${uid}/photos/${crypto.randomUUID()}.${f.name.split(".").pop()?.toLowerCase() || "jpg"}`;
      const up = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type });
      if (up.error) { setError("A photo couldn't be saved."); continue; }
      const row = await supabase.from("journal_photos").insert({ user_id: uid, photo_path: path }).select().single();
      if (row.data) {
        const r = await caption({ data: { id: row.data.id } });
        if ("error" in r) { setError(r.error); if (/credit|too many|access/i.test(r.error)) break; }
      }
    }
    setBusy("");
    await reload();
  };

  const remove = async (p: Photo) => {
    await supabase.storage.from(BUCKET).remove([p.photo_path]);
    await supabase.from("journal_photos").delete().eq("id", p.id);
    reload();
  };

  return (
    <section>
      <h1 className="font-display text-4xl">Add a few of your photos.</h1>
      <p className="mt-3 text-muted-foreground">Up to 20 everyday photos. These are the memories MemReel can bring back to you.</p>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => upload(e.target.files)} />
      <div className="mt-7 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {photos.map((p) => (
          <div key={p.id} className="group relative aspect-square overflow-hidden bg-secondary">
            {p.url && <img src={p.url} alt={p.ai_caption ?? "Your photo"} className="h-full w-full object-cover" />}
            <button type="button" onClick={() => remove(p)} aria-label="Remove photo" className="absolute right-1 top-1 rounded-sm bg-background/90 p-1.5 text-foreground">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {photos.length < 20 && (
          <button type="button" disabled={!!busy} onClick={() => input.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-primary/50 bg-secondary text-sm text-muted-foreground hover:bg-accent">
            <ImagePlus className="size-6 text-primary" /> Add
          </button>
        )}
      </div>
      {busy && <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {busy}</p>}
      <ErrorLine text={error} />
      {photos.length > 0 && <Button onClick={onDone} className="mt-8 rounded-sm shadow-none">Now, tell us about your day</Button>}
    </section>
  );
}

function TodayTab({ uid, count, reload, onDone }: { uid: string; count: number; reload: () => Promise<void>; onDone: () => void }) {
  const [mode, setMode] = useState<"voice" | "text" | "notebook" | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [text, setText] = useState("");
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<number | null>(null);
  const notebook = useRef<HTMLInputElement>(null);
  const voiceFn = useServerFn(addVoiceEntry);
  const notebookFn = useServerFn(addNotebookEntry);

  const finish = async (r: { error: string } | { entry: unknown }) => {
    setBusy("");
    if ("error" in r) return setError(r.error);
    setSaved(true);
    setMode(null);
    setText("");
    await reload();
  };

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timer.current) window.clearInterval(timer.current);
        const blob = new Blob(chunks, { type: "audio/webm" });
        setBusy("Listening to your note…");
        const path = `${uid}/voice/${crypto.randomUUID()}.webm`;
        const up = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "audio/webm" });
        if (up.error) { setBusy(""); return setError("Your recording couldn't be saved."); }
        finish(await voiceFn({ data: { path } }));
      };
      recorder.current = rec;
      rec.start();
      setSeconds(0);
      timer.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= 30) rec.state === "recording" && rec.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone access was blocked. Allow it in your browser, or paste your notes instead.");
    }
  };

  const saveText = async () => {
    setBusy("Saving…");
    const r = await supabase.from("journal_entries").insert({ user_id: uid, source: "text", transcript: text.trim().slice(0, 8000) });
    finish(r.error ? { error: "Couldn't save your entry." } : { entry: true });
  };

  const uploadNotebook = async (f?: File) => {
    if (!f) return;
    setError("");
    setBusy("Reading your handwriting…");
    const path = `${uid}/notebook/${crypto.randomUUID()}.${f.name.split(".").pop()?.toLowerCase() || "jpg"}`;
    const up = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type });
    if (up.error) { setBusy(""); return setError("Your page couldn't be saved."); }
    finish(await notebookFn({ data: { path } }));
  };

  const recording = recorder.current?.state === "recording";

  return (
    <section>
      <h1 className="font-display text-4xl">How was your day?</h1>
      <p className="mt-3 text-muted-foreground">Pick whichever is easiest. {count > 0 && `${count} ${count === 1 ? "entry" : "entries"} so far.`}</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <ModeCard icon={<Mic />} title="Talk for 30 seconds" active={mode === "voice"} onClick={() => setMode("voice")} />
        <ModeCard icon={<ClipboardPaste />} title="Paste your notes" active={mode === "text"} onClick={() => setMode("text")} />
        <ModeCard icon={<BookOpen />} title="Photo of a notebook page" active={mode === "notebook"} onClick={() => { setMode("notebook"); notebook.current?.click(); }} />
      </div>
      <input ref={notebook} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(e) => uploadNotebook(e.target.files?.[0])} />

      {mode === "voice" && !busy && (
        <div className="mt-8 flex flex-col items-center gap-4 border border-border bg-secondary p-8 text-center">
          <p className="font-display text-5xl tabular-nums">0:{String(30 - seconds).padStart(2, "0")}</p>
          {recording ? (
            <Button onClick={() => recorder.current?.stop()} className="h-12 rounded-full px-6 shadow-none"><Square /> Stop and save</Button>
          ) : (
            <Button onClick={startRecording} className="h-12 rounded-full px-6 shadow-none"><Mic /> Start recording</Button>
          )}
          <p className="text-xs text-muted-foreground">Just the highlight. It stops by itself at 30 seconds.</p>
        </div>
      )}
      {mode === "text" && !busy && (
        <div className="mt-8">
          <label htmlFor="paste" className="text-sm font-medium">Paste from your journal or notes app</label>
          <Textarea id="paste" value={text} onChange={(e) => setText(e.target.value)} rows={6} maxLength={8000} className="mt-2 rounded-sm bg-background text-base" placeholder="Paste one or more days of notes…" />
          <Button onClick={saveText} disabled={!text.trim()} className="mt-4 rounded-sm shadow-none">Save entry</Button>
        </div>
      )}
      {busy && <p className="mt-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {busy}</p>}
      <ErrorLine text={error} />
      {saved && !busy && (
        <div className="mt-8 flex flex-wrap items-center gap-4 border-l-2 border-primary bg-secondary px-5 py-4">
          <p className="text-sm">Saved to your journal.</p>
          <Button size="sm" onClick={onDone} className="rounded-sm shadow-none"><Sparkles /> See a memory for today</Button>
        </div>
      )}
    </section>
  );
}

function ModeCard({ icon, title, active, onClick }: { icon: React.ReactNode; title: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`flex items-center gap-3 border p-5 text-left text-base transition-colors [&_svg]:size-5 [&_svg]:text-primary ${active ? "border-primary bg-accent" : "border-border bg-card hover:bg-secondary"}`}>
      {icon} {title}
    </button>
  );
}

function MemoryTab({ surfacing, photos, entries, reload }: { surfacing: Surfacing | null; photos: Photo[]; entries: number; reload: () => Promise<void> }) {
  const surface = useServerFn(surfaceMemory);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const photo = photos.find((p) => p.id === surfacing?.photo_id);

  const run = async () => {
    setBusy(true);
    setError("");
    const r = await surface();
    setBusy(false);
    if ("error" in r) return setError(r.error);
    await reload();
  };

  const feedback = async (value: "feels_right" | "not_quite") => {
    if (!surfacing) return;
    await supabase.from("memory_surfacings").update({ feedback: value }).eq("id", surfacing.id);
    reload();
  };

  return (
    <section>
      <h1 className="font-display text-4xl">A memory for today</h1>
      {surfacing && photo ? (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">Lately, you’ve been thinking about…</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {(surfacing.themes as string[]).map((t) => <li key={t} className="rounded-full bg-secondary px-3 py-1.5 text-sm">{t}</li>)}
          </ul>
          <div className="mt-6 grid overflow-hidden bg-secondary sm:grid-cols-2">
            {photo.url && <img src={photo.url} alt={photo.ai_caption ?? "Your memory"} className="aspect-square h-full w-full object-cover" />}
            <div className="flex flex-col justify-center p-7">
              <p className="font-display text-2xl leading-snug">{surfacing.reason}</p>
              {surfacing.feedback ? (
                <p className="mt-6 text-sm text-muted-foreground">Thanks — you said {surfacing.feedback === "feels_right" ? "this feels right" : "not quite"}.</p>
              ) : (
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button onClick={() => feedback("feels_right")} className="rounded-sm shadow-none">This feels right</Button>
                  <Button variant="outline" onClick={() => feedback("not_quite")} className="rounded-sm bg-background shadow-none">Not quite</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-muted-foreground">
          {entries && photos.length ? "Ready when you are." : "Add at least one photo and one journal entry first."}
        </p>
      )}
      <Button onClick={run} disabled={busy || !entries || !photos.length} variant={surfacing ? "outline" : "default"} className="mt-8 rounded-sm shadow-none">
        {busy ? <><Loader2 className="animate-spin" /> Reading your week…</> : <><Sparkles /> {surfacing ? "Find another memory" : "Find today’s memory"}</>}
      </Button>
      <ErrorLine text={error} />
    </section>
  );
}

function JournalTab({ entries, reload }: { entries: Entry[]; reload: () => Promise<void> }) {
  const remove = async (e: Entry) => {
    if (e.media_path) await supabase.storage.from(BUCKET).remove([e.media_path]);
    await supabase.from("journal_entries").delete().eq("id", e.id);
    reload();
  };
  const label = { voice: "Voice note", text: "Pasted notes", notebook: "Notebook page" } as Record<string, string>;
  return (
    <section>
      <h1 className="font-display text-4xl">Your journal</h1>
      <p className="mt-3 text-muted-foreground">Private to you. Delete anything, any time.</p>
      {entries.length === 0 && <p className="mt-8 text-sm text-muted-foreground">No entries yet.</p>}
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {entries.map((e) => (
          <li key={e.id} className="flex gap-4 py-5">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                {new Date(e.created_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {label[e.source]}
              </p>
              <p className="mt-1.5 whitespace-pre-line leading-relaxed">{e.transcript}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Delete entry" onClick={() => remove(e)}><Trash2 /></Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
