# Campaign 04: One Story, Together

## Goal
Build a research-ready MemReel micro-product and a matching motion-first campaign. The core test is whether a parent, grandparent, and child will complete one shared story together.

The experience will use clear ASD-STE100-style English: short sentences, one action per instruction, familiar words, and no vague or decorative copy.

## Product flow

### 1. Add campaign 04 to the registry
- Add **04 — One Story, Together** to `/`.
- Hypothesis: **A family will complete a shared story when each person has one small part.**
- Strong signal: all three roles complete their part in one session.
- Link to `/one-story-together` and `/one-story-together/socials`.

### 2. Build one guided, single-device handoff
The flow will feel like one continuous story, not three forms placed next to each other.

**Parent**
- Enter the child’s first name.
- Choose an age range: 3–4 or 5–7. This changes story length, not the core journey.
- Choose one of three themes: dinosaurs, space, or animals.
- Add one optional personal detail using short prompt choices or one short custom answer.
- Preview the prepared invitation and start the handoff.

**Animated handoff to the grandparent**
- A full-screen transition carries the selected story object into the next view.
- The screen clearly says who takes the device next.

**Grandparent**
- Accept the invitation.
- Read a prepared story that includes the child’s name, selected theme, and safe personal detail.
- Record the story in the browser.
- Review, replay, or record again.
- The audio stays only in the current browser session and disappears on reset or reload.

**Animated handoff to the child and parent**
- The recorded story becomes the bridge into the child view.
- The handoff tells the adult to help the child.

**Child and parent**
- Play the grandparent’s recording.
- Choose between two large, visual story paths.
- Do one playful action connected to the theme.
- The parent records the result with one quick response choice.
- Show a short celebration that makes the three completed contributions visible together.

### 3. Make it useful in research sessions
- Keep all prototype state local to the browser; do not add sign-in or a database.
- Add a discreet researcher panel that does not distract participants.
- Record key events and time stamps: parent starts and prepares, grandparent accepts and records, child listens and chooses, parent confirms the action, and family completes the loop.
- Let the researcher download a JSON activity log and reset the prototype.
- Include clear microphone permission, denied, unsupported, recording, playback, and retry states.

## Visual and motion direction
Use **bold graphic energy**: large color fields, crisp geometric scenes, playful type, rhythmic transitions, and original illustrated characters made with web graphics and animation.

- Treat the uploaded Headspace, Fabulous, and Riveo screens and the two Mobbin links as mood and motion references only. Do not copy their artwork, branding, characters, or layouts.
- Do not use AI-generated images anywhere in the product or campaign.
- Do not use stock family photography.
- Create all visual assets as original code-rendered shapes, textures, type, and characters.
- Use one animated story object as the visual thread across the parent, grandparent, and child handoffs.
- Use restrained motion for instructions and stronger motion for handoffs, choices, recording feedback, and completion.
- Respect reduced-motion settings with clear static equivalents.
- Keep controls large and readable for ages 3–7, with adult help made explicit where needed.

## Motion-first campaign assets
Build the campaign around: **Three people finish one story.**

Create original code-rendered motion pieces, not generated footage:
- One vertical social video.
- One square social video.
- Matching cover images for both videos.
- Music and sound effects, with captions and a complete sound-off reading experience.
- A concise campaign message shaped around three beats: the parent starts it, the grandparent gives it a voice, and the child completes it.

Before final rendering, show the exact campaign wording for review. After approval, render and save each final asset without overwriting earlier versions.

## Social review page
Build `/one-story-together/socials` in the same internal review pattern as the other MemReel experiments:
- Preview the vertical and square motion assets.
- Show ASD-STE100-style captions for Instagram and LinkedIn.
- Include copy controls, individual downloads, and a complete download package.
- Label drafts and approved versions clearly.

## Copy rules
- Use short subject–verb–object sentences.
- Put one instruction in each sentence.
- Prefer familiar words and concrete actions.
- Use active voice.
- Avoid idioms, abstract metaphors, long noun groups, and unclear pronouns.
- Keep warmth in the situation and outcome, not in ornate wording.
- Test every button and instruction for immediate comprehension.

## Technical approach
- Add new TanStack routes for the experience and social review page, with unique metadata.
- Build the experience as a small state machine so every role, retry, handoff, and completion state is reproducible in interviews.
- Use the browser `MediaRecorder` API for session-only audio and revoke object URLs on reset.
- Use React, CSS, and SVG/canvas animation for the original graphic system; no image-generation tools or AI image endpoints.
- Produce the motion campaign through the code-rendered motion-graphics path, with authored timing, captions, music, and effects.
- Keep campaign files in the existing campaign Files collection structure and add every saved version to campaign 04’s collection.
- Update the roadmap and the project’s architecture notes.

## Blocking quality checks
Inspect the product by eye at 390×844, 834×873, and 1280×1800, including every role, handoff, recording state, error state, child choice, and completion screen.

Inspect every rendered campaign frame and video before sharing. Reject any version with:
- cropped or overlapping text;
- weak contrast or unclear controls;
- unreadable captions;
- unexpected layout movement;
- broken or excessive animation;
- missing sound-off meaning;
- black or empty bands;
- copied or AI-generated-looking artwork;
- instructions that do not meet the plain-language rules.

Also test the complete real flow once: record audio, replay it, make a child choice, complete the family loop, download the activity log, and reset the session.
