import { describe, expect, it } from "vitest";
import { POSTS } from "@/content/blog/posts";
import { isConsumer } from "./related";
import { extractFaqs, parseHeadings } from "./toc";

/** THE SEO SHAPE EVERY REPOSTED CONSUMER ARTICLE SHIPS WITH (docs/blog-repost/PIPELINE.md §4).
 *
 * The owner's bar (2026-09-24) is "proper high-level SEO similar to our AI page": keyword-bearing
 * title tag, a real meta description, an FAQ that becomes FAQPage schema, sources linked, internal
 * links to the site and to sibling posts, and the house voice. scripts/seo-audit.mjs checks the
 * RENDERED page; this checks the source, so a post cannot be committed without it. */

/** Consumer articles WRITTEN NEW on this site rather than reposted from the owner's Drive drafts.
 * They carry the same SEO shape (the loop below checks them too), but not the repost dating: a
 * repost keeps its old publication date and is re-verified later, while a new article is dated the
 * day it was written. Round 22 (2026-11-01): the renovations page replaced the last seeded stub
 * with new text (nothing of the 2025 draft republished, every figure re-read), so it is dated
 * 2026-11-01 and leaves the repost set. */
const WRITTEN_NEW = new Set(["top-5-renovations-increase-home-value-ny"]);
const CONSUMER = POSTS.filter((p) => !p.placeholder && isConsumer({ placeholder: false, cluster: p.cluster }));
const REPOSTED = CONSUMER.filter((p) => !WRITTEN_NEW.has(p.slug));
const SITE_PAGES = ["/buying", "/selling", "/financing", "/search", "/home-value", "/top-areas", "/connect"];

describe("reposted consumer articles", () => {
  it("exist (the scorer is scoring something)", () => {
    expect(REPOSTED.length).toBeGreaterThanOrEqual(1);
  });

  it("names only real, published consumer articles as written new", () => {
    for (const slug of WRITTEN_NEW) expect(CONSUMER.some((p) => p.slug === slug), slug).toBe(true);
  });

  // The SEO shape holds for every consumer article, reposted or written new.
  for (const p of CONSUMER) {
    describe(p.slug, () => {
      const md = p.markdown ?? "";

      it("has a <title> of 60 characters or fewer and a 140 to 160 character description", () => {
        expect(p.seoTitle, "seoTitle").toBeTruthy();
        expect(p.seoTitle!.length, p.seoTitle).toBeLessThanOrEqual(60);
        expect(p.seoDescription, "seoDescription").toBeTruthy();
        const d = p.seoDescription!.length;
        expect(d >= 140 && d <= 160, `${d} chars: ${p.seoDescription}`).toBe(true);
      });

      it("has a markdown body with sections, an FAQ of three or more, and a Sources list", () => {
        expect(p.body).toEqual([]);
        expect(parseHeadings(md).filter((h) => h.level === 2).length).toBeGreaterThanOrEqual(4);
        expect(extractFaqs(md).length).toBeGreaterThanOrEqual(3);
        expect(md).toMatch(/^## Sources$/m);
      });

      it("links at least three outside sources and two sibling posts, and a site page", () => {
        const external = new Set([...md.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]));
        const posts = new Set([...md.matchAll(/\]\(\/blog\/([a-z0-9-]+)/g)].map((m) => m[1]));
        expect(external.size, "external sources").toBeGreaterThanOrEqual(3);
        expect(posts.size, "sibling posts").toBeGreaterThanOrEqual(2);
        expect(SITE_PAGES.some((s) => md.includes(`](${s})`)), "a site page link").toBe(true);
        for (const u of external) expect(u.startsWith("https://"), u).toBe(true);
      });

      it("speaks in the house voice: no em dashes, no arrow glyphs, no leftover draft furniture", () => {
        const visible = `${p.title}\n${p.excerpt}\n${p.seoTitle}\n${p.seoDescription}\n${md}`;
        expect(visible).not.toMatch(/—/);
        expect(visible).not.toMatch(/[←-⇿⟶➔]/);
        // The old number and the Gemini prompt blocks must never ship.
        expect(visible).not.toMatch(/905-7923|Role:|Meta Title:|Image Generation Prompt|Alt Text \(/);
      });

      if (WRITTEN_NEW.has(p.slug)) {
        it("carries an honest date: published the day it was written, after the repost wave", () => {
          expect(p.date > "2026-09-24", p.date).toBe(true);
          expect(p.updated ?? p.date).toBe(p.date);
        });
      } else {
        it("carries an honest date pair: published in the past, re-verified on or after it", () => {
          expect(p.date <= "2026-09-24", p.date).toBe(true);
          expect(p.updated, "updated").toBeTruthy();
          expect(p.updated! >= p.date).toBe(true);
        });
      }
    });
  }

  it("no two reposted articles share a title tag, a description or a date", () => {
    for (const key of ["seoTitle", "seoDescription", "date"] as const) {
      const vals = REPOSTED.map((p) => p[key]);
      expect(new Set(vals).size, key).toBe(vals.length);
    }
  });

  it("no consumer article, reposted or new, shares a title tag or a description", () => {
    for (const key of ["seoTitle", "seoDescription"] as const) {
      const vals = CONSUMER.map((p) => p[key]);
      expect(new Set(vals).size, key).toBe(vals.length);
    }
  });
});
