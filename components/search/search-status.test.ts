import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE COUNT LINE HOLDS ITS SHAPE WHILE A NEW ANSWER LOADS.
 *
 * Round 53 walkthrough, measured at 390 on /search?city=Poughkeepsie: the status read
 * "288 listings found / Showing 1-50" (50px, two lines), and every filter change swapped it for
 * "Searching…" (21px) until the answer landed, so the whole card column moved up 29px and back
 * down 360ms later: two jumps per tap. The last count now stays, dimmed with the cards (which
 * already dim to opacity-60 while loading), and the region says it is busy. "Searching…" is kept
 * for the one case with no count to show yet.
 */

const SRC = fs.readFileSync(path.resolve(__dirname, "SearchClient.tsx"), "utf8");
const status = SRC.slice(SRC.indexOf('role="status"') - 400, SRC.indexOf('role="status"') + 400);

describe("/search's count line while loading", () => {
  it("keeps the last count on screen, dimmed like the cards, instead of swapping in a shorter line", () => {
    expect(status).toMatch(/state === "loading" && result \? "opacity-60" : ""/);
    expect(status).toMatch(/state === "loading" && !result \? "Searching…"/);
  });

  it("tells assistive technology the region is updating", () => {
    expect(status).toMatch(/aria-busy=\{state === "loading"\}/);
  });
});
