import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { COUNTY_CONTENT } from "@/content/counties";
import { BOROUGH_CONTENT } from "@/content/boroughs";
import { getServices } from "@/lib/services";
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

  it("lists every area and every service, and no link twice", async () => {
    const dir = await getDirectory();
    const areas = dir.find((s) => s.id === "areas")!;
    const services = dir.find((s) => s.id === "services")!;
    expect(sectionCount(areas)).toBe(COUNTY_CONTENT.length + BOROUGH_CONTENT.length);
    expect(sectionCount(services)).toBe(getServices().length);

    const hrefs = (await allLinks()).map((l) => l.href);
    expect(new Set(hrefs).size, "a link appears twice on the site map").toBe(hrefs.length);
  });

  it("internal links are site-relative; only off-router destinations are external", async () => {
    for (const l of await allLinks()) {
      if (l.external) {
        // /ai (rewrite to another project), /sitemap.xml (metadata route), or a real https URL.
        expect(
          l.href === "/ai" || l.href === "/sitemap.xml" || l.href.startsWith("https://"),
          `${l.href} is marked external but is none of the known off-router shapes`,
        ).toBe(true);
      } else {
        expect(l.href.startsWith("/"), `${l.label} href ${l.href} is not site-relative`).toBe(true);
        expect(l.href.startsWith("//"), `${l.label} href ${l.href} is protocol-relative`).toBe(false);
      }
    }
  });
});
