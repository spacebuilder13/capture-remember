export const SPARK_KEYS = ["born", "tiny", "funny", "when_small", "own"] as const;
export type SparkKey = (typeof SPARK_KEYS)[number];

export const SPARKS: Record<SparkKey, { title: string; starter: string }> = {
  born: { title: "The day they were born", starter: "The day you were born, Papa…" },
  tiny: { title: "A photo from when they were tiny", starter: "In this photo, you were so small…" },
  funny: { title: "Something funny they did", starter: "Do you remember when you…" },
  when_small: { title: "Something from when you were small", starter: "When I was your age…" },
  own: { title: "I will share my own memory", starter: "I remember…" },
};

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.track?.(`project.remember_${event}`, properties);
}
