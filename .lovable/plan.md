# Remember When: visual and working check, then fixes

## What your screenshot shows (wide laptop screen)
- The headline, line and button sit small in the bottom-left corner, far from the photo, with a large empty pink gap between them.
- The "MemReel" mark and "Private to you" sit in odd spots that don't line up with the text or the photo.
- The button and small text are too small to read easily at this size.

## Fix for the first screen on wide screens
- Put the text and photo side by side in one centred block with a set maximum width, so they stay close together on big screens.
- Centre the text vertically next to the photo, and make the headline, line and button bigger.
- Line up the header (MemReel and "Private to you") with the edges of that block.
- Keep the phone layout as it is.

## Full check after the fix
Go through the whole journey at phone (390), tablet (834), laptop (1440) and your size (1920 wide):
1. First screen, 2. pick a story, 3. add photos and choose one, 4. tell it (type), 5. names and the send buttons, 6. family link: add a memory, 7. parent's private link: see the memory, check in, delete.
- Take screenshots at each step and look at them for text that is too small, poor contrast, overlapping parts, cut-off photos or big empty gaps.
- Fix anything found, check again, and share the screenshots with you.
- Delete test stories and photos afterwards.

## Not covered
- A real phone's microphone, WhatsApp and email apps.

## Technical details
- `src/routes/remember-when/index.tsx` wide layout (line ~161): replace `grid-cols-[1fr_auto]` full-bleed with a `mx-auto max-w-7xl` two-column grid, `items-center`, image `w-full` capped by `max-h-[80svh]`; scale type with `xl:` sizes; align the shared header container to the same max width.
