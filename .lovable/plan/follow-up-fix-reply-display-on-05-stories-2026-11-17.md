# Follow-up fix: reply display on 05 stories

## What I found
- The 05 entry saves the tag as the story's `source` field with the exact value `opt2m`. Only two stories carry it: rw_ytBgH9PtpNQ and the test story rw_OkkmDEcbyDQ. No other experiment tag value exists in the data today.
- Replies get their time from the database clock when saved (not from the browser), so `created_at` is a reliable "written after" signal.
- The reply section already checks `source === "opt2m"`. But the cutoff is 06:36 UTC today, so the two replies on rw_OkkmDEcbyDQ (06:49 and 06:55) are showing. That breaks the no-retro rule.
- The thank-you line and privacy badge use "the story has an experiment" (true or false), not the exact tag. Today that is only ever set for `opt2m`, but I will make them check the exact value too.

## Fix 1: hard cutoff, exact 05 gate
- Move the cutoff to a fixed time written in the code at release. It will be later than every reply that exists now. Before release I will check that the newest reply in the database is older than the cutoff. If it isn't, I stop and report.
- Replies render only when the story's `source` is exactly `opt2m` AND the reply's database time is on or after the cutoff. Anything else stays hidden. No backfill, no guessing.
- The family page gets a single `isOpt2m` flag (`source === "opt2m"`). The reply section, thank-you line and privacy badge all use it. Other tags and untagged stories keep their old copy and show no replies.
- No changes to link access, sign-in, storage, security rules or analytics.
- Update the tests: a reply before the new cutoff stays hidden, a reply after it shows, any non-`opt2m` tag shows nothing, and an untagged story shows nothing.

## Fix 2: delete rw_OkkmDEcbyDQ only
- Delete by its exact story id (00b71994…): its 2 replies, its photo rows, its stored photo files (main, preview, added) and then the story row. I will list the matching items first, and if anything outside this story would be touched, I stop.
- Check afterwards: there is one fewer story, and every other story, reply and photo count is the same.

## Acceptance checks (preview only, no publish)
1. All existing replies are hidden, including those on 05 stories.
2. A new reply on a fresh 05 test story shows under "The other half" with the writer's name. (The test story is deleted afterwards.)
3. A story with a non-05 tag (a temporary test story tagged `story`) shows no reply section, the original thank-you line and the "Private to you" badge. It is deleted afterwards.
4. An untagged story behaves as before.
5. The link for rw_OkkmDEcbyDQ (and its /r/ short link) shows "link does not work".
