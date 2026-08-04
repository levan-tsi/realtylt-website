import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE PORTALLED COMBOBOX POPUP.
 *
 * Round 19 found the home-page dropdown had never been clickable: the hero is `isolate
 * overflow-hidden`, so an absolutely-positioned list anchored near its bottom edge was clipped
 * by the hero AND out-painted by the scroll cue. The fix was to portal the list to <body> as
 * `position: fixed`.
 *
 * That fix is global, and it changed what "dismiss" has to mean. While the list was an in-flow
 * child being clipped, leaving it open was invisible. A fixed, portalled list at z-60 is not:
 * it floats over the whole page, including the control that focus just moved to.
 *
 * There is no jsdom in this project (vitest runs in node), so behaviour is proven in a real
 * browser by scripts/_scratch-r20-dropdown.mjs — hit-tests at 1440/390/320, scroll and resize
 * tracking, arrow keys, Escape, Tab, outside click, and JS off. These guard the two lines that
 * probe cannot see the absence of until someone deletes them.
 */

const SRC = fs.readFileSync(
  path.resolve(__dirname, "LocationSuggest.tsx"),
  "utf8",
);
/** Read only what ships — the doc comments above each handler describe the very thing being
 * matched, and a naive substring search reads the explanation as the implementation. */
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("LocationSuggest — a portalled popup has to be dismissable", () => {
  /** A keyboard visitor never produces a mousedown, so the outside-click listener alone left
   * the list on screen when Tab moved focus to the search button behind it. */
  it("closes when focus leaves the input", () => {
    expect(CODE).toMatch(/onBlur=/);
  });

  /** ...but not when focus lands INSIDE the list, or a click on an option would unmount the
   * thing being clicked before the click could land. */
  it("does not close when focus moves into the list itself", () => {
    expect(CODE).toMatch(/relatedTarget/);
    expect(CODE).toMatch(/listRef\.current\?\.contains/);
  });

  /** The list is portalled out of wrapRef, so an outside-click check that only asks about
   * wrapRef treats the mousedown starting a click on an option as an outside click. That was
   * the original bug's second half. */
  it("treats the portalled list as inside for outside-click purposes", () => {
    const handler = CODE.slice(CODE.indexOf("function onDoc"), CODE.indexOf("function pick"));
    expect(handler).toMatch(/wrapRef\.current\?\.contains/);
    expect(handler).toMatch(/listRef\.current\?\.contains/);
  });

  /** Escape is the one dismissal a combobox must have by spec. */
  it("closes on Escape", () => {
    expect(CODE).toMatch(/["']Escape["']/);
  });

  /** Selection is aria-activedescendant, which means focus never leaves the input — and the
   * options' mousedown is prevented so a mouse click cannot blur it either. If that
   * preventDefault goes, the blur handler above starts closing the list mid-click. */
  it("keeps focus on the input while an option is being clicked", () => {
    expect(CODE).toMatch(/onMouseDown=\{\(e\) => e\.preventDefault\(\)\}/);
    expect(CODE).toMatch(/aria-activedescendant/);
  });

  /** Choosing a suggestion writes the chosen label into the input, which looks identical to
   * typing it. Without a guard the query effect re-ran, fetched suggestions for the thing they
   * had just picked, and re-opened the list OVER the results — invisible on the home page,
   * because picking navigates away, and permanent on /search, where you stay. Measured on
   * production: closed at 200ms, back with 5 options at 600ms, still there at 4.6s. */
  it("does not re-open the list with suggestions for the option just picked", () => {
    expect(CODE).toMatch(/pickedRef/);
    // The flag has to be SET in pick and READ in the query effect, or it guards nothing.
    const pickFn = CODE.slice(CODE.indexOf("function pick"), CODE.indexOf("const portal"));
    expect(pickFn).toMatch(/pickedRef\.current\s*=/);
    expect(CODE).toMatch(/pickedRef\.current !== null/);
  });

  /** Clicking an empty box offers what you already searched and what you saved — the owner's
   * ask, and the behaviour his live site has. The panel must never be EMPTY though: a first-time
   * visitor focusing the box has no history, and opening a blank popup over the hero is worse
   * than opening nothing. */
  it("opens the recent/saved panel on focus, but only when there is something to show", () => {
    expect(CODE).toMatch(/onFocus=/);
    expect(CODE).toMatch(/loadHistory\(\)\.length > 0/);
  });

  /** Arrow keys must walk the list that is ON SCREEN. Keeping `items` and `history` separate but
   * navigating only `items` is how a keyboard visitor ends up arrowing through an invisible list. */
  it("navigates whichever list is visible", () => {
    expect(CODE).toMatch(/const visible = showingHistory \? history : items/);
    expect(CODE).toMatch(/pick\(visible\[active\]\)/);
    expect(CODE).not.toMatch(/pick\(items\[active\]\)/);
  });

  /** A search only reaches the panel if something records it. Both routes have to: choosing a
   * suggestion, and typing a query and pressing Enter without choosing one. */
  it("records a search both when a suggestion is picked and when one is typed", () => {
    const pickFn = CODE.slice(CODE.indexOf("function pick"), CODE.indexOf("const visible"));
    expect(pickFn).toMatch(/recordRecentSearch/);
    const keys = CODE.slice(CODE.indexOf("onKeyDown"));
    expect(keys).toMatch(/recordRecentSearch/);
  });

  /** The hero's search bar sits low on a laptop, so a popup that always opens downward runs off
   * the bottom — and being position:fixed and re-anchored on scroll, scrolling drags it along and
   * the last rows stay out of reach. It has to flip. */
  it("opens upward when there is more room above the bar, and is always bounded", () => {
    expect(CODE).toMatch(/maxHeight/);
    expect(CODE).toMatch(/below >= 220 \|\| below >= above/);
    expect(CODE).toMatch(/overflow-y-auto/);
  });

  /** Progressive enhancement: with JS off the surrounding form still submits ?q=. */
  it("is a real named input so the plain form still submits", () => {
    expect(CODE).toMatch(/name=\{name\}/);
  });
});
