import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SITE } from "@/lib/site";

/** A LISTING PAGE WITHOUT JAVASCRIPT (round 67).
 *
 * CLAUDE.md makes "works with JavaScript disabled" a floor. With scripting off a listing page
 * showed about eighteen controls that did nothing: the tour and offer buttons and the desktop tour
 * card (each opens a sheet that posts with fetch), the photo viewer's triggers (the lightbox is a
 * client feature), the sub-nav's offer button (it dispatches a window event), Share (the browser's
 * share sheet) and Save (the account or the device record). The site's rule for that already
 * existed: globals.css hides `[data-js-only]` under `@media (scripting: none)`, as the header's
 * folded menu and the blog's page pill do. Each of those controls now carries it, and the tour and
 * offer pair hands the reader the path that does work without scripting: a call, or the booking
 * page.
 *
 * A source scan, in the idiom of app/search/nojs.test.ts, because the failure is invisible in
 * every ordinary browser: no console error, and the page is perfect with JS on.
 */

const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
/** Scan the code, not the prose about it (block and line comments quote control names). */
const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** The opening tag of the nearest `<tag` at or before `marker`: from `<tag` to the `>` that closes
 *  it (an arrow function's `=>` is not a close). */
function openTagBefore(src: string, marker: string, tag: string): string {
  const at = src.indexOf(marker);
  expect(at, `marker ${marker}`).toBeGreaterThan(-1);
  const start = src.lastIndexOf(`<${tag}`, at);
  expect(start, `<${tag} before ${marker}`).toBeGreaterThan(-1);
  let end = start;
  for (;;) {
    end = src.indexOf(">", end + 1);
    if (end === -1 || src[end - 1] !== "=") break;
  }
  return src.slice(start, end + 1);
}

const JS_ONLY = /\sdata-js-only=""/;

const CTAS = "components/leads/ListingLeadCTAs.tsx";
const PHOTOS = "components/idx/ListingPhotos.tsx";
const SUBNAV = "components/listing/ListingSubNav.tsx";

describe("the rule itself", () => {
  it("globals.css still hides [data-js-only] when scripting is off", () => {
    expect(read("app/globals.css")).toMatch(
      /@media \(scripting: none\) \{\s*\[data-js-only\] \{\s*display: none !important;/,
    );
  });
});

describe("the tour and offer controls step aside, and a plain path takes their place", () => {
  const src = code(CTAS);

  it("marks the phone's tour and offer pair", () => {
    expect(openTagBefore(src, "onClick={() => openTour()}", "div")).toMatch(JS_ONLY);
  });

  it("marks the desktop block: the tour card (tabs, day strip, arrows, tour button) and its offer button", () => {
    expect(openTagBefore(src, "<InlineTourCard", "div")).toMatch(JS_ONLY);
  });

  it("renders ONE noscript block, outside every marked container", () => {
    expect(src.match(/<noscript>/g)).toHaveLength(1);
    // A sibling, never a child: inside a data-js-only box it would be hidden with the controls.
    const desktopOpen = src.indexOf("<InlineTourCard");
    const desktopClose = src.indexOf("</div>", desktopOpen);
    expect(src.indexOf("<noscript>")).toBeGreaterThan(desktopClose);
  });

  const block = src.slice(src.indexOf("<noscript>"), src.indexOf("</noscript>"));

  it("carries a tel: link that shows the number", () => {
    // The main number, as everywhere off /connect (lib/site.ts, the owner's order of 2026-09-24).
    expect(block).toContain("href={SITE.phoneHref}");
    expect(SITE.phoneHref.startsWith("tel:")).toBe(true);
    expect(block).toContain("{SITE.phone}");
  });

  it("carries the booking page link", () => {
    expect(block).toMatch(/href="\/connect"/);
  });

  it("speaks in the site's voice: no em dash, no arrow glyph", () => {
    expect(block.length).toBeGreaterThan(0);
    expect(block).not.toMatch(/—|&mdash;/);
    expect(block).not.toMatch(/[→›»]|&rarr;|&raquo;/);
  });
});

describe("the photo viewer's triggers step aside; the photos stay", () => {
  const src = code(PHOTOS);

  it("marks the whole-tile trigger", () => {
    expect(openTagBefore(src, "aria-label={`Open the photo viewer for", "button")).toMatch(JS_ONLY);
  });

  it("marks both carousel arrows", () => {
    expect(openTagBefore(src, 'aria-label="Previous photo"', "button")).toMatch(JS_ONLY);
    expect(openTagBefore(src, 'aria-label="Next photo"', "button")).toMatch(JS_ONLY);
  });

  it("marks the view-mode group (photos, street view, map view) as one container", () => {
    expect(openTagBefore(src, 'data-lightbox-tab="photos"', "div")).toMatch(JS_ONLY);
  });

  it("marks the show-all button", () => {
    expect(openTagBefore(src, "absolute bottom-3 right-3", "button")).toMatch(JS_ONLY);
  });

  it("marks the side tiles' full-screen buttons, not the tiles", () => {
    const marker = "aria-label={`View photo ${available.indexOf(src) + 1} full screen`}";
    expect(openTagBefore(src, marker, "button")).toMatch(JS_ONLY);
    expect(openTagBefore(src, "{tile(src, `${addressShort}, photo", "div")).not.toMatch(JS_ONLY);
  });

  it("never marks the <details> grid: it is the no-JS gallery", () => {
    const grid = src.slice(src.indexOf("<details"), src.indexOf("</details>"));
    expect(grid.length).toBeGreaterThan(0);
    expect(grid).not.toMatch(/data-js-only/);
  });
});

describe("the sub-nav's actions step aside; its anchors stay", () => {
  const src = code(SUBNAV);

  it("marks the actions group (offer, Share, Save)", () => {
    expect(openTagBefore(src, "listing:make-offer", "div")).toMatch(JS_ONLY);
  });

  it("folds the bar away on a phone without scripting, where the actions were all it held", () => {
    expect(openTagBefore(src, 'aria-label="On this page"', "nav")).toMatch(/\snoscript:max-md:hidden[\s"]/);
  });

  it("keeps the On this page anchors, which are real links", () => {
    const list = src.slice(src.indexOf("<ul"), src.indexOf("</ul>"));
    expect(list).toMatch(/href=\{`#\$\{a\.id\}`\}/);
    expect(list).not.toMatch(/data-js-only/);
  });
});

describe("Share and Save step aside wherever they appear", () => {
  it.each(["components/idx/ShareButton.tsx", "components/idx/FavoriteButton.tsx"])("%s", (file) => {
    const src = code(file);
    expect(openTagBefore(src, 'type="button"', "button")).toMatch(JS_ONLY);
  });
});

/** Round 67, the orchestrator's follow-ups to the builder's pass: the lead form (every surface), the
 * listing photos, and the card arrows. */
describe("the lead form steps aside without scripting, and a plain path stands in its place", () => {
  const src = code("components/leads/LeadForm.tsx");
  it("marks the form (a no-script submit was a GET that put the visitor's details in the URL)", () => {
    expect(openTagBefore(src, "onSubmit={onSubmit}", "form")).toMatch(JS_ONLY);
  });
  const block = src.slice(src.indexOf("<noscript>"), src.indexOf("</noscript>"));
  it("offers the phone and the email, in the site's voice", () => {
    expect(block).toMatch(/href=\{SITE\.phoneHref\}/);
    expect(block).toMatch(/mailto:\$\{SITE\.email\}/);
    expect(block).not.toMatch(/—|→/);
  });
});

describe("a listing photo shows without scripting", () => {
  it("MlsImage marks its image, which only reveals itself in onLoad", () => {
    expect(openTagBefore(code("components/idx/MlsImage.tsx"), "key={bustedSrc}", "Image")).toMatch(/\sdata-mls-img=""/);
  });
  it("globals.css lifts it to opacity 1 when scripting is off", () => {
    const css = read("app/globals.css");
    const block = css.slice(css.indexOf("@media (scripting: none) {"), css.indexOf("@media (scripting: none) and"));
    expect(block).toMatch(/\[data-mls-img\]\s*\{\s*opacity:\s*1\s*!important;?\s*\}/);
  });
});

describe("a card's photo arrows step aside without scripting", () => {
  const src = code("components/idx/CardPhotos.tsx");
  it.each(["Previous photo", "Next photo"])("%s", (label) => {
    expect(openTagBefore(src, `aria-label="${label}"`, "button")).toMatch(JS_ONLY);
  });
});

/** Round 68: the three controls round 67 left doing nothing without scripting. */
describe("the closed photo grid's tiles are buttons only once hydrated", () => {
  const src = code(PHOTOS);
  const tile = openTagBefore(src, "aria-label={hydrated ? `View photo ${i + 2} of ${count} full screen`", "div");
  it("gates the role, the tab stop and the label on hydration (the grid stays the plain photo list)", () => {
    expect(tile).toMatch(/role=\{hydrated \? "button" : undefined\}/);
    expect(tile).toMatch(/tabIndex=\{hydrated \? 0 : undefined\}/);
    expect(tile).not.toMatch(/data-js-only/);
  });
});

describe("the header's top-areas caret steps aside (its flyout only opens by state)", () => {
  it("marks the desktop caret, not the Top areas link beside it", () => {
    const src = code("components/site/Header.tsx");
    expect(openTagBefore(src, 'aria-controls="top-areas-flyout"', "button")).toMatch(JS_ONLY);
    expect(openTagBefore(src, 'aria-controls="top-areas-flyout"', "Link")).not.toMatch(JS_ONLY);
  });
});

describe("the mortgage calculator's buttons step aside; the example and the fields stay", () => {
  const src = code("components/financing/MortgageCalculator.tsx");
  it("marks Reset and the representative-rate rows (as one block with their heading)", () => {
    expect(openTagBefore(src, "onClick={() => setValues(seeded)}", "button")).toMatch(JS_ONLY);
    expect(openTagBefore(src, "Representative rates</p>", "div")).toMatch(JS_ONLY);
  });
  it("says what the reader is looking at, with the number, in the site's voice", () => {
    const block = src.slice(src.indexOf("<noscript>"), src.indexOf("</noscript>"));
    expect(block).toContain("href={SITE.phoneHref}");
    expect(block).toContain("{SITE.phone}");
    expect(block).not.toMatch(/—|→/);
  });
});
