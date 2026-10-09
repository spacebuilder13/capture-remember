# Journal Context: email only, no sign-in

## What changes
- The Journal page keeps its headline, short intro, the three ways to journal, and the made-up example.
- The sign-in box is replaced with one simple ask:
  - Heading: "Want to try it first?"
  - Line: "Leave your email. We'll send you an invite when it's ready."
  - One email field and one button: "Send me an invite"
  - After sending: "Thanks. We'll email you when it's ready."
- No passwords, no Google button, no account.
- The signed-in part (Photos, Today, Memory, Journal tabs) is removed. Anyone visiting that old address is sent back to the Journal page.
- Home page card and socials page stay as they are.

## Check before done
Screenshots at phone, tablet and desktop of the Journal page before and after sending an email, checked by eye.

## Technical details
- New table `journal_waitlist` (email, created_at), RLS on, anon INSERT only with an email length check, no reads. Zod validation on the client.
- Delete `src/routes/journal/app.tsx` and `src/lib/journal.functions.ts`; add a `journal/app` redirect to `/journal`. Remove sign-in code from `journal/index.tsx`. Existing journal tables and storage left in place (unused).
- Nothing is emailed yet (email sending isn't set up); emails are just collected.
- Update AGENTS.md / project note: Journal Context is an email waitlist, no sign-in.
