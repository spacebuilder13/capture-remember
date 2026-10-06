# Eliminate the homepage black band

## Root-cause analysis

### Confirmed technical cause

- The first-screen photograph is a 1280×720 landscape image with a 16:9 aspect ratio.
- It is currently rendered at full width with automatic height, so at a 1198px-wide preview it ends after roughly 674px.
- The surrounding first-screen section is taller: its current height formula resolves to roughly 803px at that preview size.
- The uncovered difference is therefore about 129px. The section has a dark background, and a full-section dark gradient sits over it. Together they create the black band visible in the uploaded screenshot.
- At narrower sizes the mismatch is worse because the image becomes shorter while the section deliberately adds up to 12rem beyond the image’s natural 16:9 height.

### Why this happened

The previous image used full-screen cover sizing. That filled the section but cropped the title embedded on the left side of the landscape photograph. The attempted correction changed the image to fit its full width instead of crop. That exposed the title, but it also stopped the image from filling the section vertically. The change solved one symptom by creating another.

This is an aspect-ratio conflict, not a color problem: one 16:9 image cannot simultaneously fill desktop, tablet, and portrait-mobile first screens while preserving the complete torn-paper title, both faces, and room context. CSS positioning alone cannot satisfy all of those constraints.

### Why visual QA failed

- The screenshots did show the black band after the change.
- The automated checks only verified overflow, browser errors, and page errors; they cannot judge visual composition.
- I incorrectly treated those passing checks as sufficient and did not enforce the visual rejection criteria I had stated.
- I also inspected whether the title and faces were visible, but failed to compare the full first screen against the intended immersive baseline.
- The correct response to that screenshot was to reject the implementation immediately, not report it as complete.

## Correction plan

1. **Restore and record the good baseline**
   - Begin from the restored last-good version.
   - Capture the entire first screen at 390×844, 834×873, 1198×873, and 1280×1800.
   - Record the acceptable crop, section height, face visibility, room context, and CTA placement from those screenshots.

2. **Create art-directed image variants**
   - Edit the existing photograph rather than regenerate the family or room.
   - Desktop/tablet variant: retain the 16:9 composition, torn-paper title, faces, light, and room; remove only the small printed “Preserve one memory” line.
   - Portrait-mobile variant: extend/reframe the same photograph for a tall canvas so the title and both faces remain visible without letterboxing, empty space, or a dark band.
   - Do not bake the working CTA into either image.

3. **Use the correct image for each screen shape**
   - Render the desktop/tablet and portrait variants through responsive image selection.
   - Make each selected image cover the full first screen; remove the height formula that intentionally creates uncovered space.
   - Keep only one live “Preserve one memory” button over the image.
   - Remove the separate title, “The incomplete photograph” label, and supporting sentence.
   - Limit any contrast overlay to the CTA’s local area instead of darkening an empty part of the section.

4. **Run visual QA as a blocking review**
   - Capture fresh full first-screen screenshots at all four target sizes.
   - Inspect the rendered pixels and reject the implementation if any screenshot shows a black/empty band, clipped title, duplicate wording, missing face, CTA collision, or unintended section bleed.
   - Compare each result side-by-side with the restored baseline before checking automated signals.
   - Only after visual approval, verify CTA interaction, the three-step flow, `/socials`, browser errors, and horizontal overflow.

## Acceptance criteria

- The photograph fills the first screen at every tested size with no black, empty, or letterboxed band.
- “A photo can’t remember for you.” appears once, inside the torn paper.
- The small printed CTA is removed from the image.
- One working “Preserve one memory” button remains.
- No separate title, label, or supporting sentence remains.
- Both faces, the important light, and enough room context remain visible.
- Every final screenshot is manually inspected and accepted before completion is reported.