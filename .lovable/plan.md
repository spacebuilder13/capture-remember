# Remove launch warning and add store links (While It's Fresh creatives page)

## What changes
1. Remove the "Do not launch yet" warning from Creative 1 ("Mihir at the park"). The reel's App Store / Google Play end card is correct, since MemReel is live in both stores.
2. Add two buttons at the top of the creatives page, next to "Open original-quality folder" and "Open experience":
   - "App Store" → https://apps.apple.com/us/app/memreel-private-family-album/id6447718982
   - "Google Play" → https://play.google.com/store/apps/details?id=io.memreel.memreel
   Both open in a new tab.
3. Update the Creative 1 platform note and the run instructions where they mention the end-card swap, so they say the reel can run as-is and the store links are the destination.

The While It's Fresh experience itself does not change.

## Technical details
- `src/lib/wif-creatives.ts`: delete `launchWarning` from Creative 1, add `WIF_APP_STORE_URL` and `WIF_PLAY_STORE_URL`, and edit any wording about the end card in `platformNote` / `WIF_RUN_STEPS`.
- `src/routes/while-its-fresh/socials.tsx`: remove the warning block and the `AlertTriangle` import, and add two outline `Button asChild` external links.
- Check: open `/while-its-fresh/socials` at phone and laptop sizes. Confirm the warning is gone, both buttons have the right links, and the buttons wrap cleanly. Then read the build log.
