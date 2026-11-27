export const SPARK_KEYS = ["born", "tiny", "funny", "when_small", "own"] as const;
export type SparkKey = (typeof SPARK_KEYS)[number];

export const SPARKS: Record<SparkKey, { title: string; starter: string }> = {
  born: { title: "The day they were born", starter: "The day you were born, Papa…" },
  tiny: { title: "A photo from when they were tiny", starter: "In this photo, you were so small…" },
  funny: { title: "Something funny they did", starter: "Do you remember when you…" },
  when_small: { title: "Something from when you were small", starter: "When I was your age…" },
  own: { title: "I will share my own memory", starter: "I remember…" },
};

export const WIF_SPARK_KEYS = ["outing", "said", "first", "other"] as const;
export type WifSparkKey = (typeof WIF_SPARK_KEYS)[number];

export const WIF_SPARKS: Record<WifSparkKey, { title: string; starters: readonly string[] }> = {
  outing: {
    title: "We went somewhere",
    starters: [
      "The first thing they did when we got there was…",
      "They refused to leave until…",
      "We laughed because…",
    ],
  },
  said: {
    title: "They said something",
    starters: [
      "They looked at me and said…",
      "Out of nowhere, they asked…",
      "I still laugh at the way they said…",
    ],
  },
  first: {
    title: "A first time",
    starters: [
      "For the first time, they…",
      "Their face when they did it was…",
      "They looked so proud when…",
    ],
  },
  other: {
    title: "Something else",
    starters: [
      "This week, out of nowhere…",
      "What I never want to forget is…",
      "We laughed because…",
    ],
  },
};

export function isValidSparkForSource(spark: string, source?: string | null): boolean {
  if (source === "wif") return (WIF_SPARK_KEYS as readonly string[]).includes(spark);
  return (SPARK_KEYS as readonly string[]).includes(spark);
}

export function sparkTitle(spark: string): string {
  if (spark in SPARKS) return SPARKS[spark as SparkKey].title;
  if (spark in WIF_SPARKS) return WIF_SPARKS[spark as WifSparkKey].title;
  return "Your story";
}
