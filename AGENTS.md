<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- `/` is the experiments registry (static list in code); each experiment lives under its own path prefix with an `<prefix>/socials` internal campaign review page. Captured ≠ Remembered keeps its three-step journey at `/captured-remembered`.
- Journal Context (`/journal`) requires sign-in; entries, photos and surfacings are per-user tables scoped by `auth.uid()`, media in the private `journal-media` bucket under `<user_id>/`. AI calls run only in server functions via `src/lib/ai-gateway.server.ts`.
- Store contributed photos in the private `memory-contributions` bucket and metadata in `memory_contributions`; private media must never use public URLs.
- Use art-directed landscape and portrait first-screen photography selected by viewport orientation so the embedded title and family remain visible without letterboxing.
- Far-Away Moments (`/far-away-moments`) needs no sign-in: server functions in `src/lib/moments.functions.ts` write `moment_shares`/`moment_events` and the private `moment-photos` bucket with the admin client only after validation and per-session rate limits; tables have no client grants.
- Journal Context (/journal) is an email invite list only: no sign-in; emails go to journal_waitlist (anon insert-only). Why: keep the test to one simple ask.
- One Story, Together was removed; its tables and `story-audio` bucket are kept with no app code reaching them, and old `/one-story-together/*` URLs redirect. Why: the user kept the data but dropped the experiment.
- Remember When (`/remember-when`, socials `/remember-when/socials`, family link `/remember-when/$token` (`rw_`, adds replies) and parent-only link `/remember-when/me/$token` (`rw_o_`, check-in, replies, delete)) stores typed or live-transcribed text plus one required photo (private `remember-photos` bucket, `pending/<uuid>`, signed URLs only), never audio; `remember_stories`/`remember_followups`/`remember_replies` have no client grants and are reached only via `src/lib/remember.functions.ts`. Why: the brief starts from a real baby photo, needs no sign-up, and a child's voice should not be stored.

- Remember When quote inputs share an auto-expanding textarea so typed text, starter text and live transcription remain fully visible.
- Remember When link previews use only a heavily blurred 1200x630 copy (`preview/` in `remember-photos`, made on the phone) served by `/api/public/remember-preview/$token`; originals and added photos stay signed-URL only. Both `/r/$token` and `/remember-when/$token` emit tags via `familyLinkHead` (`src/lib/remember-share.ts`), falling back to the Remember When share image; `isPreviewBot` keeps crawlers from marking links opened or firing events. Why: WhatsApp fetches previews without sign-in and must not skew visit numbers.
- Remember When: anyone holding the family or parent link may add photos (`remember_photos`, max 12, `added/<story_id>/`), reached only via `remember.functions.ts`. Why: user confirmed forwarded link holders count as intended recipients; the app says so in plain words.
