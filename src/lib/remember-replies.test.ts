import { describe, expect, it } from "vitest";
import { visibleReplies } from "./remember-replies";

// Newest reply that existed before the cutoff was 2026-11-17T06:55:13Z.
const before = { created_at: "2026-11-17T06:55:13.304Z", memory: "old" };
const after = { created_at: "2026-11-18T10:00:00.000Z", memory: "new" };

describe("visibleReplies", () => {
  it("never shows replies on untagged stories", () => {
    expect(visibleReplies(null, [after])).toEqual([]);
  });
  it("never shows replies on other experiment tags", () => {
    expect(visibleReplies("story", [after])).toEqual([]);
    expect(visibleReplies("feed", [after])).toEqual([]);
  });
  it("hides every reply written before the cutoff, even on 05", () => {
    expect(visibleReplies("opt2m", [before])).toEqual([]);
  });
  it("shows 05 replies written after the cutoff", () => {
    expect(visibleReplies("opt2m", [before, after])).toEqual([after]);
  });
});
