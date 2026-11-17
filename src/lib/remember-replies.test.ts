import { describe, expect, it } from "vitest";
import { visibleReplies } from "./remember-replies";

const before = { created_at: "2026-11-17T06:20:00.000Z", memory: "old" };
const after = { created_at: "2026-11-18T10:00:00.000Z", memory: "new" };

describe("visibleReplies", () => {
  it("never shows replies on untagged (04) stories", () => {
    expect(visibleReplies(null, [after])).toEqual([]);
  });
  it("hides 05 replies written before the change", () => {
    expect(visibleReplies("opt2m", [before])).toEqual([]);
  });
  it("shows 05 replies written after the change", () => {
    expect(visibleReplies("opt2m", [before, after])).toEqual([after]);
  });
});
