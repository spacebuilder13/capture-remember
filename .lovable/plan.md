# 05 One Photo, Two Memories: creatives in three folders, and an experience that starts with the unblurring story

## 1. Creatives page, organised by block
The 05 creatives page gets three clearly labelled sections, in the order of your deck:

- **Block 1 - Video (Option 1, reel or gif):** three video slots, "Video coming soon" until you send the files:
  square, wide with the copy together, wide with the copy split.
  Shown with its caption, the reasons behind it and where to run it, taken word for word from your slides.
- **Block 2 - Unblurring (Option 2, carousel):** the 7 carousel images (creatives 2-8) in swipe order, with the revised caption and where to run it.
- **Block 3 - Grid (Option 3, static):** the "What if the photo only brings back half of the memory?" grid image, with the revised caption and the alternative hooks.

Each block has its own Download buttons, and a Copy button for its caption.
In the project, each block's files sit in their own folder (videos, unblurring, grid), so new files go in the right place.

## 2. "Open experience" starts with Block 2, then the button
`/one-photo-two-memories` stops jumping straight into Remember When. Instead:

1. **First screen:** the unblurring carousel, one image at a time. Swipe or tap to move on, with a small dot row and a gentle blur-to-sharp change between slides.
2. **Last slide:** one button, "Tonight, pick a photo".
3. **The button opens the extended experience, "Send to the other person".** It uses Remember When's existing steps, so nothing is rebuilt:
   - pick a photo you were both in
   - add the one thing you remember
   - send a link on WhatsApp or by email so the other person adds their side
   - both sides show on the story
   Every step keeps the 05 tag, so the numbers stay separate from 04.

The 05 wording on those steps changes to "one photo, two memories", for example "What's the one thing you remember?" and "Ask them for their side". 04's own words and flow stay exactly as they are; 05 visitors just see the 05 words.

## Tracking
- A new 05-only event for each carousel slide seen and for the button tap, with no personal details.
- The five 05 events from last time stay as they are.

## Checks
- Phone and laptop sizes: the carousel works by swipe and by tap, and the button opens the 05 steps.
- The full journey works as two different people, plus a forwarded third person.
- 04 still looks and works as before.
- The creatives page shows all three blocks.
- I delete only my test stories afterwards. Real WhatsApp behaviour stays untested until you publish.

## Technical details
- New route `one-photo-two-memories/index.tsx` renders the carousel. The button links to `/remember-when?src=opt2m`, and Remember When swaps its wording when `src === "opt2m"` (a small copy map, no logic or data changes).
- Assets move into the folders `one-photo-two-memories/videos|unblurring|grid`. The video slots are a typed list, ready for files.
