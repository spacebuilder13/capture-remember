# Add the two Reddit photos to the social page

Both photos go into the Reddit block on the One Story, Together social page, saved as they are with no crops or edits.

- **Portrait (4:5):** your first photo.
- **Square (1:1):** your second photo.

Each photo sits above the title and post text, with a label and a Download button. The photos don't link anywhere, because people answer in the comments.

## Check
Screenshots at phone, tablet and desktop sizes. I check that the photos are sharp, the text is easy to read, and the Copy and Download buttons work.

## Technical details
- `lovable-assets create` makes the pointers `src/assets/one-story-together/remember-when/reddit-portrait.png.asset.json` and `reddit-square.png.asset.json`.
- Add an image row to `RedditSection` in `src/routes/one-story-together/socials.tsx`, reusing the download pattern from the Instagram block.
