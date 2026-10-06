# Correct the MemReel first screen

## What I understand

- First, restore the last good version through project History; do not attempt to reverse the failed change with more code.
- The photograph should remain immersive and fill the first screen as it did before, preserving the light, both faces, and the room.
- The torn paper is part of the photograph and should contain only “A photo can’t remember for you.”
- Remove the small printed “Preserve one memory” line from inside the torn paper.
- Remove the separate page title, “The incomplete photograph” label, and “It kept the light, the faces, the room. What did it leave out?”
- Keep one real “Preserve one memory” button as the only overlaid message/action.
- Do not change the three-step contribution flow or `/socials`.

## Approach after the restore

1. **Establish the baseline**
   - Capture the restored first screen at the current preview size, narrow mobile, and desktop.
   - Use those screenshots to lock the good photograph crop, first-screen height, faces, and CTA placement before editing anything.

2. **Prepare the photograph correctly**
   - Edit the image itself so the torn-paper area retains the title but no longer contains the small printed CTA.
   - Keep the existing photograph, torn edge, lighting, faces, and room unchanged; do not regenerate or recompose the scene.

3. **Simplify the page overlay**
   - Use the restored full-screen framing rather than fitting the whole image and creating an empty band.
   - Remove all separate headline, label, and supporting-copy elements.
   - Retain one functional CTA and position it over a naturally dark, uncluttered part of the photograph with reliable contrast.

4. **Visual QA before calling it done**
   - Capture fresh screenshots at 390×844, 834×873, 1198×873, and 1280×1800.
   - Inspect every screenshot visually, not only through automated checks.
   - Reject the result if the title is cropped, either face is obscured, the room loses too much context, the CTA collides with the torn piece, any duplicate wording remains, or a black/empty band appears.
   - Verify the CTA remains readable and clickable, then confirm the rest of the three-step flow still has no overlap or overflow.

## Acceptance criteria

- One embedded title inside the torn paper.
- One working CTA outside the torn paper.
- No printed CTA in the image.
- No separate title, label, or supporting sentence.
- Full-screen, immersive photograph with both faces, light, and room preserved.
- No black band, accidental crop, duplicate text, overlap, or poor contrast at any tested size.