# Experiment 05 changes: grid leads, carousel shares, videos added

## What changes

**1. The grid (Block 3) now opens the experience, not the unblurring story**
- The experiment link opens on the grid image instead of the slides.
- Under it, one button leads into the full Remember When journey (same 05 tagging, same 05 wording inside the flow).
- The grid caption's last line "Comment "memory" for the link to a mystery tool!" is replaced with:
  "Your loved ones hold the remaining picture. Share your half with them, and start the full experience."
- The button text uses the same idea (short form): "Share your half".

**2. The unblurring carousel (Block 2) becomes a share moment, not a lead-in**
- Slide 1 is removed everywhere. The carousel is now 6 slides, in this order: 2, 3, 4, 5, 6, 7 (blurry to fully clear).
- It no longer leads into the experience. Its ask is the caption line: "Share this with someone you want to have more intentional moments with."
- Sharing is the signal we count: the creatives page gets a share/copy-link control for the carousel, and each share tap is recorded.

**3. Block 1 videos replace the placeholders**
- MR071126_gif (portrait 4:5, 10s), MR071126_reel (wide, 14s), MR0711206_reel_v2 (wide, 14s) go into the three video slots, playable and downloadable, shown in their real shape (no cropping).
- Block 1 keeps its ask: "Pick a picture, drop it in the comments" (unchanged caption).

## Questions I am assuming answers to (tell me if wrong)
- Which wide reel is "copy together" vs "copy split"? I will label reel = copy together, reel_v2 = copy split.
- The grid's old alternate hooks list stays, with the "remaining picture" line now used as the main CTA.

## Checks after building
- Experiment link opens on the grid, button goes into the flow, flow still completes.
- Carousel shows 6 slides starting from old slide 2; old slide 1 is gone.
- All three videos play on phone and laptop widths; screenshots reviewed.

## Technical details
- `src/routes/one-photo-two-memories/index.tsx`: render grid asset + CTA; drop carousel and `opt2m_slide_seen`; keep `opt2m_cta_clicked`.
- `socials.tsx`: slides array = slide-2..7; delete `slide-1.png.asset.json` via lovable-assets; update GRID_CAPTION; add share button with new event `project.opt2m_carousel_shared` in `.lovable/events.json`.
- Upload videos with `lovable-assets` into `src/assets/one-photo-two-memories/videos/`; video slot shape gains a "portrait" option.
