import { afterEach, describe, expect, it } from "vitest";
import robots from "./robots";

const rule = (r: ReturnType<typeof robots>) => (Array.isArray(r.rules) ? r.rules[0] : r.rules!);

afterEach(() => {
  delete process.env.PRELAUNCH;
});

describe("robots.txt", () => {
  it("pre-launch blocks everything and publishes no sitemap", () => {
    process.env.PRELAUNCH = "1";
    const r = robots();
    expect(rule(r).disallow).toBe("/");
    expect(rule(r).allow).toBeUndefined();
    expect(r.sitemap).toBeUndefined();
  });

  it("after launch: crawl the site, not the API", () => {
    const r = robots();
    expect(rule(r).allow).toBe("/");
    expect(rule(r).disallow).toContain("/api/");
    expect(r.sitemap).toMatch(/\/sitemap\.xml$/);
  });

  it("does NOT block the search facets — they carry noindex,follow so listings stay reachable", () => {
    expect(rule(robots()).disallow).not.toContain("/search?");
  });
});
