# Remember When: fix invitation previews for every story, and re-verify adding photos

## What I found (live site, checked today)
- **New stories already work in the first page response.** For a recent story (Pooja / Surya), the live page sends the story title, the blurred story photo and a large preview card before any script runs. The blurred image loads without sign-in.
- **Older stories show the generic registry image.** Stories saved before the blurred copy existed have none. The page leaves the image empty, so hosting fills it with the experiments-registry picture. This is most likely the invitation you tested.
- **The short link (`/r/...`) is a bare redirect.** It has no preview of its own. WhatsApp follows the redirect, but some preview readers don't.
- **Adding photos already reports the real result.** "Photo added" and "photo failed" are only sent after the save finishes or fails, not when someone picks a file.

## Changes
1. **Older stories get a blurred preview too.** I'll make a blurred 1200x630 copy of each older story's photo, in the same way as new stories, and attach it to the story. Stories with no photo at all get a Remember When image, not the registry image.
2. **The short link carries its own preview.** `/r/...` will send the same title and blurred image as the full page, then forward people to it.
3. **Caching.** The blurred image is cached for one hour, so a deleted story's preview can linger that long in WhatsApp. I'll cut this to 10 minutes. Pages are not cached, so changed names show up immediately.
4. **No change to who can see or add photos.** That stays as it is unless you choose otherwise below.

## How access works today, and the trade-off
- Each story has two secret codes: one in the family link, one in the parent's private link. The app checks the code on every request. It gives nothing without the code and never lists or indexes stories. Photos stay private and are shown only through links that expire after an hour.
- The only thing readable without signing in is the **blurred** preview, and only with the family code.
- Limitation: the code is the only check. Anyone a link is forwarded to counts as a recipient. You chose this ("link holder is enough"). A crawler-readable preview fits this model, because the crawler also has the link. If a preview had to stay limited to named people, there could be no photo preview at all, because WhatsApp can't sign in.
- A stricter option, if you want it later: the parent enters each person's phone or email, and family confirm with a one-time code before they can see or add photos. The preview would stay blurred and readable by WhatsApp.

## Checks
- Fetch the live invitation page and the short link with WhatsApp and Facebook crawler headers, for one new story and one older story. Confirm the first response has the story-specific image tags and that the image loads.
- Using a story clearly labelled "TEST – delete me" and a placeholder photo: a family member adds a photo, I reopen the page, and it is still there on both the family page and the parent's page. A wrong code can't view or add photos. Written memories still save. Then delete the test data.
- Run the existing tests.

## Still untested afterwards
- A real WhatsApp chat preview. Publish, then paste a link into a chat. WhatsApp may keep showing an older preview it has cached for an already-shared link.

## Technical details
- Backfill: a one-off sandbox script downloads each original from `remember-photos`, blurs it (PIL, matching the canvas look), uploads `preview/<uuid>.jpg` and sets `preview_path`. It goes through admin access, with no change to the schema or grants.
- `r.$token.tsx`: replace the `beforeLoad` redirect with a loader plus `head()` that reuses `getRememberPreviewMeta`, and a client-side `navigate` to the full page.
- Fallback image when there's no photo: an absolute URL to an existing Remember When campaign asset, set on the `$token` and `r.$token` routes only.
- Preview route: `Cache-Control: public, max-age=600`.
