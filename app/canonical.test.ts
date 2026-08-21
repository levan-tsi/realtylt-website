import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE HOME PAGE MUST NAME ITS OWN CANONICAL.
 *
 * app/layout.tsx sets `alternates: { canonical: "./" }`, the ordinary self-canonical idiom, and it
 * is correct for every route except the one it is most important for. In a PRODUCTION build the
 * root page is prerendered to `index.html`, so `"./"` resolves against the pathname `/index` — and
 * `/index` 308-redirects to `/`. Production served
 * `<link rel="canonical" href="https://realtylt.com/index">` while the sitemap listed
 * `https://realtylt.com/`, so the two strongest signals the site sends about its most important
 * page disagreed, and the canonical was the one pointing at a redirect.
 *
 * DEV CANNOT SEE THIS. Dev does not prerender; the same page on :3100 renders a clean canonical.
 * That is why the check below reads the BUILT html when a build is present, and why the source
 * assertion exists at all — a test pointed at the dev server would pass for ever and prove nothing.
 */
const APP = path.resolve(__dirname);
const BUILT_HOME = path.resolve(APP, "..", ".next", "server", "app", "index.html");

describe("the home page canonical", () => {
  it("is stated explicitly in app/page.tsx rather than inherited", () => {
    // Read the metadata OBJECT, with comment lines stripped. The first version of this test matched
    // `alternates: { canonical: "./" }` inside the comment written directly above the real value
    // and failed on the fix it was written to protect. Round 35 recorded the same shape: a probe
    // that mutated its own comment instead of the thing it was aimed at.
    const src = fs.readFileSync(path.join(APP, "page.tsx"), "utf8");
    const meta = src.match(/export const metadata[^=]*=\s*\{([\s\S]*?)\n\};/);
    expect(meta, "app/page.tsx exports no metadata object").not.toBeNull();
    const code = meta![1]
      .split("\n")
      .filter((l) => !l.trim().startsWith("//"))
      .join("\n");
    const m = code.match(/alternates:\s*\{\s*canonical:\s*"([^"]*)"/);
    expect(m, "app/page.tsx must set its own alternates.canonical; the inherited \"./\" becomes /index").not.toBeNull();
    expect(m![1]).not.toBe("./");
    expect(m![1]).not.toMatch(/\/index$/);
  });

  it("does not resolve to /index in the built output", () => {
    if (!fs.existsSync(BUILT_HOME)) {
      // Deliberately not a silent skip: say which check did not run and why.
      console.warn(
        "[canonical] no .next build present, so only the source assertion ran. " +
          "Run `npm run build` (with no dev server up) to exercise the built-output check.",
      );
      return;
    }
    const html = fs.readFileSync(BUILT_HOME, "utf8");
    const m = html.match(/<link rel="canonical" href="([^"]*)"/);
    expect(m, "built home page has no canonical at all").not.toBeNull();
    expect(m![1], "the built home page canonical points at /index, which redirects to /").not.toMatch(/\/index\b/);
  });
});
