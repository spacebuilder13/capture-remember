# Three fixes for experiment 05 (nothing else changes)

## What I checked first
- Stories already carry a source tag set at creation; 05 stories are tagged `opt2m`. Only one 05 story exists today: the synthetic one `rw_oSSTWm1Tdkc` (1 reply, 1 added photo), which Fix 3 deletes.
- Every other story is untagged (04). One untagged 04 test story has a reply; it stays hidden.
- No schema, storage or access-rule change is needed. No conflicts with the hard requirements, so no STOP.

## Fix 1 - show the second person's memory, 05 stories only
- The story-reading server function returns replies **only** when the story's tag is `opt2m` **and** each reply was created after a fixed cutoff time (the moment this change ships). 04 stories never receive replies, so the page cannot show them.
- On 05 story pages, show each reply's text, optional name and photos added by link holders (photos are already shown today).
- 05 confirmation after adding a reply: "Added. Anyone with this link can now see your part."
- Header badge on the 05 entry page, 05 journey and 05 story pages: "Private to people with this link". 04 keeps "Private to you". Link-holder wording elsewhere unchanged.
- Analytics: no new events, existing payloads unchanged (no text or names).

## Fix 2 - 05 socials page
- "Draft creative - under review" label on all three blocks.
- A "Run instructions" card (Before / During / After) per block, text copied exactly from the brief.
- Under Block 3: copyable link https://capture-remember.lovable.app/one-photo-two-memories, labelled as the link the campaign uses.
- Assets, captions, hooks and "Where to run it" untouched.

## Fix 3 - scoped cleanup
- Delete only `rw_oSSTWm1Tdkc`: its reply, follow-ups, added-photo rows, story row, and its files in the private photo folder (original, preview, added). Count rows before and after to confirm nothing else changed.
- After Fix 1 checks pass, delete the new synthetic check story the same way.

## Checks I will run and report
- New 05 story via the 05 entry, reply + photo from a second session, fresh session opens link: story + reply text + name + photo, no sign-in.
- New untagged 04 story with a reply: no replies shown, same copy and badge as before.
- 05 confirmation copy matches the page.
- Other stories' counts unchanged; vitest suite passes, plus a small test for the 05-only, after-cutoff reply rule.

## Technical notes
- Cutoff is a constant ISO timestamp in `remember.functions.ts`; filter `source === "opt2m"` and `created_at >= cutoff` server-side.
- Badge: `remember-ui.tsx` header takes an optional label prop; only 05 pages pass the new text.
