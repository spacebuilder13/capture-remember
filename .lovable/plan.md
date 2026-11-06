# Remember When: what happens after someone taps the Instagram image

Based on Creative Test Brief 04 and Khushi's two images ("Who's that baby?") and caption. Following the brief, this tests whether parents want this, not MemReel: no uploads, no sign-up, no product features. MemReel's name appears only at the end.

## 1. Save the images
- Save the square feed image and the tall Story image unchanged as the app's own files.
- Add a "Remember When" section to the One Story, Together social page. It shows both images and Khushi's caption word for word, with copy and download buttons. The tap goes to the new page.

## 2. The page after the tap (`/one-story-together/remember-when`)
Short and warm. Every screen shows possibility, never guilt.

1. **Opening.** The square image with "Who's that baby?" and the line "What's the first story your little one would ask about?" Button: "Pick a story to tell".
2. **Pick a spark.** Four large cards, one tap each: "The day they were born", "A photo from when they were tiny", "Something funny they did", "Something from when you were small". Plus "Something else".
3. **Tell it.** One short box, up to 280 characters, with a starter line based on the card they picked (for example "The day you were born, Papa…"). Hold-to-record voice is offered as a second option. Button: "Save my story".
4. **Tonight.** "Tell it to them tonight. See who joins in." The parent gets a private link to keep, with "Copy my link" and "Send it to myself on WhatsApp". Last line: "Remember When, by MemReel."

## 3. Coming back with the private link
- The link opens "Did you tell it?" with three choices: "Yes, and someone joined in", "Yes, just us two", "Not yet".
- If someone joined in: chips for who joined (Mum, Papa, a grandparent, a sibling, other) and what happened (someone retold it, added something, laughed, asked a question), plus one optional short note.
- Then: "Tell another one?", which goes back to Pick a spark. This records the "comes back wanting to do it again" signal.

## 4. What gets measured (hidden)
For each story: the spark picked, whether it was typed or spoken, its length, when it was saved, whether the link was opened again, the answer, who joined, what happened, and any repeat stories. Each step maps to the brief's signal ladder (click, story shared, conversation reported, came back).

## Technical details
- Upload both images as app files under `src/assets/one-story-together/remember-when/`.
- New tables `remember_stories` and `remember_followups`, with no client access. All reads and writes go through server functions in `src/lib/remember.functions.ts`, which check an unguessable `rw_` token and apply rate limits, the same way the story-link flow works. Voice recordings go in a private bucket under `<story_id>/` and are only played back through short-lived signed links.
- Routes: `one-story-together/remember-when.tsx` and `one-story-together/remember-when.$token.tsx`, each with its own page title and description.
- Reuse the One Story, Together design and the existing recorder. Copy follows the plain-English (ASD-STE100) rules.
- Update AGENTS.md and the One Story, Together memory with the Remember When rules.
- QA: run the full flow (tap, pick, tell, open the link, report) in two separate browsers at 375, 834 and 1280 px wide. Check by eye for cropped images or text, contrast, and the wording.
