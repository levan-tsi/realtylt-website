import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FOOTER_NAV, NAV } from "./site";

/** NO LINK TO THE AI BUSINESS IN THE HEADER OR THE FOOTER (2026-11-20).
 *
 * Until that day the header carried an "AI" item outlined in the logo-R blue (owner-directed,
 * 2026-08-28) and the footer carried "AI Services" and "RealtyLT AI". The AI business moved to
 * its own site, every address it had here became a redirect (lib/ai-business-redirects.ts), and
 * the brief keeps realtylt.com's nav and footer free of any link to the new brand. So: no item
 * points at /ai, /services or another host, Connect closes the primary nav again, and the header
 * no longer carries the accented-pill render path the AI item needed.
 */
const ROOT = path.resolve(__dirname, "..");
const header = fs.readFileSync(path.join(ROOT, "components", "site", "Header.tsx"), "utf8");
const footer = fs.readFileSync(path.join(ROOT, "components", "site", "Footer.tsx"), "utf8");

const offSite = (href: string) =>
  href === "/ai" || href.startsWith("/ai/") || href.startsWith("/ai#") || href === "/services" || href.startsWith("/services/") || /^https?:\/\//.test(href) || /excelsior/i.test(href);

describe("the header and footer carry no AI business link", () => {
  it("no primary-nav item points at the AI business, and Connect is last", () => {
    for (const i of NAV) expect(offSite(i.href), `${i.label} -> ${i.href}`).toBe(false);
    expect(NAV.map((i) => i.label)).not.toContain("AI");
    expect(NAV[NAV.length - 1].label).toBe("Connect");
  });

  it("no footer item points at the AI business", () => {
    for (const i of FOOTER_NAV) expect(offSite(i.href), `${i.label} -> ${i.href}`).toBe(false);
    expect(FOOTER_NAV.map((i) => i.label)).not.toContain("AI Services");
    expect(FOOTER_NAV.map((i) => i.label)).not.toContain("RealtyLT AI");
    // Two columns: an even count leaves no hole at the end of the grid.
    expect(FOOTER_NAV.length % 2).toBe(0);
  });

  it("the header and footer source carry no AI item render path", () => {
    expect(header).not.toMatch(/"accent" in item|border-brand-r|\/ai\b/);
    expect(footer).not.toMatch(/"external" in item|\/ai\b/);
  });
});
