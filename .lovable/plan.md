# Remove One Story, Together, keep Remember When

## What goes away
- The One Story, Together experience, its shared family links, and its social page (videos, covers, Instagram and LinkedIn copy, "Download everything").
- Card 04 on the home page.

## What stays
- **Remember When** becomes its own experiment, card 05 on the home page (it will show as 04 if you'd like, say so).
  - Experience moves to `/remember-when`; private family links move to `/remember-when/<link>`.
  - Its Instagram and Reddit posts move to a new social page at `/remember-when/socials`, unchanged.
  - Old Remember When addresses send people on to the new ones, so links already shared on WhatsApp keep working.
- Families' saved stories and recordings stay stored in the backend. Nothing is deleted from the data.

## Check
Screenshots at phone, tablet and desktop: home page, Remember When flow, a family link, and the new social page. Old addresses tested for the redirect.

## Technical details
- Delete `src/routes/one-story-together/index.tsx`, `s.$token.tsx`, `socials.tsx`; story-only code (`story.functions.ts`, `story-ui.tsx`, `use-recorder.ts`, `story-themes.ts`) and the distance video/cover/zip asset pointers, after `rg` confirms nothing else uses them.
- Move `remember-when.tsx` → `src/routes/remember-when/index.tsx`, `remember-when_.$token.tsx` → `remember-when/$token.tsx`; new `remember-when/socials.tsx` with `RememberWhenSection` + `RedditSection`. Update the share link builder to the new path.
- Keep redirect routes: `/one-story-together/remember-when` and `/one-story-together/remember-when/$token` → new paths. `/one-story-together` and its socials → `/`.
- Tables and the `story-audio` bucket are left untouched. Update AGENTS.md / project notes to drop the One Story, Together rule and record the new Remember When paths.
