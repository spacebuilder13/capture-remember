# Remember When: final design pass

Yes — the current screens are plain wireframes. This pass gives them the same look and motion as the One Story, Together pages, and fixes the two things you named.

## Your two fixes
- **Hold to talk button bigger:** a large round button (about 120px on a phone) in coral, centred, with a soft pulsing ring while it listens. "Type instead" sits under it.
- **Live words smaller:** the text that appears as you speak drops from large to normal reading size, in a calm box, so it reads as notes, not a headline. The character count stays small.

## Match the One Story, Together look
- **Open screen:** dark ink background like the main page, the Instagram photo full-bleed at the top, small yellow label "Remember When", the question in the big display font, one coral button.
- **Pick a story:** the five cards become large paper cards with a simple drawn mark each (no AI images), coral border on tap, cards slide in one after another.
- **Tell it:** paper background, the story name as a small coral label, big display heading, the starter line set like a quote.
- **Tonight:** the saved story as a paper card that settles into place, email box and buttons in the same style as the other pages (coral main button, outlined second buttons), WhatsApp and copy side by side.
- **Private link page:** same paper/ink styling; "Did anyone join in?" choices as large cards; who chips in the pill style used on the main page.
- **Motion:** the same gentle fade-and-rise used on the main page's memory lines; respects "reduce motion" settings.
- Same copy and flow; nothing about the steps, email timing, or tracking changes.

## Check
Screenshots at phone (390), your current size (749), and desktop (1280) for every screen, including the listening state, checking contrast and that nothing overlaps.

## Technical details
- Restyle `src/components/remember-ui.tsx` (shell gets `tone: "ink" | "paper"`, new SparkCard, ChoiceCard, Chip, coral/outline button variants matching `index.tsx`).
- Update `remember-when.tsx` and `remember-when_.$token.tsx` markup only; reuse existing `story-*` tokens and `story-memory-line` style animations in `src/styles.css`; add a talk-ring keyframe there.
- Transcript text `text-lg` → `text-base`/`text-[15px]`, talk button `size-28 rounded-full`.
