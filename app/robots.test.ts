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
    expect(rule(r).allow).toContain("/");
    expect(rule(r).disallow).toContain("/api/");
    expect(r.sitemap).toMatch(/\/sitemap\.xml$/);
  });

  // Google's live test on /api/media/KEY1048465/0 read "Page cannot be crawled: Blocked by
  // robots.txt" (2026-09-20), which kept every listing photo out of Google Images and pointed
  // each listing page's JSON-LD `image` at a URL Google may not fetch. Photos are allowed by a
  // longer, more specific rule; the rest of /api/ must stay blocked.
  it("lets crawlers fetch listing photos, but nothing else under /api/", () => {
    const allow = rule(robots()).allow;
    expect(allow).toContain("/api/media/");
    for (const shut of ["/api/lead", "/api/revalidate", "/api/cron/sync-mls", "/api/idx/search"]) {
      expect(allow).not.toContain(shut);
    }
  });

  it("does NOT block the search facets — they carry noindex,follow so listings stay reachable", () => {
    expect(rule(robots()).disallow).not.toContain("/search?");
  });
});
