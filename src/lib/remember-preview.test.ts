import { describe, expect, it } from "vitest";
import { previewPathFor } from "./remember.functions";

describe("remember preview path", () => {
  it("maps a pending photo to its blurred jpg copy", () =>
    expect(previewPathFor("pending/123e4567-e89b-12d3-a456-426614174000.png")).toBe("preview/123e4567-e89b-12d3-a456-426614174000.jpg"));
});
