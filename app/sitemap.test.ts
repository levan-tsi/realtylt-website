import { describe, expect, it } from "vitest";
import { postLastModified } from "./sitemap";

// Round 32 (2026-11-16): the sitemap told Google the assessment post had not changed since its first date (2026-08-26) after two
// rewrites, so Google had no reason to fetch it again. A post's last change is its `updated` date when it has one.
describe("the sitemap's last-modified date for a post", () => {
  it("is the day the post was last updated, when it has one", () => {
    expect(postLastModified({ date: "2026-08-26", updated: "2026-11-16" }).toISOString().slice(0, 10)).toBe("2026-11-16");
  });
  it("is the post's first date when it was never revised", () => {
    expect(postLastModified({ date: "2026-08-26" }).toISOString().slice(0, 10)).toBe("2026-08-26");
  });
});
