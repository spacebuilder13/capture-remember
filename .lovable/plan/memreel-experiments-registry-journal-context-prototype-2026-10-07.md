# MemReel experiments registry + Journal Context prototype

## 1. Home page becomes the experiments registry
- `/` lists every hypothesis we are testing as a simple card: idea name, one-line hypothesis, status (Live / In build), "Open experience" link, "View socials" link.
- Card 1: Captured is not Remembered (the photo-memory journey, unchanged).
- Card 2: Journal Context (new).
- Same warm paper, charcoal, and coral look. Nothing about the existing journey's wording, steps, or photos changes. It just moves to its own page.

## 2. Pages per experiment
```text
/                                  registry
/captured-remembered               existing photo journey (moved)
/captured-remembered/socials       existing socials page (moved)
/journal                           new prototype
/journal/socials                   new socials review + downloads
```
The old `/socials` address will forward to its new home so links still work.

## 3. Journal Context prototype (working)
Hypothesis: if MemReel captures short daily journal entries and understands what has been on your mind lately, it can bring back the right memory at the right moment.

Flow:
1. **Sign in** (email or Google). Entries and photos stay private to you.
2. **Add your photos**: upload a small set of your own photos (up to ~20) so there are memories to bring back.
3. **Tell us about your day**, in any of three ways (one tap each, no big text boxes):
   - Record a 30-second voice note (timer stops at 30s), turned into text automatically.
   - Paste notes from a journal or notes app.
   - Snap a photo of a handwritten notebook page; we read the handwriting.
4. **What's been on your mind**: from your last 7–10 days of entries, a short list of themes (for example "your daughter's first swim lessons", "missing your dad").
5. **A memory for today**: the photo from your set that best fits those themes, with one sentence explaining why it was chosen. Buttons: "This feels right" / "Not quite" (that answer is our strong signal).
6. **Your journal**: list of past entries, private, deletable.

Demo-friendly: a visible "illustrative example" preview of steps 4–5 before sign-in, so people see the value before investing, like the first experiment.

## 4. Socials for Journal Context
- New campaign images in the same style (fictional, illustrative scenes): Instagram feed, Instagram story, LinkedIn.
- Platform-native captions and copy, copy buttons, individual downloads, and a "Download all" package, matching the first socials page.
- I will show you the wording first before rendering images.

## 5. Visual QA (blocking)
Screenshots at 390×844, 834×873, 1280×1800 of the registry, every journal step, and both socials pages, inspected by eye before I say it's done: no cropped text, no overlap, readable contrast, no empty bands.

## Technical details
- Routes: move `src/routes/index.tsx` journey to `captured-remembered.index.tsx`, socials to `captured-remembered.socials.tsx`; redirect route for `/socials`; new `journal.*` routes under an auth-gated layout for the app steps; public `journal.index.tsx` with example + sign-in.
- Auth: Lovable Cloud email + Google.
- Data: tables `journal_entries` (user_id, source: voice|text|notebook, transcript, audio_path, image_path, created_at), `journal_photos` (user_id, photo_path, ai_caption), `memory_surfacings` (user_id, themes jsonb, photo_id, reason, feedback). Private bucket `journal-media`, per-user folders; RLS scoped to `auth.uid()` with grants.
- AI (Lovable AI): speech-to-text with `openai/gpt-transcribe`; notebook handwriting read and photo captioning with `openai/gpt-6-astra` (image input); themes + photo pick with `openai/gpt-6-astra`, strict JSON schema, over rolling 10-day entries and photo captions. All calls in server functions, streamed, with clear error messages for credit/rate limits.
- Registry data is a static list in code (no database needed).
- Update AGENTS.md (route structure rule), project knowledge note about `/` being the registry, and roadmap.md.
