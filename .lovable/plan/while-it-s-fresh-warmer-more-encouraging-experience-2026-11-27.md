# While It's Fresh — warmer, more encouraging experience

Scope: only the `/while-its-fresh` experience. Social assets are out of scope for now. Saving, privacy, the private link and the invite email ask all stay as they are.

## What changes, screen by screen

```text
Open  ->  Moment  ->  Photo  ->  Tell  ->  Story card reveal  ->  Keep invite
```

1. **Opening screen**
   - Two real stills from the reels (Mihir at the park, first roti), cut so faces and hands stay in frame. A wide crop for laptops and a tall crop for phones.
   - New title, written from your child's future point of view. Main pick: **"One day they'll ask what they were like at two."**
   - Short line under it: "This week gave you a story. Keep it in your words, while you still remember every detail."
   - One button: "Keep this week's story".

2. **Moment choice**
   - Title: "What happened this week?"
   - Four tiles, each with a crayon-style sketch (like Remember When's animal tiles): "We went somewhere", "They said something", "A first time", "Something else".

3. **Photo**
   - Title: "Add the photo from that moment."
   - Line: "The photo shows what happened. Your words will say why it mattered."
   - The selected photo appears large, in a gentle frame, with "Good one" before the next step.

4. **Tell**
   - Title: "Tell it the way you would tell them one day." Smaller line: "What did they say? What did they do next?"
   - 3–4 starter lines to tap and then edit. Each moment gets its own set, for example: "They looked at me and said…", "The first thing they did was…", "We laughed because…".
   - Same type-or-speak input as now.

5. **Story card reveal**
   - The photo and words come together in a keepsake card with a short reveal motion (photo settles, then the words appear line by line).
   - Title: "Kept. One day, they'll read this."
   - Private link and the Keep invite stay below, unchanged in function. Invite heading: "Keep one every week?"

## Copy rules
- Simple English (ASD STE 100 style): short sentences, everyday words, one idea per line.
- No prototype, research or campaign wording.

## Technical details
- Extract 2 stills each from the two reel videos with ffmpeg (landscape and portrait crops), upload as Lovable assets under `src/assets/while-its-fresh/`, and choose by viewport orientation as in the other experiments.
- Add 4 inline SVG crayon sketches next to the existing Remember When sketch component.
- Update `WIF_SPARKS` titles in `src/lib/remember-sparks.ts` (keys unchanged, so saved stories stay valid) and add per-spark `starters`.
- Reuse the existing starter-chip pattern and `RememberTextarea`; add the reveal with the existing `Rise` motion helper and respect reduced-motion.
- No database or backend changes. Existing tests should still pass; run the full journey with Playwright at phone, tablet and laptop sizes, with screenshots.
