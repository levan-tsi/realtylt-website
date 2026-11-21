import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { COUNTY_CONTENT } from "@/content/counties";
import { BOROUGH_CONTENT } from "@/content/boroughs";
import { movedPagePaths } from "@/lib/ai-business-redirects";
import { getDirectory, sectionCount } from "./directory";

/** THE TWO MAPS MUST AGREE.
 *
 * /sitemap (this page, for people) and /sitemap.xml (app/sitemap.ts, for crawlers) are built
 * from the same sources on purpose. This holds them together: an evergreen URL added to the
 * XML without appearing on the page — or a page link whose shape no route answers — is the
 * drift this file exists to catch.
 */

const allLinks = async () => (await getDirectory()).flatMap((s) => s.groups.flatMap((g) => g.links));

describe("the human site map vs the crawler sitemap", () => {
  it("every evergreen URL in sitemap.xml appears on the page", async () => {
    const hrefs = new Set((await allLinks()).map((l) => l.href));
    const xmlPaths = (await sitemap())
      .map((e) => new URL(e.url).pathname)
      // Listings rotate with the feed (fixture mode publishes them; live mode does not) —
      // the page deliberately maps only the evergreen territory. /sitemap is the page
      // itself; an index does not list itself.
      .filter((p) => !p.startsWith("/homes-for-sale/") && !p.startsWith("/listing/") && p !== "/sitemap");
    for (const p of xmlPaths) {
      expect(hrefs.has(p), `sitemap.xml publishes ${p} but the site map page does not list it`).toBe(true);
    }
  });

  it("lists every area, and no link twice", async () => {
    const dir = await getDirectory();
    const areas = dir.find((s) => s.id === "areas")!;
    expect(sectionCount(areas)).toBe(COUNTY_CONTENT.length + BOROUGH_CONTENT.length);

    const hrefs = (await allLinks()).map((l) => l.href);
    expect(new Set(hrefs).size, "a link appears twice on the site map").toBe(hrefs.length);
  });

  /** The AI business moved to its own site on 2026-11-20 and every address it had here is a
   * redirect (lib/ai-business-redirects.ts). Neither map may list one: a crawler would read a
   * redirect as a page we claim. */
  it("lists none of the moved AI addresses", async () => {
    const dir = await getDirectory();
    expect(dir.map((s) => s.id)).toEqual(["pages", "areas", "blog", "legal"]);
    for (const l of await allLinks()) {
      expect(l.href === "/ai" || l.href.startsWith("/ai/") || l.href.startsWith("/ai#"), l.href).toBe(false);
      expect(l.href === "/services" || l.href.startsWith("/services/"), l.href).toBe(false);
      expect(l.href, l.label).not.toMatch(/excelsior/i);
    }
    const moved = new Set(movedPagePaths().map(([from]) => from));
    for (const e of await sitemap()) {
      const p = new URL(e.url).pathname;
      expect(moved.has(p), `sitemap.xml still publishes ${p}`).toBe(false);
      expect(p.startsWith("/services") || p === "/ai" || p.startsWith("/ai/"), p).toBe(false);
    }
  });

  it("internal links are site-relative; only off-router destinations are external", async () => {
    for (const l of await allLinks()) {
      if (l.external) {
        // /sitemap.xml (metadata route) or a real https URL (the NY DOS notice).
        expect(
          l.href === "/sitemap.xml" || l.href.startsWith("https://"),
          `${l.href} is marked external but is none of the known off-router shapes`,
        ).toBe(true);
      } else {
        expect(l.href.startsWith("/"), `${l.label} href ${l.href} is not site-relative`).toBe(true);
        expect(l.href.startsWith("//"), `${l.label} href ${l.href} is protocol-relative`).toBe(false);
      }
    }
  });
});
