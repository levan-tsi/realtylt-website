import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE COUNTY IS NOT A COSMETIC DEFAULT.
 *
 * The CMA generator defaulted its county to Dutchess and never derived it from the address the
 * /home-value fork had handed it. That is a wrong NUMBER, not a wrong label — measured on our own
 * inventory:
 *
 *   Yonkers home, county=dutchess    -> 24 comps in Beacon / Fishkill / Hyde Park, $312/sq ft
 *   Yonkers home, county=westchester -> 24 comps in Yonkers,                       $426/sq ft
 *
 * On an 1,800 sq ft home that is roughly $562,000 against $767,000, printed under a heading
 * naming the seller's own street, with a comps table quietly listing homes an hour away. Every
 * seller outside Dutchess got the wrong market unless they noticed a dropdown nobody told them
 * to check.
 *
 * There is no jsdom in this project (vitest runs in node), so behaviour was proven in a browser:
 * a signed-in Yonkers valuation now resolves to Westchester and returns 24 Yonkers comps. These
 * guard the wiring that cannot be seen to be missing until someone deletes it.
 */

const ROOT = path.resolve(__dirname, "..", "..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
/** Read only what ships: the doc comments explain the very thing being matched. */
const strip = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const GEN = strip(read("components/portal/ReportGenerator.tsx"));
const ROUTE = strip(read("app/api/reports/county/route.ts"));

describe("CMA generator — the town decides the county", () => {
  it("asks the server which county the town is in", () => {
    expect(GEN).toMatch(/\/api\/reports\/county\?town=/);
  });

  it("applies the answer to the county actually used for comps", () => {
    expect(GEN).toMatch(/setCounty\(j\.county\)/);
  });

  /** If this ever keys on something other than the town, a visitor can change their town and
   * keep the previous town's market. */
  it("re-resolves whenever the town changes", () => {
    const effect = GEN.slice(GEN.indexOf("/api/reports/county"));
    expect(effect.slice(0, 600)).toMatch(/\}, \[city\]\)/);
  });

  /** A prefilled field that cannot be seen or corrected is a guess wearing the visitor's
   * clothes. It must only ever fill an EMPTY box, and it must say where the number came from. */
  it("seeds square footage only when the field is empty, and labels it", () => {
    expect(GEN).toMatch(/if \(cur !== ""/);
    expect(read("components/portal/ReportGenerator.tsx")).toMatch(/Typical for homes near you/);
  });
});

describe("the town-facts route", () => {
  /** The comps route, asked without a subject size, ranks by lowest price — so its median is the
   * median of a town's cheapest two dozen listings (600 sq ft of Yonkers co-op), which is not
   * what "typical for homes near you" means. The median has to come from every active home in
   * the town. */
  it("takes the median over the town's rows, not over a comp set", () => {
    expect(ROUTE).toMatch(/medianSqft/);
    expect(ROUTE).toMatch(/inTown/);
    expect(ROUTE).not.toMatch(/\/api\/reports\/comps/);
  });

  /** Same guarantee as every other report route: an MLS call on a request path is how the feed
   * got burst into 429s before. */
  it("never calls MLS on a request path", () => {
    expect(ROUTE).not.toMatch(/mlsgrid|media\.mlsgrid|MLS_API_KEY/);
  });

  /** A town gains a county only when it gains a listing, so this is safe to cache and expensive
   * not to. */
  it("caches its answers", () => {
    expect(ROUTE).toMatch(/cache/);
    expect(ROUTE).toMatch(/TTL_MS/);
  });
});
