import { describe, expect, it } from "vitest";
import { checkPhoto, PHOTO_PATH } from "./remember-photo";

describe("remember photo rules", () => {
  it("accepts a normal jpeg", () => expect(checkPhoto("image/jpeg", 800_000)).toBeNull());
  it("rejects non-images", () => expect(checkPhoto("application/pdf", 1000)).not.toBeNull());
  it("rejects photos over 5 MB", () => expect(checkPhoto("image/jpeg", 5 * 1024 * 1024 + 1)).not.toBeNull());
  it("requires a pending path", () => {
    expect(PHOTO_PATH.test("pending/123e4567-e89b-12d3-a456-426614174000.jpg")).toBe(true);
    expect(PHOTO_PATH.test("")).toBe(false);
    expect(PHOTO_PATH.test("../x.jpg")).toBe(false);
  });
});
