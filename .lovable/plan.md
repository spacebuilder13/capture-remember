# Third experiment: Far-Away Moments (from Visionary Spark)

## What I understand
Visionary Spark is a separate MemReel experiment about grandparents who live far away. The idea: the photo reaches them, but the story around it doesn't. A parent picks one photo, writes a quick note about what happened just before, and MemReel turns it into a short message written for "Pop Pop", "Nani" or whoever it's for. The parent checks it, picks how that grandparent usually hears from them (WhatsApp, email, iMessage) and saves it. Nothing is sent yet.

It currently runs as its own app with its own reel video, example photos, and storage. You want it as card 03 in this registry, working the same way the other two do.

## 1. Registry card 03
- Name: **Far-Away Moments**
- Hypothesis: "Parents with family far away will share more of a moment when MemReel turns a photo and a quick note into the story behind it."
- Strong signal: a real photo saved with a message the parent marked "This is right"
- Status: Prototype
- Links: "Open experience" goes to `/far-away-moments` and "View socials" goes to `/far-away-moments/socials`

## 2. The experience at `/far-away-moments`
- Move the Visionary Spark page here: the looping reel with the line "He turned round to show someone. Four thousand miles away, Pop Pop was already clapping.", the fictional cushion-tower example, and the closing two-homes photo.
- Bring over its reel video and three photos so they display here.
- Keep to our rule of no clunky text boxes. The "What happened right before this?" step becomes tappable prompt cards with an optional short answer of your own, plus "Who's it for?" quick picks (Pop Pop, Nani, Oma, or your own).
- The flow stays at three steps: photo, then what happened plus who it's for, then check the message and choose WhatsApp, email or iMessage before saving.
- Saving keeps the photo and words private, the same way the first experiment does. No sign-in is needed.

## 3. Socials at `/far-away-moments/socials`
- Same layout as the other two: Instagram feed, Instagram story and LinkedIn, with captions, copy buttons, single downloads and "Download all".
- I'll show you the caption wording first and make images only after you approve it.

## 4. Visual check before I report back
I'll take screenshots at phone, tablet and desktop sizes of the registry, every step of the new flow, and the socials page, and look at each one. I'll reject any with cropped text, overlap, weak contrast, or empty or black bands.

## Questions I'm treating as settled unless you say otherwise
- I'm copying the experience into this project rather than linking out to the other app, so all three experiments share one address and one backend.
- The Visionary Spark project itself won't be changed.

## Technical details
- New routes: `src/routes/far-away-moments/index.tsx`, `src/routes/far-away-moments/socials.tsx`. Add a third entry to `EXPERIMENTS` in `src/routes/index.tsx`.
- Assets: download the 4 pointer assets (reel mp4, poster, tower, two-homes) from the source preview origin, using the pointers' own project_id and url, and re-upload them with lovable-assets.
- Backend migration: `moment_shares` table (session_id, photo_path, note, rewritten, grandparent_name, delivery, created_at) plus a `moment_events` table for funnel events. GRANT insert to anon, RLS insert-only, no public reads. Private `moment-photos` bucket with anon uploads limited to an `incoming/` folder (jpg/png/webp, 8MB).
- Server functions in `src/lib/moments.functions.ts`: logEvent, rewriteMoment (via `ai-gateway.server.ts` with the default model and a strict JSON schema; it only uses facts from the note), submitMoment. Add input validation and basic rate limiting.
- Update AGENTS.md, roadmap.md, and the project knowledge note about the registry.
