export type ThemeKey = "dinosaurs" | "space" | "animals";
export type AgeBand = "3–4" | "5–7";

export type StoryTheme = {
  label: string;
  color: string;
  softColor: string;
  character: string;
  object: string;
  title: string;
  detailChoices: string[];
  paths: [string, string];
  pathIcons: [string, string];
  action: string;
  ending: string;
  pathNext: [string, string];
};

export const THEMES: Record<ThemeKey, StoryTheme> = {
  dinosaurs: {
    label: "Dinosaurs",
    color: "var(--story-lime)",
    softColor: "var(--story-lime-soft)",
    character: "Dodo",
    object: "egg",
    title: "The dinosaur who lost his roar",
    detailChoices: ["Makes a big roar", "Stomps at breakfast", "Knows dinosaur names"],
    paths: ["the noisy waterfall", "the quiet cave"],
    pathIcons: ["≈", "◒"],
    action: "Give Dodo your biggest dinosaur roar.",
    ending: "Dodo heard you. Dodo found his roar.",
    pathNext: ["What does Dodo find at the waterfall?", "What does Dodo find in the cave?"],
  },
  space: {
    label: "Space",
    color: "var(--story-blue)",
    softColor: "var(--story-blue-soft)",
    character: "Pip",
    object: "rocket",
    title: "The moon that needed a friend",
    detailChoices: ["Counts down to launch", "Looks for the moon", "Builds box rockets"],
    paths: ["the bright moon", "the purple planet"],
    pathIcons: ["●", "✦"],
    action: "Count down from five. Then launch your rocket.",
    ending: "Pip heard you. The rocket flew into the stars.",
    pathNext: ["Who does Pip meet on the moon?", "Who does Pip meet on the purple planet?"],
  },
  animals: {
    label: "Animals",
    color: "var(--story-coral)",
    softColor: "var(--story-coral-soft)",
    character: "Bobo",
    object: "hat",
    title: "The bear who lost his hat",
    detailChoices: ["Walks like a bear", "Sleeps with a teddy", "Looks for animal tracks"],
    paths: ["the flower garden", "the secret forest"],
    pathIcons: ["✿", "♣"],
    action: "Show Bobo your best bear walk.",
    ending: "Bobo saw you. Bobo found the missing hat.",
    pathNext: ["What does Bobo find in the garden?", "What does Bobo find in the forest?"],
  },
};

export const ACTION_DONE: Record<ThemeKey, string> = {
  dinosaurs: "gave Dodo her biggest roar",
  space: "counted down and launched the rocket",
  animals: "did her best bear walk",
};

export function isTheme(v: string): v is ThemeKey {
  return v in THEMES;
}

export function storyFor(theme: StoryTheme, name: string, age: AgeBand, detail: string) {
  const extra = detail ? `${name} ${detail.toLowerCase()}.` : "";
  if (age === "3–4") {
    return `${name}, this story is for you.\n\n${theme.character} went on an adventure. ${extra}\n\n${theme.character} saw two places. One was ${theme.paths[0]}. One was ${theme.paths[1]}.`;
  }
  return `${name}, I made this story for you.\n\nOne morning, ${theme.character} found a map. The map showed two paths. ${extra}\n\nOne path led to ${theme.paths[0]}. The other path led to ${theme.paths[1]}.`;
}

export function questionFor(theme: StoryTheme) {
  const cap = (s: string) => s;
  return `Should ${theme.character} go to ${cap(theme.paths[0])} or ${cap(theme.paths[1])}?`;
}

export function deviceType() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "phone";
  return "desktop";
}

export function whatsappShare(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function blobToBase64(blob: Blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}
