# Remember When: WhatsApp link check + full functional and visual QA

## What I found so far
- The WhatsApp button opens `wa.me` with the story title, the story in quotes, and the private link. The format is right.
- Risk: the private link uses whatever address the page is open on. When you test from the preview, family receives a preview address, which asks them to sign in to Lovable and does not open. Only links sent from the published site work for family.
- Risk: the button is marked "Sent" the moment it is tapped, even if WhatsApp never opens.

## Plan
1. **Fix the link address:** always build the private link (and the "Ask someone to share theirs" link) on the published address `https://capture-remember.lovable.app`, so a link sent from the preview also works for family.
2. **Long stories:** keep the WhatsApp message short enough to open on every phone (story is already capped at 400 characters; check the full encoded link stays well under the limit).
3. **Functional QA (Playwright, phone 390, your size 749, desktop 1280):**
   - Open screen → pick each of the five animal tiles → type a story → save.
   - Read the WhatsApp button address, decode it, and confirm the message and private link.
   - Open that private link in a fresh browser: story shows, "Did anyone join in?" answers save, who-joined chips save, "Not yet" works, nominate link is correct, delete works, a bad link shows the error.
   - Check that every button sends its tracking event.
4. **Visual QA at the same three sizes:** screenshot every screen; look for cut-off text, overlap, weak contrast, the owl tile below the fold, quote marks and placeholder legibility, button sizes.
5. **Fix every problem found**, re-run, then share before/after screenshots in chat and clean up test stories.

## Not covered
- Opening WhatsApp itself and speaking into a real microphone cannot be tested in the test browser.
