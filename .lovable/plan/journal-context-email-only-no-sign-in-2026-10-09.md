# Journal Context: email only, no sign-in

## What changes
- The Journal page keeps its headline, short intro, the three ways to journal, and the made-up example.
- The sign-in box is replaced with one simple ask:
  - Heading: "Get your invite"
  - Line: "Enter your email and we'll send you your invite to start."
  - One email field and one button: "Send my invite"
  - After sending: "You're in! Your invite is on its way to you@email.com." with a small coral check mark.
- No passwords, no Google button, no account.
- The signed-in part (Photos, Today, Memory, Journal tabs) is removed. Anyone visiting that old address is sent back to the Journal page.
- Home page card and socials page stay as they are.

## Visual check (must pass before I share it)
Screenshots at phone, tablet and desktop of the Journal page before and after sending an email, each checked by eye: no cropped or overlapping text, readable contrast, no empty bands, button and thank-you message fully visible.

## Technical details
- New table `journal_waitlist` (email, created_at), RLS on, anon INSERT only with an email length check, no reads. Zod validation on the client.
- Delete `src/routes/journal/app.tsx` and `src/lib/journal.functions.ts`; add a `journal/app` redirect to `/journal`. Remove sign-in code from `journal/index.tsx`. Existing journal tables and storage left in place (unused).
- Nothing is emailed yet (email sending isn't set up); emails are just collected.
- Update AGENTS.md / project note: Journal Context is an email waitlist, no sign-in.
