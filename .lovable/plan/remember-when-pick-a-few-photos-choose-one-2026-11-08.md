# Remember When: pick a few photos, choose one

## What changes on step 1 ("Add the photo")
- The big tap area now says "Pick a few photos" and "Up to 6 from your phone". The gallery opens with multi-select turned on.
- After picking, the photos show in a grid of small framed prints (2 across on a phone, 3 on wider screens). The first one is selected. Tapping a print selects it and shows a pink border and a check mark.
- A line above the grid asks: "Which one would they ask about?"
- "Use this photo" uploads only the selected photo. The other photos stay on the phone and are never saved.
- "Pick again" replaces the set. If they pick only one photo, the screen looks like it does now.
- The privacy line stays as it is. Same look and motion as before: the prints rise in one after another, and the selected print tilts a little.

## Tracking
- The existing "photo picked" event also records how many photos were picked.
- New event: "photo chosen", with the position of the chosen photo and the number picked.

## Check
On phone, tablet and desktop sizes: pick 3 test images, choose the second one, continue through the whole flow, and check that the family link shows the chosen photo.

## Technical details
- `<input type="file" accept="image/*" multiple>`. On the client, cap the set at 6 photos and shrink each one only when it is chosen (preview with object URLs, revoked on replace or unmount).
- No server changes. Upload still sends one photo to the private bucket.
- Register `project.remember_photo_chosen` in `.lovable/events.json`.
