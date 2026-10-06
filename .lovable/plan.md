# Streamline the MemReel flow and add a social-assets route

## Outcome

- Keep the experiment on `/`, but reduce the contribution journey from five steps to three: photo, remembered detail, unseen detail.
- Replace large blank text areas with guided prompt cards and short, low-effort responses.
- Add `/socials` as a review-and-download page for the approved campaign images and platform copy.

## Experience changes on `/`

1. **Photo** — retain the private image picker, file checks, and visual preview.
2. **What do you still remember?** — show tappable sentence starters such as “I can still hear…”, “The funny part was…”, and “We always called it…”. Selecting one opens a compact one-line completion field with a short practical limit rather than an 800-character box. The user can also choose “Write my own”.
3. **What can’t the photo show?** — use a second set of relevant starters, including “What happened just before…”, “The words they used…”, and “How the room felt…”. This answer remains optional. Keep email as a compact delivery detail on this final screen, not as another journey step.

The progress display, back/continue behavior, review, completion view, and saved data will all reflect the three-step model. Existing private storage remains unchanged; the two answers continue using the current remembered and missing fields.

## Social-assets route

Create `/socials` with its own page title and sharing metadata. It will include:

- A clear platform switcher for Instagram feed, Instagram portrait/story usage, and LinkedIn.
- The approved square and portrait artwork shown at the correct aspect ratios.
- Platform-specific captions from the prepared campaign copy, presented exactly beside the matching artwork.
- One-click caption copying with visible confirmation.
- Individual image downloads with useful filenames, plus a combined “download all” package if supported cleanly in the browser.
- A simple link between the experiment and social-assets pages without turning the public experiment into a multi-page marketing site.

Existing campaign artwork will be copied into the app’s asset library; resized derivatives will preserve composition and avoid stretching or cropping important content.

## Verification

- Test the complete three-step private submission, including optional skipping, validation, back navigation, and completion.
- Check the prompt-card interaction and text fit on mobile and desktop.
- Verify every social preview, caption-copy action, and image download.
- Confirm `/` and `/socials` load without page or console errors and each has unique metadata.

## Technical details

- Add a dedicated TanStack route file for `/socials`; do not alter the generated route tree manually.
- Reuse the current design tokens, typography, button components, and private upload path.
- Keep the existing database shape; the removed “what happened” value will be saved as empty for new contributions.
- Update the project roadmap and architecture note to reflect the three-step journey and the separate internal review route.
