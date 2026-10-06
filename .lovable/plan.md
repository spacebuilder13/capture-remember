# Memreel “Captured ≠ Remembered” experiment plan

## Goal
Test whether parents of children roughly 1–4 years old feel a meaningful gap between **having a photo** and **remembering the story around it**, then see whether they will bring forward one real memory to preserve.

The work will move through one connected journey:

```text
Hypothesis → creative directions → channel executions → small distribution test
→ example-first prototype → photo + story contribution → staged memory result by email
→ signal review → next question
```

## Guardrails
- Keep the test focused on retrieval: “The picture stayed. The story didn’t.”
- Make parents discover the gap through an attempt to remember, rather than explaining that memories fade.
- Keep the first action small and emotionally safe.
- Treat likes and generic agreement as weak signals; a real photo, memory, or story is the strongest signal.
- Do not mix in legacy, voice preservation, collaboration, or frictionless capture; those are separate hypotheses.
- Fictional examples may demonstrate the experience, but they will be clearly presented as illustrative rather than real testimonials.

## Phase 1: Ground the creative system
1. Create a reusable Memreel brand profile from the live site: coral-pink palette, warm family tone, restrained typography, privacy-first positioning, and current product imagery.
2. Translate the partner brief into one experiment sheet containing:
   - audience and tension;
   - behavioral journey from “I saved it” to “let me preserve one”;
   - supported claims and prohibited additions;
   - signal ladder and learning questions.
3. Define the shared campaign idea and keep it constant across all channels so the test measures the hypothesis, not three unrelated concepts.
4. Before producing artwork, confirm available family/photo source material, logo use, and whether executions should be clean, typographic, or mixed.

**Output:** a saved brand profile and experiment brief that every asset and prototype screen references.

## Phase 2: Develop distinct go-to-market directions
Create 2–3 genuinely different visual and interaction directions, each expressing the same hypothesis through a different retrieval mechanism:

1. **The Retrieval Test** — ask the parent to open an older photo and answer what the image cannot reveal.
2. **What Survived / What Disappeared** — contrast visible facts such as face, date, and place with missing context, jokes, and feelings.
3. **The Incomplete Photograph** — place a complete image beside visibly absent fragments of the story.

For each direction, show a rendered preview, explain what it tests, and recommend one. The selected direction becomes the visual system for the campaign and prototype.

**Checkpoint:** choose one direction before producing the full asset set.

## Phase 3: Execute the channel assets
Build channel-native executions rather than resizing one generic ad.

### Instagram
- A feed post or carousel that creates a quick retrieval attempt.
- A story treatment with one direct prompt.
- CTA variants: reply by DM or open the prototype.
- Optimize for an immediate emotional recognition and a low-effort response.

### LinkedIn
- A founder-led post with the hypothesis and one concrete retrieval prompt.
- A supporting visual that exposes the difference between capture and memory.
- CTA: share what the photo cannot answer or try the prototype.
- Keep the tone reflective and observational, not promotional.

### Blog post
- Expand the experiment into a short narrative: the assumption, retrieval moment, realization, and invitation to preserve one memory.
- Include the selected visual idea and lead naturally into the prototype.
- CTA: “Show me how to preserve a memory.”

Each execution will preserve the same audience, tension, and action while adapting pacing and participation to its channel.

**Output:** saved, reviewable visual assets and final copy sets for Instagram, LinkedIn, and the blog.

## Phase 4: Build the example-first single-page prototype
The agreed first experience is **example first**, followed by the visitor’s own attempt.

### 1. Emotional example
- Open on one carefully authored, fictional family photo story.
- Show what the image preserves, then reveal the missing context that turns it into a memory.
- Present the transformation in a compact before/after sequence, not a marketing explanation.

### 2. Invitation
- Ask: “What does one of your photos no longer tell you?”
- Offer one clear action: “Preserve one memory.”

### 3. Contribution flow
- Upload one photo.
- Prompt for a few lightweight details, one step at a time: what was happening, what they remember, and what the photo cannot show.
- Let the visitor skip anything they cannot recall; absence is part of the test.
- Preview the photo and entered story before submission.

### 4. Email delivery
- Collect an email address only after the visitor has invested in the memory.
- Send a branded app email containing or linking to the staged memory result.
- Show a clear confirmation state and avoid implying that a live AI transformation occurred.
- Verify or configure the sending domain before implementing delivery.

### 5. Staged result
- Use a deliberately authored transformation template rather than live generation.
- Combine the visitor’s photo and words into a convincing Memreel-style memory presentation.
- Keep the experience private and avoid retaining the photo beyond what the staged prototype requires.

## Phase 5: Measurement and learning
Instrument only the events needed to distinguish curiosity from behavior:

1. Channel asset viewed or engaged with.
2. Prototype opened.
3. Example completed.
4. Upload started.
5. Photo selected.
6. Story detail added.
7. Email submitted.
8. Staged memory requested and delivered.

Review results qualitatively as well as numerically:
- Where did parents hesitate or leave?
- Which prompts produced specific stories?
- Did they describe the missing layer as conversation, perspective, sequence, emotion, meaning, or something else?
- Did the example make the upload feel easier, or merely entertaining?
- Which channel produced real memories rather than passive reactions?

## Phase 6: Close the learning loop
Create a short experiment report with:
- the assets and placements used;
- responses and observed behaviors;
- anonymized examples of the memories people tried to preserve;
- what supported or challenged the hypothesis;
- the next narrow question to test.

Only after this review should we decide whether to improve the staged journey, test the upload-first alternative, or invest in a live transformation system.

## Technical details
- Replace the placeholder home page with the complete single-page journey and unique Memreel metadata.
- Preserve Memreel’s existing brand cues while giving this experiment its own focused retrieval narrative.
- Build accessible photo upload, preview, validation, progress, success, and failure states for desktop and mobile.
- Use a dedicated validated server action for the result request; never expose a general-purpose email sender.
- Add rate limiting and abuse protection to the public submission.
- Use the project’s managed app-email delivery with a fixed Memreel result template and duplicate-send protection.
- Use generated or licensed family imagery only after source rights and creative treatment are agreed.
- Save campaign briefs, visual assets, and reports together as one visible campaign collection.

## Acceptance criteria
- A visitor understands the “captured is not remembered” tension by experiencing an example.
- The path from example to photo contribution is clear and works on phone and desktop.
- A visitor can submit one photo, add memory context, provide an email, and receive the staged result.
- No unsupported claim, fabricated testimonial, or out-of-scope hypothesis appears.
- Instagram, LinkedIn, and blog executions feel native to their channels while testing the same central idea.
- The experiment captures strong behavioral signals without treating engagement metrics as proof of demand.
