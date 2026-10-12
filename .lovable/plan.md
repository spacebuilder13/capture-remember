# One Story, Together: two-way loop across distance

Built from Pooja's brief (Oct 12). The aim: a distant grandparent and a child keep a shared story going without the parent running it. The ocean framing stays.

This changes one earlier rule. Until now, recordings and activity stayed in one browser. Links that work across phones need stored stories and recordings, so they move to private backend storage, governed by the privacy rules below.

## Build order (brief priority)

### 1. Return leg: Daadi hears Maya back
- After "Dodo heard you. Dodo found his roar." add "Send Maya's roar to Daadi" with a hold-to-record button (max 30 s).
- Prefilled WhatsApp message: "Maya chose the quiet cave and gave Dodo her biggest roar. What does Dodo find in the cave?" plus a reply link. The choice and child name fill in automatically.
- Grandparent reply screen: plays the roar, shows the choice, one button "Tell Maya what happens next". This is exchange two.
- Completion screen keeps "Three people finished one story" and adds the status line "Daadi has heard Maya's roar", then "Waiting for Daadi's next chapter", then the reply once it arrives.

### 2. Role-based links instead of passing the device
- "The invitation is ready" gets the main button "Send to Daadi on WhatsApp" (wa.me share with message and link). Secondary: "Grandparent is here with me" keeps the same-device flow.
- Grandparent link opens straight to "Maya has a story for you." No login.
- Microphone ask: "Tap Allow so Maya can hear your voice."
- After recording, "Give the story to Maya" sends the child link back to the parent on WhatsApp.
- Each story has one long random ID in every link; all three roles see the same story.

### 3. "Add one line of your own"
- After the story is recorded, an optional card with starters "When your Papa was small…" and "Do you know what I loved at your age…". Max 30 s.
- It plays at the end of the story on the child's screen. Tracking records whether it was added and its length.

### 4. Daadi's voice on the choice screen
- Grandparent records in two steps: the story, then the question "Should Dodo go to the noisy waterfall or the quiet cave?"
- "Where should the story go?" auto-plays the question, with "Hear Daadi ask again".
- Two large drawn picture tiles, one tap each; text labels become secondary.

### 5. Landing page offer
- Main button "Set up Daadi's first story"; "Start their story" becomes the secondary link to the demo.
- Short form: parent first name and WhatsApp, child first name and age, child's favourite thing, what the child calls the grandparent (Daadi, Nani, Ba, other), grandparent WhatsApp with country code, consent checkbox with the brief's wording.
- Thank-you screen uses the brief's wording with the chosen name filled in.
- Each submission is stored and countable, and Bhavik is notified (see open question).

### 6. Legibility fixes
- Move the orange circle right and down, clear of headline and body; use a solid navy panel where overlap remains.
- Move the yellow star off the "i" in "Daadi".
- All body text at WCAG AA (4.5:1), including "stories at bedtime".
- Check the hero at 375 px width.

## Tracking and privacy
- Remove "Download activity" from the completion screen. Keep "Start over" for interviews only (small, out of the family's path).
- One hidden row per story: step timestamps (setup, grandparent opened, recorded, child played, chose, return sent, reply recorded), own line added and length, return sent, second exchange and who started it, device type per role.
- Recordings in a private storage bucket, served only through short-lived signed links checked against the story ID.
- Unguessable IDs, no public listing. The parent can delete a story and all its recordings in one tap.
- Recordings are never used in social material.

## Technical details
- New tables: `family_stories` (story, theme, names, choice, tracking fields, separate secret tokens for grandparent/child/reply links), `story_recordings` (kind: story, question, own_line, roar, reply; duration), `story_setup_requests` (concierge form). No client grants; all access through server functions that validate the link token, with the admin client loaded inside handlers, size/type limits and simple rate limits (same pattern as Far-Away Moments).
- Private bucket `story-audio` under `<story_id>/`.
- New routes: `/one-story-together/s/$token` resolving to the grandparent, child, or reply view by token type; existing route keeps parent setup and same-device mode.
- Update AGENTS.md and the `one-story-together` memory: the browser-local rule is replaced by the private-link rule.
- QA: full loop across two browser contexts (parent and grandparent), using fake microphone audio, at 375, 834 and 1280 widths; contrast checks on the hero.

## Open question
- How should Bhavik be notified of a setup request: an email to his address (needs an email sender domain set up), or a simple private list page he checks?
