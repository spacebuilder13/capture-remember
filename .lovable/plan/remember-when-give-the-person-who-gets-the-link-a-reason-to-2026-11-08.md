# Remember When: give the person who gets the link a reason to add something

## The problem
A grandparent gets "I'm telling our little one this tonight..." plus a link. They don't know who it's from, which child it's about, why they're being asked, or what happens to what they add. So they have no reason to tap or add anything.

## The fix: say who, who for, why, and what happens

### 1. Two short fields on the last screen (before the send buttons)
- "Your name" (for example, Priya)
- "Your little one's name" (for example, Arjun)
Both are one line each and filled in before sending. They are required, because the message only makes sense with them. Nothing else is added.

### 2. The new message (WhatsApp and email)
```text
Hi! It's Priya.

Arjun found this photo and keeps asking about it:
"A photo from when they were tiny"

I'm telling him the story tonight. You were part of it, so I'd love your bit too.

Add one line here, it takes a minute. I'll read it to Arjun tonight:
https://capture-remember.lovable.app/remember-when/rw_...
```
Email subject: "Arjun keeps asking about this photo".

### 3. The family page opens with the same context
- Top line: "Priya is telling Arjun this story tonight."
- Photo and story card, shown as now
- Heading: "What do you remember that Priya might not?"
- Helper line: "One line is enough. Priya will read it to Arjun tonight, in your name."
- Three small starter chips that fill in the box: "I remember when...", "The funny part was...", "What you don't know is..."
- Name field label changes to "How should Arjun know you?" (for example, Nani)
- After sending: "Thank you, Nani. Arjun will hear your part tonight."

### 4. Parent's private page
Heading shows "What Nani added" style names (already works) and uses the child's name: "Read these to Arjun tonight."

## Check
Phone, tablet and desktop sizes: fill in both names, check the WhatsApp and email text, open the family link and check the context lines and starters, add a memory, see it on the parent page, then delete everything.

## Technical details
- Migration: add nullable `sender_name text` and `child_name text` to `remember_stories`. Links already sent fall back to "Someone in your family" / "your little one".
- `saveRememberStory` stays as it is. New `setRememberNames(ownerToken, senderName, childName)` (trim, 1 to 40 characters) is called when they tap a send button. The send links are built after the names are saved.
- `getRememberStory` and `getRememberOwnerStory` return both names.
- `familyLink`/`emailLink` take the names. Pronouns stay neutral ("tell them") to avoid guessing he or she. The example above is shown with "him" for readability only.
- The send buttons stay disabled until both names are filled in.
