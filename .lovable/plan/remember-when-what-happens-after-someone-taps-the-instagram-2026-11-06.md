# Remember When: what happens after someone taps the Instagram image

Based on Creative Test Brief 04 and Khushi's two images ("Who's that baby?") and caption. The brief tests whether parents want this, not MemReel: no uploads, no sign-up, no product features. MemReel's name appears only at the end.

## 1. Save the images
- Save the square feed image and the tall Story image unchanged as the app's own files.
- Add a "Remember When" section to the One Story, Together social page. It shows both images and Khushi's caption word for word, with copy and download buttons. Each image links to the new page, with a tag that shows which image the visitor came from.

## 2. The page after the tap (`/one-story-together/remember-when`)
Four short screens. Every screen shows possibility, never guilt.

1. **Opening.** The square image, "Who's that baby?", and the line "What's the first story your little one would ask about?" Button: "Pick a story to tell".
2. **Pick a spark.** Five large cards, one tap each: "The day they were born", "A photo from when they were tiny", "Something funny they did", "Something from when you were small", "I will share my own memory".
3. **Tell it.** A large "Hold to talk" button. The parent sees their words appear on screen as they speak, and can edit them afterwards. "Type instead" is always visible. A starter line matches the spark they picked, for example "The day you were born, Papa…". The limit is 60 seconds or 400 characters. Button: "Save my story".
4. **Tonight: this is where we ask for the email.** The heading "Tell it to them tonight." sits above their saved story. Below it: "Where should we send it, so you have it at bedtime?" with one email box and the button "Send it to me". Small links underneath: "Copy my link" and "Send it to myself on WhatsApp". After sending, the screen shows "Sent. Tell it tonight and see who joins in." and ends with "Remember When, by MemReel."

**Why the email goes here:** by this point the parent has already put in the effort and their story is on screen, so the email feels like keeping it, not signing up. Asking any earlier would come before they have anything of value. Asking any later (the next day) would lose most people. The email is useful but optional; the copy and WhatsApp options mean nobody is blocked.

## 3. The private link: what it looks like
- The email arrives the next morning with the subject "Your story about [spark], did anyone join in?" It shows their story and has one button.
- That button, the copied link and the WhatsApp link all open the same private page. At the top is their story as a card (the spark title and their words). Below it is one question, "Did anyone join in?", with three large buttons:
  - **"Yes, someone added to it"**
  - **"I told it, just me"**
  - **"Not yet"**
- One tap and they're done. If they tapped Yes, one optional row of chips appears: "Who joined?" (Partner, Grandparent, My child, Someone else). There are no other questions.
- "Not yet" shows "That's fine. Tonight works too." The link keeps working.

## 4. Pass it on
After they answer (or straight after saving, for people who skip the email): "Who else has a story like this?" Button: "Ask someone to share theirs". It opens a WhatsApp message with a friendly line and a link to the Remember When start page, tagged so we can see shares that came from a nominee.

## 5. Measuring each step
These tap events are recorded: Pick a story to tell, each spark card, Hold to talk / Type instead, Save my story, Send it to me, Copy my link, Send it to myself on WhatsApp, the three check-in answers, each Who joined chip, and Ask someone to share theirs. Page visits are recorded too, with which image they came from and whether they were nominated. Each story also stores its spark, whether it was spoken or typed, its length, and its follow-up answer. Together these cover the brief's signal ladder: click, story shared, conversation reported, passed on.

## Gaps this plan closes or flags
- **Email sending is not set up yet.** The morning email needs an email sender for MemReel's domain, which is the same blocker the earlier experiments have. Until it is connected, emails are collected and the copy and WhatsApp links work, but nothing is sent. **Decision needed: connect the domain now, or launch without the email?**
- **Live transcription only works in some browsers.** It works in Chrome, Edge and Safari. In Firefox and some in-app browsers (including Instagram's own browser on some phones), "Type instead" becomes the main option automatically.
- **No audio is saved.** Only the written words are kept, which keeps a child's voice and sensitive data out of storage.
- **Consent.** A short line under the email box: "We will only use this to send your story. No marketing." Every email has a delete link that removes the story.
- **Privacy.** Stories are never shown publicly or used in posts.
- **No guilt.** "Not yet" and skipping the email are both treated as normal, never as failure.
- **Instagram's in-app browser** may block the microphone, so the typing fallback has to be tested there.

## Technical details
- Upload both images as app files under `src/assets/one-story-together/remember-when/`.
- New tables `remember_stories` (token, spark, text, mode, length, email, source tag, nominated-by tag) and `remember_followups` (answer, who), with no client access. All access goes through server functions in `src/lib/remember.functions.ts`, which check an unguessable `rw_` token and apply rate limits, the same way the existing story links work.
- Live transcription uses the browser's Web Speech API, with feature detection and a typing fallback.
- The analytics events are named `project.remember_*` and registered in the event catalog.
- Routes: `one-story-together/remember-when.tsx` and `one-story-together/remember-when.$token.tsx`, each with its own page title and description.
- The email goes out through the app's email sending once a domain is connected; until then, emails are stored only.
- Update roadmap.md, AGENTS.md and the One Story, Together memory.
- QA: run the full flow in two separate browsers at 375, 834 and 1280 px wide, with and without speech support. Check by eye for cropping, contrast and the wording.
