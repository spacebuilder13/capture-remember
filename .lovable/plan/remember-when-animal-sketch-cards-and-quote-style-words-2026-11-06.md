# Remember When: animal sketch cards and quote-style words

## 1. Story cards with crayon animals
Swap the five plain buttons for **2-column tiles**: a sketch on top, the title below. On a phone, all five fit on one screen (the fifth tile sits centred on its own row).

Each animal acts out its story, drawn in a **crayon scribble** style: thick, uneven, playful strokes in the page's ink colour, with one rough crayon fill in pink or warm yellow.
- **The day they were born:** a stork carrying a bundle.
- **A photo from when they were tiny:** a mouse holding up a little photo.
- **Something funny they did:** a monkey hanging upside down.
- **Something from when you were small:** an elephant calf walking beside its mum.
- **I will share my own memory:** an owl holding a pencil.

All five are drawn by hand in code. No AI pictures, in line with the One Story, Together rule.

Motion: the tiles fade in one after another. On tap, the animal wiggles once and the tile gets a pink border, then the next screen opens. If the phone is set to reduce motion, there is no wiggle.

## 2. Words as a quote, not a box
- Remove the bordered text box.
- The words show as a quote in the display font, with large pink opening and closing quote marks, at normal reading size.
- While you talk, the words appear inside the quote with a blinking cursor. When nothing is said yet, the quote shows the starter line in faint text, for example "The day you were born, Papa…".
- After talking, or in "Type instead", you edit the words right inside the quote. There is no visible box, only a thin underline while you type.
- The character count stays small, under the quote on the right.

## 3. Check
Screenshots at 390, 749 and 1280 wide of the tiles (before and after a tap) and of the quote (empty, typing, and filled), checking that sketches are clear, text doesn't overlap, and contrast is good. The sketches get a close-up check too.

## Technical details
- New `src/components/remember-animals.tsx`: five inline SVGs with a shared crayon filter (`feTurbulence` + `feDisplacementMap`, round caps, multiple offset strokes) plus a rough hatched fill. They use `currentColor` and the `--primary`/`--secondary` tokens only.
- `SparkCard` in `remember-ui.tsx` becomes a tile (`grid-cols-2`, `aspect-square` sketch area); add the `rw-wiggle` keyframe to `src/styles.css` with a reduced-motion override.
- `remember-when.tsx` tell stage: replace the bordered container with a `blockquote`, set the textarea to auto-grow with transparent background and no border, and keep the existing speech logic unchanged.
