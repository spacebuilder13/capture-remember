# Remember When: Reddit post on the social page

Only the social page changes. There is no new flow, no link to the app, and the story cards stay as they are.

## What gets added
A **Reddit** block on the One Story, Together social page, right below the Instagram posts in the Remember When section:
- **The photo:** the album photo of the office baby shower in two sizes, square (1:1) and portrait (4:5). Each has a Download button.
- **The post title:** "What's the one story your parents told every single time the album came out?" with a Copy button.
- **The post text:** the full text exactly as you sent it, with a Copy button.
- **How to post:** one short line: post on Reddit with the photo and use this text as the post. No planted replies.

The photos do not link anywhere, because people answer in the comments.

## Waiting on you
The two photos as separate files. When they arrive, I save them as they are, with no crops or edits.

## Check
Screenshots at phone, tablet and desktop sizes. I check that the photos are sharp, the text is easy to read and the Copy buttons work.

## Technical details
- Save the photos as asset pointers under `src/assets/one-story-together/remember-when/` (`reddit-square.jpg`, `reddit-portrait.jpg`).
- Add a `RedditSection` to `src/routes/one-story-together/socials.tsx` that reuses the existing copy and download patterns.
