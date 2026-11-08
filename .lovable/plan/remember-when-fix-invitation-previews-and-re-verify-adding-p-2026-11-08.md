# Remember When: fix invitation previews, and re-verify adding photos

## What I found (live site, checked today)
- **New stories already work in the first page response.** For a recent story (Pooja / Surya), the live full page sends the story title, the blurred story photo and a large preview card before any script runs. The blurred image loads without sign-in.
- **Older stories show the generic registry image.** Stories saved before the blurred copy existed have none. The page leaves the image empty, so hosting fills it with the experiments-registry picture. This is most likely the invitation you tested.
- **The short link (`/r/...`) is a bare redirect.** It has no preview tags of its own. Some preview readers don't follow redirects.
- **Adding photos already reports the real result.** "Photo added" and "photo failed" are only sent after the save finishes or fails, not when someone picks a file.

## Changes
1. **The short link carries its own preview.** `/r/...` sends the same title and image tags as the full page, then forwards people to it.
2. **Stories with no blurred copy** (older stories, or stories with no photo) show a Remember When image instead of the registry image. They will not show their own photo for now.
3. **No backfill.** Older photos won't be processed. If we do it later, it will be scoped to a list of stories you approve, with a record of every change so it can be undone.
4. **Caching.** I'll shorten how long our server tells readers to keep the blurred image, from 1 hour to 10 minutes. This does not control WhatsApp: it may keep its own copy of a preview for an unknown time, including after a story is deleted.
5. **No change to who can see or add photos:** anyone with the link (see Access). The wording in the app will say so plainly:
   - Last screen, near the send buttons: "Anyone you send this link to, or who it's forwarded to, can see the story and photos and add to them."
   - Family page, near "Add a photo": "Anyone with this link can see and add to this story."
   - Parent's private page: "Keep this link to yourself. It's the only way to check in or delete the story."
6. **Short link fallback.** The `/r/...` page shows a plain "Open story" link, so it still works if scripts fail to load.
7. **Crawlers don't count as visitors.** The preview fetch only reads names. It never marks a link as opened and never sends events. Today the "link opened" mark and all events run only in a browser after the page loads. I'll also skip them when the browser identifies itself as a known preview or crawler bot, such as WhatsApp, Facebook, Twitter, Slack, Telegram or Google.
8. **Cleanup** removes every test story's records (story, memories, check-ins, added photos) plus its stored original, added photos and blurred preview. That includes the earlier test story, if any is left. I'll confirm with a final query that none remain.

## If we backfill older stories later (not in this change)
- First, a dry run that only reports a count: older stories that have a photo and no preview.
- Skip any story that already has a preview. Never change or move the originals. Only add a new blurred file and link it.
- Undo: keep a list of every story changed. Rollback deletes those blurred files and clears the links.
- Admin access stays inside the server. It is never printed, saved to a file or shown in chat.
- Run only after you approve the dry-run count.

## Access (confirmed: anyone with the link)
- Each story has two secret codes: one in the family link and one in the parent's private link. The app checks the code on every request. Without the code it gives nothing, and it never lists or indexes stories. Photos are private and shown only through links that expire after an hour.
- **Intended recipients are anyone who holds the family link, including people it's forwarded to.** They can view and add photos and memories. Only the parent's private link can check in or delete.
- The only thing readable without signing in is the blurred preview, and only with the family code. The real photos are never served there. This fits the link-holder model, since a preview reader also has the link.
- No named-recipient or one-time-code check for this test.

## Deliberate limitation
- New stories get their own blurred-photo preview. Older stories with no blurred copy, and stories with no photo, show the Remember When campaign image, not their own photo.

## Checks
- **Previews:** for both link types (`/r/...` and the full family page), test a new story, an older story and a story with no photo. Fetch each with WhatsApp and Facebook crawler headers and confirm the first response has the right title and image tags, and that the image loads. After you publish, check one real WhatsApp preview by pasting a new family link into a chat.
- **Recipient photos:** using a story clearly labelled "TEST – delete me" and a placeholder photo:
  - Add a photo from the family page and from the parent's page.
  - Reopen both pages and confirm both photos show on each.
  - With a wrong code, viewing and uploading both fail, on the family and parent paths.
  - Written memories still save and show on the parent's page.
  - Then delete the test data.
- **Crawlers:** fetch the family page as WhatsApp. Confirm that the story's "link opened" mark is unchanged and no events are recorded.
- **Short link with scripts off:** the "Open story" link shows and opens the full page.
- Run the existing tests. Add tests for the wrong-code upload rejection and for bot detection.

## Still untested afterwards
- A real WhatsApp preview, until you publish and paste a link. WhatsApp may keep showing an old preview for links that were already shared.

## Technical details
- `r.$token.tsx`: replace the `beforeLoad` redirect with a loader plus `head()` that reuses `getRememberPreviewMeta`, and a client-side redirect to the full page.
- Fallback image: an absolute URL to an existing Remember When campaign asset, set only on the `$token` and `r.$token` routes when `hasPreview` is false.
- Preview route: `Cache-Control: public, max-age=600`.
- Bot guard: a small `isPreviewBot(userAgent)` helper. The family page skips `getRememberStory`'s open-mark and event tracking when it matches. The server function also checks the request user agent before setting `link_opened_at`.
- `r.$token` component: renders an `<a href="/remember-when/$token">Open story</a>` and redirects on mount.
