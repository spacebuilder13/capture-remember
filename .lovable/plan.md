# Remember When: match the first three experiments, and fix the last screen

## 1. Use the look of the first three experiments
Drop the dark ink / coral "One Story, Together" styling. Use the same system as Captured ≠ Remembered, Journal Context and Far-Away Moments:
- **Header:** "MemReel" wordmark top left, small "Private to you" with a lock top right.
- **First screen:** Khushi's photo full-bleed (tall image on phones, square/landscape on wide screens, chosen by screen shape, no black bands), soft top and bottom shade, one button "Pick a story to tell" over the dark part of the photo. The title stays only in the photo.
- **Below the photo:** the warm secondary band with one short line, like "The photograph kept the fort." in campaign 01.
- **Flow screens:** warm light background, small uppercase label "Your story", "Step 1 of 3" with the thin progress bars, big display heading, muted helper text, the same rounded-sm buttons and prompt cards used in campaign 01.
- **Spark cards:** the campaign 01 prompt-card style (thin border, primary border when picked), no symbols.
- **Talk button:** stays large and round, in the primary colour; live words stay small, in a calm bordered box.
- **Saved story:** the campaign 01 quote card (left primary border, display font).
- Same gentle fade-in motion as campaign 01; respects reduce-motion.

## 2. Is the last screen aligned with the brief? No.
The brief's target action, from Khushi's caption: **"Tell it to them tonight, and tell us who joined in."** The signal is the story being told at bedtime and someone else joining in. Sending the memory to another person's email is not part of that, and it adds a choice.

New last screen (Step 3 of 3 done), one ask only:
- Heading: "Tell it to them tonight."
- Their story card.
- One line: "Tomorrow we will ask who joined in."
- One email box ("Your email") and one button: "Remind me tomorrow".
- Small line: "We use this email only for this reminder."
- After sending: "Done. Tell it tonight." Nothing else. No WhatsApp, no copy link, no nominate link on this screen.

The next-morning email opens the private page: "Did anyone join in?" with three large choices, then optional "Who joined?" chips. "Ask someone to share theirs" moves there, after they answer — that is when passing it on makes sense.

## 3. Check
Screenshots at 390, 749 and 1280 wide for every screen, compared side by side with campaign 01's screens, before reporting back.

## Technical details
- Restyle `src/components/remember-ui.tsx` to use `background / secondary / primary / muted-foreground` tokens and `@/components/ui/button`; remove `story-*` usage there.
- `remember-when.tsx`: add header, `<picture>` with story.jpg (portrait) and square.jpg (landscape) like `captured-remembered/index.tsx`, step indicator, simplified tonight stage; email saved via existing `saveRememberEmail`, button event renamed in tracking to `project.remember_email_sent` (unchanged name).
- `remember-when_.$token.tsx`: same tokens; nominate link only after an answer.
- Still open: sending the reminder needs MemReel's email sender connected.
