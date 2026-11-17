# Experiment 05: One Photo, Two Memories

Reuses Remember When (04) as is. Adds a fifth registry card, a stable entry link, a tag that follows 05 visitors through the whole journey, and a socials page with video placeholders.

## What already exists (checked)
- Remember When already saves where a story came from: `?src=` on its first screen is stored with the story. 05 reuses this with the tag `opt2m`.
- Family links already let anyone holding them view, add memories and add photos with no sign-in, and say so in plain words near the link.
- Preview crawlers (WhatsApp and others) are already kept from counting as opens.
- 04's events are not tagged per experiment after the first screen, so the family-side steps need new 05-only events (below). 04's events stay unchanged.

## What gets built
1. **Card 05** on the home page, same layout: Prototype, "One Photo, Two Memories", the given hypothesis and strong signal, both buttons.
2. **Stable entry** `/one-photo-two-memories` sends people to `/remember-when?src=opt2m`. This is the link for the Instagram campaign (option 3).
3. **05 tracking, end to end** — extra events fired only for stories tagged `opt2m`, alongside (never replacing) 04's events:
   - `project.opt2m_entry` (first screen opened)
   - `project.opt2m_invite_created` (story saved)
   - `project.opt2m_invite_shared` (WhatsApp or email)
   - `project.opt2m_invite_opened` (family link opened, real people only)
   - `project.opt2m_contribution_saved` (memory or photo added by family)
   Properties carry only the tag, a channel/kind word, and the story's internal record id. No text, names, photos or numbers.
4. **Socials page** `/one-photo-two-memories/socials` titled "One Photo, Two Memories - creatives", with the line about creatives and run instructions being added one at a time, the 8 uploaded creative images, and labelled video placeholders ("Video coming soon") ready for your files.

## Not touched
No new tables, no migrations, no backfill, no changes to 04's data, events, links or security. No publishing.

## Checks before reporting
Five cards, 01-04 links still open; 05 entry reaches the flow; full journey in two separate browsers plus a third "forwarded" browser with no sign-in; 05 events fire with the tag and 04 events fire as before; crawler visit does not mark the link opened; preview tags still present. Delete only the test stories created, by their ids. Real WhatsApp preview and Instagram traffic stay untested until you check after publishing.

## Technical details
- Family-link loader (`getRememberStory`) returns an `experiment` flag derived from the stored `source` (read only) so the family page knows to fire 05 events; no schema change.
- New events registered in the events catalog; existing entries unchanged.
- Creative images stored as Lovable assets; video slots are typed placeholders to swap later.
