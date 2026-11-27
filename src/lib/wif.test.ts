import { describe, expect, it } from "vitest";

import { isValidSparkForSource, sparkTitle } from "./remember-sparks";
import { computePhotoAgeDays } from "./wif-photo-age";

describe("experiment 06 While It's Fresh", () => {
  it("accepts 06 moment keys only for source=wif and keeps 04/05 keys separate", () => {
    expect(isValidSparkForSource("outing", "wif")).toBe(true);
    expect(isValidSparkForSource("said", "wif")).toBe(true);
    expect(isValidSparkForSource("first", "wif")).toBe(true);
    expect(isValidSparkForSource("other", "wif")).toBe(true);
    expect(isValidSparkForSource("born", "wif")).toBe(false);

    expect(isValidSparkForSource("born", undefined)).toBe(true);
    expect(isValidSparkForSource("born", "opt2m")).toBe(true);
    expect(isValidSparkForSource("outing", undefined)).toBe(false);
    expect(isValidSparkForSource("outing", "opt2m")).toBe(false);
  });

  it("returns readable titles for both 04/05 and 06 sparks", () => {
    expect(sparkTitle("outing")).toBe("An outing");
    expect(sparkTitle("first")).toBe("A first");
    expect(sparkTitle("born")).toBe("The day they were born");
  });

  it("computes and clamps photo_age_days cleanly", () => {
    const now = Date.UTC(2026, 10, 27, 12, 0, 0);
    expect(computePhotoAgeDays(null, now)).toBeNull();
    expect(computePhotoAgeDays(0, now)).toBeNull();
    expect(computePhotoAgeDays(now - 3 * 86_400_000, now)).toBe(3);
    expect(computePhotoAgeDays(now + 2 * 86_400_000, now)).toBe(0);
    expect(computePhotoAgeDays(now - 5000 * 86_400_000, now)).toBe(3650);
  });
});