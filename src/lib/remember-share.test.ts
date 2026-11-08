import { describe, expect, it } from "vitest";
import { familyLinkHead, isPreviewBot } from "./remember-share";

describe("preview readers are not visitors", () => {
  it("treats WhatsApp as a bot", () => expect(isPreviewBot("WhatsApp/2.23.20.0 A")).toBe(true));
  it("treats Facebook's preview reader as a bot", () => expect(isPreviewBot("facebookexternalhit/1.1")).toBe(true));
  it("treats a phone browser as a visitor", () =>
    expect(isPreviewBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1")).toBe(false));
});

describe("invitation preview image", () => {
  const img = (h: ReturnType<typeof familyLinkHead>) => h.meta.find((m) => "property" in m && m.property === "og:image")?.content;
  it("uses the story's blurred photo when it has one", () =>
    expect(img(familyLinkHead("rw_abcdefghijk", { sender: "Priya", child: "Arjun", hasPreview: true }))).toBe(
      "https://capture-remember.lovable.app/api/public/remember-preview/rw_abcdefghijk.jpg",
    ));
  it("uses the Remember When image when the story has no blurred copy", () =>
    expect(img(familyLinkHead("rw_abcdefghijk", { sender: null, child: null, hasPreview: false }))).toMatch(/remember-when-share\.jpg$/));
});
