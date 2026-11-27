# Experiment 06 "While It's Fresh"

Build 06 alongside 04/05. Nothing on 01–05 changes.

## 1. Registry card 06
Add "While It's Fresh" as card 06 on the home page, with links to the experience (`/while-its-fresh`) and creatives (`/while-its-fresh/socials`).

## 2. Creatives page (`/while-its-fresh/socials`)
- **Creative 1 — "Mihir at the park"** (48s vertical reel): your uploaded video, the caption word for word with its paragraphs, a Copy button, a Download button, and the platform note "Post from the Memreel Instagram page and boost it from there."
- A clear **"Do not launch" warning** on Creative 1: the end card still shows app-store badges and needs the browser-flow version from TQi.
- **Creative 2 — "First roti"** (37s illustrated reel): video, exact caption, Copy, Download, and the note "boost it as a reel."
- A note that these are compressed review copies and launch uses Harsh's originals, with the folder link.
- **Bhavik's instructions** in Before / During / After blocks, as on 05:
  - **Before:** organic post vs boost vs ad per reel; comment-"Keep" DM vs direct button link on ads; budget and duration if boosting; launch date; analytics set up.
  - **During:** watch page visits > stories kept > photo age > Keep sign-ups.
  - **After:** report stories kept, photo-age spread, and sign-ups.

## 3. Experience (`/while-its-fresh`)
Same look as 04/05, new words:
1. **Opening:** "Something happened this week. You can still tell it word for word. Keep the why on the photo before the chat moves on." Plus one button. No old photos, no fading-memory scare.
2. **Pick the moment:** An outing / Something they said / A first / Something else.
3. **Photo:** one photo, required. The app reads the date the photo was taken (or the file date if there is none) and saves how many days old it is.
4. **The why:** typed or spoken live as text (no audio is stored), prompted "What was said? What made you laugh? Why did it matter?" No AI suggestions or starter text.
5. **Kept:** the story saves and shows as a card with the photo and their words, plus its own private link.
6. **Keep invite:** one email field and a "Request my Keep invite" button. The wording says the invite comes later, not instantly. No account, prices, plans, or family invites, and no "who else was there" step.

## 4. Privacy and cleanup
- Each story is private to its own link. There is no feed, and 04/05 stories never appear here.
- Link-preview crawlers don't count as visits.
- Test stories are tagged so I can remove them before launch: a cleanup step that deletes 06 stories, photos and invite emails by tag, after a dry-run count.

## 5. Tracking
Page visit > story kept (with photo age in days) > Keep invite requested. These are three new 06 events.

## Questions I'll settle myself unless you object
- If a photo has no date, I save photo age as "unknown" rather than guessing.
- The saved story's private link reuses the existing private parent page, with the family-reply parts hidden for 06.

## Technical details
- Videos uploaded as Lovable assets under `src/assets/while-its-fresh/videos/`; captions/config in `src/lib/wif-creatives.ts`.
- Reuse `remember_stories` with `source = 'wif'`. A migration adds a nullable `photo_age_days int` column. 06 sparks are new keys, and `saveStory` validates them only when the source is `wif`.
- Photo date comes from EXIF DateTimeOriginal, parsed client-side with a tiny reader, with `file.lastModified` as the fallback. It is clamped 0–3650 and validated on the server.
- Keep invites go to `journal_waitlist`, adding a `source` column (`wif`) so they can be counted and cleaned. Anonymous users can only insert.
- The owner page (`me.$token`) skips the reply and family UI when `source === 'wif'`.
- New events, `project.wif_visit`, `project.wif_story_kept` {photo_age_days: integer|null} and `project.wif_keep_signup`, are registered in `.lovable/events.json`, with `isPreviewBot` guarding the visit event.
- Tests: spark validation per source, photo-age calculation and clamping, and 06 owner page hiding replies.
