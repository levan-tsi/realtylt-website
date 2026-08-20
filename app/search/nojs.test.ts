import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** /search WITHOUT JAVASCRIPT.
 *
 * CLAUDE.md makes "works with JavaScript disabled" a floor. /search did not meet it and the
 * reason was structural rather than a missing fallback: `loading.tsx` wraps the route in a
 * Suspense boundary, so the page — which awaits its first page of results — is streamed. React
 * ships the body inside `<div hidden id="S:0">` and reveals it with an inline `$RC(...)` call,
 * which never runs without scripting. Measured on a production build: 50 <article> elements in
 * the DOM and 0 visible.
 *
 * The trap the fix has to avoid is the one the old code fell into: page.tsx carried a <noscript>
 * reading "The homes below are today's Hudson Valley listings", and because page.tsx is the
 * streamed part, that message was itself inside the hidden div. It was addressed to exactly the
 * readers who could never see it. Anything written for a no-JS visitor has to live in the SHELL,
 * which on this route means loading.tsx.
 *
 * A source scan, in the design-system.test.ts idiom, because the failure is invisible in every
 * ordinary browser — no test, no console error, and the page looks perfect with JS on.
 */

const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
/** Comments quote the old copy on purpose — the reasoning is the point of keeping it. Scan the
 *  code, not the prose about it, or the record of a bug reads as the bug. */
const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const LOADING = "app/search/loading.tsx";
const PAGE = "app/search/page.tsx";

describe("the no-JS path lives in the shell, not the streamed body", () => {
  it("keeps the no-JS block in loading.tsx, which is what renders without scripting", () => {
    expect(code(LOADING)).toMatch(/<noscript>/);
  });

  it("puts nothing addressed to a no-JS reader in the streamed page", () => {
    // page.tsx is inside loading.tsx's Suspense boundary, so everything it returns is streamed
    // into <div hidden> and revealed by JS. A <noscript> here can never be read.
    expect(code(PAGE)).not.toMatch(/<noscript>/);
  });

  it("no longer promises homes that are not on screen", () => {
    expect(code(PAGE)).not.toMatch(/homes below/i);
    expect(code(LOADING)).not.toMatch(/homes below/i);
  });
});

describe("the pending skeleton retires itself when it cannot be true", () => {
  it("marks the skeleton as a JavaScript-only promise", () => {
    const src = code(LOADING);
    // Stop at the <noscript>, not at its close: the block inside carries the string
    // "[data-js-only]" in its stylesheet, and a slice that swallowed it would match the STYLE
    // while the ATTRIBUTE was gone. That is exactly how this assertion first passed against a
    // skeleton with no marker on it at all.
    const skeleton = src.slice(src.indexOf("<div"), src.indexOf("<noscript>"));
    expect(skeleton).toMatch(/\sdata-js-only[\s>]/);
  });

  it("hides [data-js-only] from inside the noscript", () => {
    expect(code(LOADING)).toMatch(/\[data-js-only\]\{display:none!important\}/);
  });

  it("keeps that style a SIBLING of the skeleton, never a child of it", () => {
    // Nesting the message inside the element it hides would take the message down too — the
    // failure would look exactly like success, since the skeleton does disappear either way.
    const src = code(LOADING);
    const noscriptAt = src.indexOf("<noscript>");
    const skeletonClose = src.lastIndexOf("</div>", noscriptAt);
    expect(noscriptAt).toBeGreaterThan(skeletonClose);
  });

  it("sends a no-JS visitor to pages that work without it", () => {
    // The county pages are statically generated; driven with scripting off they serve six linked
    // homes each. Linking anywhere that needs JS would just move the dead end.
    const src = read(LOADING);
    expect(src).toMatch(/TOP_AREA_GROUPS/);
    expect(src).toMatch(/SITE\.phoneHref/);
  });
});
