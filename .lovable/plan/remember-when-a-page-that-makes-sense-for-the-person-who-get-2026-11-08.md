# Remember When: a page that makes sense for the person who gets the link

## The problem
Today the parent and the family member who gets the message share one link. That link asks "Did anyone join in?", which is the parent's question. It makes no sense to a grandparent who taps the link in WhatsApp. The family member also sees "Delete my story", which is wrong for them.

## The fix: two links, two jobs

```text
Parent saves story ──> Send on WhatsApp / email ──> FAMILY LINK  (grandparent, aunt...)
        │                                              "Add what you remember"
        └──> keeps a private PARENT LINK ─────────────> "Did anyone join in?" + their replies
```

### Family link (what the WhatsApp/email message sends)
- The chosen photo and the story card, with "<Parent> is telling this tonight" at the top
- Heading: "What do you remember about this?"
- One quote-style box where they type what they remember, or hold to talk (the words show as they speak, and no audio is saved)
- An optional "Your name" field (for example "Nani")
- One button: "Add my memory"
- After sending: "Thank you. They will hear your part tonight." plus "Share a story of your own", which goes to the start of the journey
- No questions about who joined, and no Delete button

### Parent link (private to the parent)
- On the last screen, after they send, a small "Save your private link" line with a Copy button. It also goes into the parent's email if they shared by email.
- The page shows the story, then the memories family added (name and words), then the existing short "Did anyone join in?" check-in
- "Delete my story" moves here only

### Message text change
WhatsApp/email ends with: "What do you remember? Add it here: <family link>".

## Check
Phone, tablet and desktop sizes: save a story, open the family link and add a memory with a name, open the parent link and see that memory, answer the check-in, then delete. Delete the test data afterwards.

## Technical details
- Migration: add `owner_token text unique` to `remember_stories` (rw_o_ prefix, generated at save). Create a new table `remember_replies` (id, story_id, name text null max 40, memory text max 400, created_at) with no client grants, the same as the other remember tables.
- `remember.functions.ts`:
  - `saveRememberStory` returns both tokens
  - `getRememberStory(token)` returns role `family` or `owner`. Owner gets the replies.
  - `addRememberReply` checks the family token, the text length and a simple per-story limit (max 20 replies)
  - `answerRememberFollowup` and `deleteRememberStory` accept only the owner token
- Routes: the family page stays at `/remember-when/$token`, so links already sent keep working and show the family view. The parent page goes at `/remember-when/me/$token`.
- New events: `remember_reply_added`, `remember_owner_link_copied` (registered at version 1).
- Update the project notes and AGENTS.md for the two-link rule.
