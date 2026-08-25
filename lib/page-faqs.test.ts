import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BUYING_FAQS, FINANCING_FAQS, SELLING_FAQS, pageFaqJsonLd } from "./page-faqs";

/** The marketing-page FAQs (round 39): voice rules + the page wiring that makes the
 * schema honest. A FAQPage block whose questions are not VISIBLE on the page is the kind
 * of markup Google calls out — so each page must render <PageFaq> with the same list it
 * feeds the JSON-LD. */

const ALL = [
  ["buying", BUYING_FAQS],
  ["selling", SELLING_FAQS],
  ["financing", FINANCING_FAQS],
] as const;

describe("page FAQ content", () => {
  it("every entry is a real question with a substantive answer", () => {
    for (const [, faqs] of ALL) {
      expect(faqs.length).toBeGreaterThanOrEqual(4);
      for (const f of faqs) {
        expect(f.q.trim().endsWith("?"), f.q).toBe(true);
        expect(f.a.length, f.q).toBeGreaterThan(80);
      }
    }
  });

  it("holds the site voice: no em dashes, no exclamation marks, no arrow glyphs", () => {
    for (const [, faqs] of ALL) {
      for (const f of faqs) {
        const text = f.q + " " + f.a;
        expect(text, f.q).not.toMatch(/—/);
        expect(text, f.q).not.toMatch(/!/);
        expect(text, f.q).not.toMatch(/[→←➔]/);
      }
    }
  });

  it("builds FAQPage schema with every question", () => {
    const block = pageFaqJsonLd(BUYING_FAQS, "/buying") as {
      "@type": string;
      mainEntity: unknown[];
    };
    expect(block["@type"]).toBe("FAQPage");
    expect(block.mainEntity).toHaveLength(BUYING_FAQS.length);
  });

  it("each page renders the visible block AND emits the schema from the same list", () => {
    const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
    for (const [name] of ALL) {
      const page = read(`app/${name}/page.tsx`);
      const constName = `${name.toUpperCase()}_FAQS`;
      expect(page, name).toContain(`<PageFaq topic=`);
      expect(page, name).toContain(`faqs={${constName}}`);
      expect(page, name).toContain(`pageFaqJsonLd(${constName}, "/${name}")`);
    }
  });
});
