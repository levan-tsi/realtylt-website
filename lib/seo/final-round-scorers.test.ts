import { describe, expect, it } from "vitest";
// Plain .mjs scorers (allowJs infers their types): the functions under test are pure, html in, data out.
import { compare, invariantsOf } from "../../scripts/rewrite-invariants.mjs";
import { parsePage } from "../../scripts/seo-audit.mjs";

/** THE FINAL ROUND'S SCORERS HAVE TO BE RIGHT BEFORE THE PAGES ARE.
 *
 * Two scripts decide whether the 10-year-old pass and the SEO lap are done
 * (scripts/rewrite-invariants.mjs, scripts/seo-audit.mjs). Instrument errors outnumber product
 * errors on this project, so the parts of them that are pure logic are pinned here: each test
 * is a way the scorer could have lied. */

const page = (main: string, head = "") => `<html><head>${head}</head><body><main>${main}</main></body></html>`;

describe("rewrite-invariants: what a simplification must not lose", () => {
  const before = invariantsOf(
    `<main><h2>Paid is three different days</h2>
     <p>The report records 859,532 complaints and $16.6 billion. The cap is $6,725 on one day.</p>
     <p>The statute says "no person shall give and no person shall accept any fee" in those words.</p>
     <blockquote>Congress named your trade specifically.</blockquote>
     <p>See <a href="https://www.law.cornell.edu/uscode/text/12/2607">12 U.S.C. 2607</a>.</p>
     <time dateTime="2026-08-27">August 27, 2026</time><span>12 min read</span></main>`,
  );

  it("passes a rewrite that keeps every ledger and only moves the date", () => {
    const after = invariantsOf(
      `<main><h2>Paid is three different days</h2>
       <p>The report records 859,532 complaints. It records $16.6 billion in losses.</p>
       <p>The cap is $6,725 on one day.</p>
       <p>The law says "no person shall give and no person shall accept any fee" in those words.</p>
       <blockquote>Congress named your trade specifically.</blockquote>
       <p>Read <a href="https://www.law.cornell.edu/uscode/text/12/2607">12 U.S.C. 2607</a>.</p>
       <time dateTime="2026-09-18">September 18, 2026</time><span>14 min read</span></main>`,
    );
    expect(compare(before, after)).toEqual([]);
  });

  it("catches a lost number, an invented number, a bent quote and a lost link", () => {
    const after = invariantsOf(
      `<main><h2>Paid is three different days</h2>
       <p>The report records about 860,000 complaints and $16.6 billion. The cap is $6,725.</p>
       <p>The law says "nobody shall give and nobody shall accept any fee" in those words.</p>
       <blockquote>Congress named your trade specifically.</blockquote><p>See 12 U.S.C. 2607.</p></main>`,
    );
    const v = compare(before, after).join("\n");
    expect(v).toContain("number LOST: 859,532");
    expect(v).toContain("number ADDED: 860,000");
    expect(v).toContain("quote BENT or LOST");
    expect(v).toContain("link LOST: https://www.law.cornell.edu/uscode/text/12/2607");
  });

  it("catches a changed heading, an em dash and a page that shrank", () => {
    const after = invariantsOf(`<main><h2>Getting paid takes three days</h2><p>Short — too short.</p></main>`);
    const v = compare(before, after, { "numbers-": before.numbers, "links-": before.links, "quotes-": before.quotes }).join("\n");
    expect(v).toContain("heading LOST/CHANGED: Paid is three different days");
    expect(v).toContain("em dashes: 1");
    expect(v).toMatch(/length ratio 0\.\d+ outside/);
  });

  it("an allow entry excuses exactly the item it names and nothing else", () => {
    const after = invariantsOf(before.text.replace("859,532", "").replace(/^/, "<main><h2>Paid is three different days</h2><p>") + "</p></main>");
    const v = compare({ ...before, links: [], quotes: [] }, after, { "numbers-": ["859,532"] });
    expect(v.filter((x: string) => x.startsWith("number"))).toEqual([]);
  });
});

describe("seo-audit: what a crawler that runs no JavaScript can read", () => {
  it("an aria-label is not anchor text; text, img alt and title are", () => {
    const d = parsePage(
      page(
        `<a class="absolute inset-0" aria-label="A post title" href="/blog/a"></a>
         <a href="/blog/b"><span class="sr-only">A post title</span></a>
         <a href="/blog/c"><img alt="A cover" src="/x.jpg"></a>
         <a href="/blog/d" title="A titled link"></a>`,
      ),
    );
    const anchor = (l: { text: string; alt: string; title: string }) => (l.text || l.alt || l.title).trim();
    expect(d.links.map(anchor)).toEqual(["", "A post title", "A cover", "A titled link"]);
    expect(d.links[0].aria).toBe("A post title");
  });

  it("reads the head a non-JS crawler gets, and says when the title streamed into the body", () => {
    const inHead = parsePage(page("<h1>One</h1>", `<title>T | RealtyLT</title><meta name="description" content="D"/><link rel="canonical" href="https://realtylt.com/x"/><meta property="og:url" content="https://realtylt.com/x"/>`));
    expect(inHead).toMatchObject({ title: "T | RealtyLT", titleInHead: true, description: "D", canonical: "https://realtylt.com/x" });
    expect(inHead.og["og:url"]).toBe("https://realtylt.com/x");
    const streamed = parsePage(`<html><head></head><body><main><h1>One</h1></main><title>T</title></body></html>`);
    expect(streamed.titleInHead).toBe(false);
  });

  it("counts an h1 wherever it sits, and ignores one inside a script", () => {
    const d = parsePage(`<html><head></head><body><h1 class="sr-only">Search</h1><main><p>x</p></main><script>var s="<h1>no</h1>"</script></body></html>`);
    expect(d.h1s).toEqual(["Search"]);
  });

  it("flags target=_blank data it needs: rel and blank are both captured", () => {
    const d = parsePage(page(`<a href="https://example.com" target="_blank" rel="noopener noreferrer">Source</a><a href="https://example.org" target="_blank">Bad</a>`));
    expect(d.links.map((l: { blank: boolean; rel: string }) => [l.blank, /noopener/.test(l.rel)])).toEqual([[true, true], [true, false]]);
  });
});
