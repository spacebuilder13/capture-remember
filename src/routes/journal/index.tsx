import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Check, ClipboardPaste, Lock, Mic } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Thirty seconds a day | MemReel Journal" },
      { name: "description", content: "Tell MemReel about your day and it brings back the memory that fits what is on your mind." },
      { property: "og:title", content: "Thirty seconds a day | MemReel Journal" },
      { property: "og:description", content: "Tell MemReel about your day and it brings back the memory that fits what is on your mind." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JournalLanding,
});

const emailSchema = z.string().trim().email().max(320);

function JournalLanding() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const join = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setMsg("Please enter a valid email.");
    setBusy(true);
    setMsg("");
    const { error } = await supabase.from("journal_waitlist").insert({ email: parsed.data });
    setBusy(false);
    if (error) return setMsg("That didn’t go through. Please try again.");
    setEmail(parsed.data);
    setDone(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="font-display text-2xl">Mem<span className="font-sans text-base font-semibold">Reel</span></Link>
          <span className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" /> Private to you</span>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">Journal Context</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] sm:text-6xl">Tell us about your day. We’ll bring back the memory that fits it.</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Thirty seconds out loud, a note you already wrote, or a page from your notebook. MemReel notices what has been on your mind and finds the photo that belongs with it.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-2 border border-border px-3 py-2"><Mic className="size-4 text-primary" /> 30-second voice note</span>
            <span className="flex items-center gap-2 border border-border px-3 py-2"><ClipboardPaste className="size-4 text-primary" /> Paste your notes</span>
            <span className="flex items-center gap-2 border border-border px-3 py-2"><BookOpen className="size-4 text-primary" /> Photo of a notebook page</span>
          </div>
        </div>

        <div className="border border-border bg-secondary p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase text-primary">An illustrative example</p>
          <p className="mt-4 text-sm text-muted-foreground">This week you mentioned…</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {["Maya’s first swim lesson", "Missing Dad’s Sunday calls", "A rainy, slow week"].map((t) => (
              <li key={t} className="rounded-full bg-background px-3 py-1.5 text-sm">{t}</li>
            ))}
          </ul>
          <div className="mt-6 bg-background p-5">
            <p className="text-xs font-medium text-muted-foreground">A memory for today</p>
            <p className="mt-2 font-display text-2xl leading-snug">Dad holding Maya at the lake, summer two years ago.</p>
            <p className="mt-3 text-sm text-muted-foreground">You’ve been thinking about water and about your dad. This is the day they were both there.</p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Fictional example. Your journal stays private.</p>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/50">
        <div className="mx-auto max-w-md px-5 py-14 sm:px-8">
          {done ? (
            <div role="status" className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-7" /></span>
              <h2 className="mt-5 font-display text-4xl">You’re in!</h2>
              <p className="mt-3 break-words text-base text-muted-foreground">Your invite is on its way to <span className="font-medium text-foreground">{email}</span>.</p>
            </div>
          ) : (
            <form onSubmit={join}>
              <h2 className="font-display text-4xl">Get your invite</h2>
              <p className="mt-2 text-sm text-muted-foreground">Enter your email and we’ll send you your invite to start.</p>
              <label className="mt-6 block text-sm font-medium" htmlFor="j-email">Email</label>
              <Input id="j-email" type="email" autoComplete="email" required maxLength={320} value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-12 rounded-sm bg-background" />
              {msg && <p role="alert" className="mt-3 text-sm text-foreground">{msg}</p>}
              <Button type="submit" disabled={busy || !email} className="mt-5 h-12 w-full rounded-sm shadow-none">
                Send my invite <ArrowRight />
              </Button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 text-center text-xs text-muted-foreground">
        <Link to="/journal/socials" className="text-foreground underline underline-offset-4 hover:text-primary">Review social assets</Link>
      </footer>
    </main>
  );
}
