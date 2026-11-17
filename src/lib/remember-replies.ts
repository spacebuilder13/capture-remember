/** Replies become visible on the family page only for 05 (opt2m) stories, and only if written after this cutoff. */
export const OPT2M_REPLIES_VISIBLE_FROM = "2026-11-17T07:00:00.000Z";

export function visibleReplies<T extends { created_at: string }>(source: string | null, replies: T[]): T[] {
  if (source !== "opt2m") return [];
  const cutoff = Date.parse(OPT2M_REPLIES_VISIBLE_FROM);
  return replies.filter((r) => Date.parse(r.created_at) >= cutoff);
}
