import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Round 69: the map's data credit is `fixed` at the window's bottom-left, so where it sits in the DOM moves nothing on
 * screen, but it IS the keyboard's and the screen reader's order. It sat ahead of the page's content, so a keyboard
 * visitor met the credit's line and its (i) before the hero's search, and one who reached the line inside the first
 * five seconds lost focus to the page when the line folded into the (i) (scripts/_scratch-r69/taborder.mjs, stop 30;
 * docs/parity/DESIGN-ROUND69.md §1b.5). It now comes after the content: read and reached after the home page's last
 * section, before the footer. Its z-[12] keeps it over the content's z-10 as before.
 */
const ROOT = path.resolve(import.meta.dirname, "../../..");
const ground = fs.readFileSync(path.join(ROOT, "components/home/ml/MlGround.tsx"), "utf8").replace(/\r\n/g, "\n");

describe("the map credit's place in the keyboard order", () => {
  it("comes after the page's content", () => {
    const content = ground.indexOf("<div ref={contentRef}");
    const credit = ground.indexOf("<div\n        ref={creditRef}");
    expect(content).toBeGreaterThan(-1);
    expect(credit).toBeGreaterThan(-1);
    expect(credit).toBeGreaterThan(content);
  });

  it("still stands over the content", () => {
    expect(ground).toMatch(/data-ml-credit[\s\S]{0,120}className="pointer-events-auto fixed bottom-2 left-3 z-\[12\]/);
    expect(ground).toContain('<div ref={contentRef} className={`relative z-10 ${NO_HOLE_ON_PHONE}`} style={CLEAR_STYLE}>');
  });
});
