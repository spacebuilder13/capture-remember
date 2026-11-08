# Remember When: story first, add email sharing, full QA

## 1. New step order
1. Pick a story to tell (animal tiles)
2. Add the photo (pick a few, choose one)
3. Tell it (type or hold to talk)
4. Tonight (story card and sharing)

The photo step's heading changes to fit the story they picked, for example "Find a photo for: A photo from when they were tiny".

## 2. Two sharing buttons on the last screen
- **First, solid pink:** "Send it on WhatsApp" (works as it does now)
- **Second, outlined:** "Send it by email". This opens the parent's own email app with the same message ready to send. They type who it goes to.
- Both show "Sent. Tell it tonight." after a tap and still let them use the other button.

## 3. What the messages say
**WhatsApp (the same as now):**
```text
I'm telling our little one this tonight: <story title>.

"<their story>"

Add what you remember: https://capture-remember.lovable.app/remember-when/<private link>
```
**Email:** subject "A story for tonight: <story title>", with the same text as the message body.

**What the person who gets it sees:** the private link opens a page with the photo, the story card and "Did anyone join in?" (Yes, someone joined in / Yes, just us two / Not yet). After they answer, they can ask someone else to share a story.

## 4. Is the journey complete?
It is complete from the ad tap through to the family check-in. Two gaps:
- The email is sent from the parent's own email app, not by MemReel. A styled MemReel email needs your sending domain first, which is still open on the roadmap.
- I can't test real WhatsApp, a real email app, or a real phone microphone here. I will check the links and message text they open with.

## 5. Visual and working QA
At phone (390), tablet (834) and desktop (1280) sizes, using real test photos:
- Ad landing, then story, then pick 3 photos and choose the 2nd, then type a story, then save
- Check both share links open the right message text
- Open the family link: the chosen photo and story show, and the check-in answer saves
- Delete the story and check the photo is gone
- Look at screenshots for text that can't be read, overlaps and poor contrast, and fix any problems found
- Remove the QA stories and the earlier unused test photo when done

## Technical details
- `index.tsx`: reorder the step state (spark comes before photo) and update the `RememberShell` step numbers; the photo step reads the chosen spark.
- `remember-ui.tsx`: add `emailLink(title, story, token)` that returns `mailto:?subject=…&body=…`, using the same `SHARE_ORIGIN`.
- New event `project.remember_email_shared`, registered in `.lovable/events.json` (version 1). The WhatsApp event stays as it is.
- No server changes.
