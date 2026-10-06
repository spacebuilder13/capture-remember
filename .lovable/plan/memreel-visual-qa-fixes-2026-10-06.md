# MemReel visual QA fixes

## Confirmed alerts

- The first screen duplicates “A photo can’t remember for you” and “Preserve one memory” because those words are embedded in the photograph and repeated by the page.
- The logo and “Private to you” label lose contrast over changing parts of the photograph.
- The first-screen supporting copy crosses both the pale torn-paper area and the darker photo, making contrast inconsistent.
- Small coral labels and the pale disabled button need stronger contrast for reliable readability.
- The three contribution screens have no clipping or horizontal overflow at the current 834 × 873 preview size; their structure can remain unchanged.

## Changes

1. Replace the first-screen photograph with a text-free version of the same incomplete-photograph artwork, preserving the people, torn-paper device, and composition.
2. Reposition and constrain the page-written headline, supporting copy, and call to action so they sit in one dependable contrast zone without covering faces or colliding with the torn-paper edge.
3. Give the top logo and privacy label a consistent high-contrast treatment that remains legible across the photograph.
4. Adjust only the relevant semantic color tokens and states for small labels, supporting text, borders, and disabled controls; preserve the approved warm paper, charcoal, and coral identity.
5. Check the example section, photo picker, both prompt-card screens, final review, completion state, and `/socials` for text overlap, clipping, and contrast regressions.

## Verification

- Re-run the complete three-step journey at the current preview size, a narrow mobile size, and desktop.
- Confirm no horizontal overflow, overlapping text, clipped controls, unreadable image overlays, console errors, or build errors.
- Use WCAG contrast checks for normal text and interactive controls, while keeping intentionally disabled controls visibly distinct.

## Scope

Visual QA only. The three-step flow, wording, saved data, private photo handling, and social-review functionality will not change.