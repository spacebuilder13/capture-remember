# Remember When: add a photo step first

## What changes
The story now starts with the parent's own photo, because the brief is about a child finding a baby photo.

- **New step 1, "Add the photo":** "Find the photo they would ask about." One large tap area opens the phone's photo library or camera. After they pick a photo, it shows as a small framed print with a "Use this photo" button and a "Pick another" link. The photo is required: they can't go on without one.
- Steps become **1 of 4**: photo, then pick a story (animal tiles), then tell it, then tonight. The bars change from 3 to 4.
- **Story card** on the tonight screen shows the photo above the quote.
- **Family link page** shows the same photo and story, so whoever opens the WhatsApp link sees what the child saw.
- **Delete my story** also deletes the photo.
- Same look as now: warm cream and pink, MemReel header, "Private to you".

## Privacy
- Photos are saved in a new private storage area. No public links. Each time a photo is shown, the page gets a short-lived private link.
- A short line on the photo step reads: "Only you and the people you send it to can see this photo."

## Rule change
The earlier "no uploads" rule for Remember When changes to "photos only, saved privately, never audio". Project notes are updated.

## Tracking
New events: photo step shown, photo picked, photo replaced, photo upload failed.

## Check
Run the whole flow at phone, tablet and desktop sizes with a real test image: pick a photo, story, typed words, save, then open the family link and check the photo there. Then delete the story and check the photo is gone.

## Technical details
- Private bucket `remember-photos` (5MB limit, images only). No client storage policies. All access goes through server functions with the admin client.
- Migration: add a nullable `photo_path text` column to `remember_stories`.
- `remember.functions.ts`:
  - `uploadRememberPhoto`: takes base64 or FormData. Checks the type (jpeg/png/webp/heic) and size, plus a rate limit. Writes to `pending/<uuid>.<ext>` and returns the path.
  - `saveRememberStory` takes a required `photoPath` (must match `pending/` and exist).
  - `getRememberStory` returns a signed URL that lasts 1 hour.
  - `deleteRememberStory` also removes the photo object.
- The client shrinks the image to a maximum of 1600px as JPEG before upload, so phone photos stay small. The upload starts on "Use this photo".
- `RememberShell` step count goes to 4. `StoryCard` takes an optional `photoUrl`. Update `$token.tsx`.
- Update AGENTS.md and the project-notes wording for the Remember When rule. Add a test for the photo-required and file-type/size rules.
