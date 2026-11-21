import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import config from "@/next.config";
import {
  MOVED_FILES,
  MOVED_POST_SLUGS,
  MOVED_SERVICE_SLUGS,
  NEW_SITE,
  RETIRED_PATHS,
  aiBusinessRedirects,
  movedPagePaths,
} from "@/lib/ai-business-redirects";

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

type Redirect = { source: string; destination: string; permanent?: boolean; statusCode?: number };
const rules = async (): Promise<Redirect[]> => (await config.redirects!()) as Redirect[];
const isPermanent = (r: Redirect) => r.permanent === true || r.statusCode === 301 || r.statusCode === 308;

/** Same matching Next does, for the three shapes this config uses: an exact path, a
 * trailing `/:param*` catch-all (zero or more segments — matches the bare prefix too),
 * and a trailing `/:param+` (one or more — the bare prefix stays a real route). */
function matches(rule: Redirect, url: string): boolean {
  const catchAll = rule.source.match(/^(.*)\/:[a-zA-Z]+([*+])$/);
  if (catchAll) {
    if (url.startsWith(catchAll[1] + "/") && url.length > catchAll[1].length + 1) return true;
    return catchAll[2] === "*" && url === catchAll[1];
  }
  return rule.source === url;
}
const firstMatch = async (url: string) => (await rules()).find((r) => matches(r, url));

/** The one host a redirect may leave this site for: the AI business's own site (2026-11-20). */
const ALLOWED_HOST = "excelsiormind.com";

describe("legacy redirects — what the live site publishes must not 404 after launch", () => {
  it("every live path this site has no route for is redirected, permanently", async () => {
    const rs = await rules();
    for (const p of LIVE_PATHS_WITHOUT_A_ROUTE_HERE) {
      const hit = rs.find((r) => matches(r, p));
      expect(hit, `no redirect covers ${p}`).toBeDefined();
      // 301/308 passes the ranking signal on; a temporary redirect would not.
      expect(isPermanent(hit!), `${p} is redirected temporarily`).toBe(true);
    }
  });

  it("every destination is a route that exists here, or an address on the AI business's own site", async () => {
    const { POSTS } = await import("@/content/blog/posts");
    for (const r of await rules()) {
      if (/^https?:\/\//.test(r.destination)) {
        // Cross-domain on purpose for exactly one host, over https, and nothing else.
        const u = new URL(r.destination.replace(/:[a-zA-Z]+[*+]$/, "x"));
        expect(u.protocol, r.destination).toBe("https:");
        expect(u.host, `${r.source} leaves the site for ${u.host}`).toBe(ALLOWED_HOST);
        continue;
      }
      const dest = r.destination.replace(/\/:[a-zA-Z]+\*$/, "");
      if (dest === "/") continue;
      // The dynamic blog route: a destination there must be a real post slug.
      const post = dest.match(/^\/blog\/([^/]+)$/);
      if (post) {
        expect(POSTS.some((p) => p.slug === post[1]), `${r.destination} is not a post`).toBe(true);
        continue;
      }
      const dir = path.join(process.cwd(), "app", dest);
      expect(fs.existsSync(path.join(dir, "page.tsx")), `${r.destination} has no page.tsx`).toBe(true);
    }
    // The instrument, not the product: the dynamic import of every post is the slow part, and beside other work on the PC it crossed vitest's 5,000 ms default (rounds 21, 22 and 24; it passes alone on an idle PC). 30 s is the room it needs.
  }, 30_000);

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

/** THE AI BUSINESS MOVED OUT (2026-11-20). The services, the AI posts, their films and the /ai
 * journey live on excelsiormind.com at the same paths. Every check below reads the one data file
 * (lib/ai-business-redirects.ts) that next.config.ts serves, so the map cannot drift. */
describe("the AI business's addresses redirect to excelsiormind.com", () => {
  it("serves every rule the data file defines, in order, each a literal 301", async () => {
    const rs = await rules();
    const moved = aiBusinessRedirects();
    const start = rs.findIndex((r) => r.source === moved[0].source);
    expect(start, "the moved block is in redirects()").toBeGreaterThan(-1);
    expect(rs.slice(start, start + moved.length)).toEqual(moved);
    for (const r of moved) {
      expect(r.statusCode, r.source).toBe(301);
      expect(r.destination.startsWith(`${NEW_SITE}/`), r.destination).toBe(true);
    }
  });

  it("covers the whole map: the hub, 21 services, 20 posts, 3 older addresses, /ai, its sub-paths, 11 files", async () => {
    expect(MOVED_SERVICE_SLUGS).toHaveLength(21);
    expect(MOVED_POST_SLUGS).toHaveLength(20);
    expect(RETIRED_PATHS).toHaveLength(3);
    expect(MOVED_FILES).toHaveLength(11);
    expect(new Set([...MOVED_SERVICE_SLUGS]).size).toBe(21);
    expect(new Set([...MOVED_POST_SLUGS]).size).toBe(20);
    // 1 hub + 21 + 20 + 3 + /ai + the /ai sub-path rule + 11 files = 58 rows of the inventory's map.
    expect(movedPagePaths().length + 1 + MOVED_FILES.length).toBe(58);
  });

  it("sends each moved page to the same path on the new site, in one hop", async () => {
    for (const [from, to] of movedPagePaths()) {
      const hit = await firstMatch(from);
      expect(hit?.destination, from).toBe(`${NEW_SITE}${to}`);
      expect(hit?.statusCode, from).toBe(301);
    }
    // Same slug, same prefix, for every service and post (only the older addresses and /ai change path).
    for (const s of MOVED_SERVICE_SLUGS) expect((await firstMatch(`/services/${s}`))?.destination).toBe(`${NEW_SITE}/services/${s}`);
    for (const s of MOVED_POST_SLUGS) expect((await firstMatch(`/blog/${s}`))?.destination).toBe(`${NEW_SITE}/blog/${s}`);
    expect((await firstMatch("/services"))?.destination).toBe(`${NEW_SITE}/services`);
    expect((await firstMatch("/ai"))?.destination).toBe(`${NEW_SITE}/`);
  });

  it("sends anything deeper under /ai to the new site's root namespace", async () => {
    const hit = await firstMatch("/ai/quiz");
    expect(hit?.source).toBe("/ai/:path*");
    expect(hit?.destination).toBe(`${NEW_SITE}/:path*`);
    expect(hit?.statusCode).toBe(301);
    // /air-conditioning is not /ai.
    expect(await firstMatch("/air-conditioning")).toBeUndefined();
  });

  it("sends the moved films, posters and PDF to the same path", async () => {
    for (const f of MOVED_FILES) {
      const hit = await firstMatch(f);
      expect(hit?.destination, f).toBe(`${NEW_SITE}${f}`);
      expect(hit?.statusCode, f).toBe(301);
      // The file itself is gone from public/: the redirect is the only answer.
      expect(fs.existsSync(path.join(process.cwd(), "public", f)), `${f} still in public/`).toBe(false);
    }
  });

  /** The three older AI redirects used to point at a path here that is itself now a redirect.
   * Each goes straight to its final address instead: one hop, no chain. */
  it("re-aims the three older AI redirects in one hop to their final address", async () => {
    const finals = new Set(movedPagePaths().map(([, to]) => to));
    const froms = new Set(RETIRED_PATHS.map(([from]) => from));
    for (const [from, to] of RETIRED_PATHS) {
      const hit = await firstMatch(from);
      expect(hit?.destination, from).toBe(`${NEW_SITE}${to}`);
      expect(froms.has(to), `${to} would redirect again`).toBe(false);
      expect(finals.has(to)).toBe(true);
    }
    expect((await firstMatch("/services/ai-audit"))?.destination).toBe(`${NEW_SITE}/services/ai-readiness-assessment`);
    expect((await firstMatch("/blog/ai-audit-small-business-what-not-to-automate"))?.destination).toBe(
      `${NEW_SITE}/blog/ai-assessment-small-business-what-not-to-automate`,
    );
    expect((await firstMatch("/blog/skip-tracing-real-estate-legal-owner-phone-numbers"))?.destination).toBe(`${NEW_SITE}/blog`);
  });

  it("no local redirect lands on an address that redirects again", async () => {
    const rs = await rules();
    for (const r of rs.filter((x) => x.destination.startsWith("/"))) {
      const dest = r.destination.replace(/\/:[a-zA-Z]+[*+]$/, "");
      expect(rs.some((x) => matches(x, dest)), `${r.source} -> ${dest} chains`).toBe(false);
    }
  });

  it("catches no real-estate address: every post, alias, page and the old root namespaces stay", async () => {
    const { POSTS } = await import("@/content/blog/posts");
    const rs = await rules();
    const caught = (u: string) => rs.find((r) => matches(r, u) && r.destination.startsWith(NEW_SITE));
    for (const p of POSTS) {
      expect(caught(`/blog/${p.slug}`), `/blog/${p.slug}`).toBeUndefined();
      for (const a of p.aliases ?? []) expect(caught(`/blog/${a}`), `/blog/${a}`).toBeUndefined();
      // A post published here at a moved slug would be shadowed by the redirect (redirects run first).
      expect((MOVED_POST_SLUGS as readonly string[]).includes(p.slug), p.slug).toBe(false);
    }
    for (const page of ["/", "/blog", "/buying", "/selling", "/search", "/connect", "/financing", "/home-value", "/plan", "/top-areas", "/who-we-are", "/reviews", "/privacy-policy", "/dmca-terms", "/thank-you", "/sitemap", "/saved", "/portal"]) {
      expect(rs.find((r) => matches(r, page)), page).toBeUndefined();
    }
    // The four root namespaces the /ai proxy used to claim are neither redirected nor rewritten now.
    for (const p of ["/styles.css", "/src/main.js", "/assets/x.png", "/vendor/x.js"]) {
      expect(rs.find((r) => matches(r, p)), p).toBeUndefined();
    }
    const rewrites = (await config.rewrites!()) as { source: string }[];
    expect(rewrites.map((r) => r.source)).toEqual(["/relay-ph/static/:path*", "/relay-ph/:path*"]);
  }, 30_000);

  it("app/services is gone (a page there would sit dead behind its redirect)", () => {
    expect(fs.existsSync(path.join(process.cwd(), "app", "services"))).toBe(false);
  });
});
