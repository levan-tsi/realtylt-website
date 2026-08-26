import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import config from "@/next.config";

/** The launch swings realtylt.com's apex at this deployment, so every path the LIVE site
 * publishes becomes ours. These are the ones it publishes that this site has no route for —
 * read off the live footer and its HTML sitemap on 2026-07-31. Each must land somewhere real
 * or launch day turns it into a 404. */
const LIVE_PATHS_WITHOUT_A_ROUTE_HERE = [
  "/index",
  "/top_areas",
  "/home_value",
  "/realestateagent/search",
  "/privacy_policy",
  "/tos",
  "/myportal",
  "/myportal/searches",
  "/myportal/collections",
  "/myportal/profile",
  "/myportal/reports",
  // Bare /sitemap is deliberately NOT here since round 41: app/sitemap/page.tsx answers it.
  "/sitemap/NY",
  "/sitemap/NY/Dutchess-County-County/City/Beacon/Listings/Page/1",
];

type Redirect = { source: string; destination: string; permanent?: boolean };
const rules = async (): Promise<Redirect[]> => (await config.redirects!()) as Redirect[];

/** Same matching Next does, for the three shapes this config uses: an exact path, a
 * trailing `/:param*` catch-all (zero or more segments — matches the bare prefix too),
 * and a trailing `/:param+` (one or more — the bare prefix stays a real route). */
function matches(rule: Redirect, url: string): boolean {
  const catchAll = rule.source.match(/^(.*)\/:[a-zA-Z]+([*+])$/);
  if (catchAll) {
    if (url.startsWith(catchAll[1] + "/")) return true;
    return catchAll[2] === "*" && url === catchAll[1];
  }
  return rule.source === url;
}

describe("legacy redirects — what the live site publishes must not 404 after launch", () => {
  it("every live path this site has no route for is redirected, permanently", async () => {
    const rs = await rules();
    for (const p of LIVE_PATHS_WITHOUT_A_ROUTE_HERE) {
      const hit = rs.find((r) => matches(r, p));
      expect(hit, `no redirect covers ${p}`).toBeDefined();
      // 301/308 passes the ranking signal on; a temporary redirect would not.
      expect(hit!.permanent, `${p} is redirected temporarily`).toBe(true);
    }
  });

  it("every destination is a route that exists (a rename would break the redirect silently)", async () => {
    for (const r of await rules()) {
      const dest = r.destination.replace(/\/:[a-zA-Z]+\*$/, "");
      if (dest === "/") continue;
      const dir = path.join(process.cwd(), "app", dest);
      expect(fs.existsSync(path.join(dir, "page.tsx")), `${r.destination} has no page.tsx`).toBe(true);
    }
  });

  it("the generated /sitemap.xml is NOT swallowed by the /sitemap redirects", async () => {
    const rs = await rules();
    expect(rs.some((r) => matches(r, "/sitemap.xml"))).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), "app", "sitemap.ts"))).toBe(true);
  });

  it("bare /sitemap is OURS (round 41): the HTML site map page, not a redirect", async () => {
    // Redirects run before the filesystem, so a rule matching the bare path — including a
    // `/:param*` catch-all, which matches zero segments — would silently swallow the page.
    const rs = await rules();
    expect(rs.some((r) => matches(r, "/sitemap"))).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), "app", "sitemap", "page.tsx"))).toBe(true);
    // The vendor's deep tree beneath it still redirects.
    expect(rs.some((r) => matches(r, "/sitemap/NY"))).toBe(true);
  });
});
