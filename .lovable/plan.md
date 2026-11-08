# Remember When: story photo in link previews, and family can add photos

## Decisions (from your answers)
- **Who can see and add photos:** anyone holding the family link, same as today. A forwarded link gives full access. The parent can still delete the whole story, and the photos go with it.
- **Preview photo:** a blurred copy of the story's photo. The real photo shows only after the link is opened.

## 1. Story photo in the WhatsApp preview
- Each story link (`/r/...` and the family page) gets its own preview: a blurred, cropped copy of that story's photo at 1200x630, plus the title "<Name> is telling <child> a story tonight".
- The blurred copy is made when the photo is saved and kept separately. The original photo stays private.
- The preview image is served from an address with the story code in it, so only someone holding the link can request it. The original is never served there.
- The main Remember When page and other pages keep the generic preview.
- Older stories that have no blurred copy fall back to the generic preview.

## 2. Family and parent can add photos
- On the family page, a new "Add a photo" button sits under the memory box. Pick one photo, with the same size and type limits as step 2. The optional name field is used for photos too.
- On the parent's private page, the same "Add a photo" button.
- Added photos show in a small strip of framed prints under the main story photo, with "Added by Nani" under each one. The strip shows on both the family page and the parent page.
- Limit: 12 added photos per story. Photos are kept private and shown only through short-lived private links.
- "Delete my story" also deletes every added photo and blurred copy.
- New events: photo added (family or parent), photo add failed.

## Checks I will run
- The blurred preview for a story link renders correctly when a link-preview reader requests it without signing in. I will check this with a WhatsApp-style request and a public preview tester.
- A family member adds a photo. After reloading the page, it still shows on the family page and the parent page.
- Someone with a wrong or deleted code cannot view, add or load preview photos.
- The full journey still works at phone, tablet and laptop sizes: story, photo, tell, names, send, family memory, check-in, delete.
- Existing tests are run, and new tests are added for the photo limit and code checks.

## Limits I'll report
- I can't send a real WhatsApp message from here, so you need to paste a link from the published site into WhatsApp to confirm the preview. WhatsApp also stores previews for a while.
- Previews only work after you publish.

## Technical details
- New table `remember_photos` (id, story_id, path, added_by, role 'family'|'owner', created_at), with no client grants. It is reached only through server functions with the admin client. Nullable `preview_path` on `remember_stories`.
- Blurring is done on the client at save time: a canvas makes a 1200x630 copy with a heavy blur, uploaded as `preview/<uuid>.jpg`. No image libraries are needed on the server.
- The public server route `/api/public/remember-preview/$token` checks the code format, looks up the story and streams only `preview_path`. It returns 404 for anything else and is cached for a short time.
- The `$token` and `r.$token` routes get a loader that calls a public server function for the names and preview availability. `head()` sets absolute `og:image`/`twitter:image` (`summary_large_image`) using the published domain. `r.$token` returns the meta before redirecting so crawlers can read it.
- New server functions: `addRememberPhoto` (family token or owner token, rate limited, max 12) and `listRememberPhotos` (signed URLs for 1 hour). `deleteRememberStory` also removes added photos and the preview.
- Update AGENTS.md and project notes: preview uses a blurred copy only; link holders may add photos.
