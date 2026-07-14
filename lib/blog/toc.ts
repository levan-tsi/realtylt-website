/** Heading extraction + reading-time for the article reading experience.
 *
 * The table of contents and the rendered article MUST agree on heading ids, or a ToC link
 * jumps nowhere. Both sides call `parseHeadings` on the same body and walk the results in
 * document order, so the nth rendered heading always carries the nth id here. Keep the
 * heading-detection regex identical to the one in lib/blog/markdown.tsx.
 */

/** A heading exactly as authored, with a unique in-page id. */
export interface HeadingNode {
  /** Markdown heading level, 1..6. */
  level: number;
  /** Display text, inline markdown stripped. */
  text: string;
  /** Unique slug — the `id` on the rendered heading and the `#href` in the ToC. */
  id: string;
}

/** One row the table of contents renders. h1/h2 sit at depth 2 (markdown.tsx renders both
 * as <h2> — the page owns the single <h1>); h3 nests at depth 3. Deeper headings are small
 * labels, not sections, so they are left out of the ToC. */
export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

const HEADING_RE = /^(#{1,6})\s+(.*)$/;

/** Drop the inline markdown markers so a heading reads as plain words in the ToC and as a
 * clean slug. Mirrors the inline subset lib/blog/markdown.tsx supports. */
export function stripInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, "$1")
    .trim();
}

/** Plain text → URL-safe slug. Punctuation dropped, whitespace to single hyphens. */
export function slugify(text: string): string {
  const slug = stripInline(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

/** Every heading in a markdown body, in order, with de-duplicated ids.
 * A repeat slug gets a numeric suffix (`foo`, `foo-2`) so ids stay unique. */
export function parseHeadings(markdown: string): HeadingNode[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const seen = new Map<string, number>();
  const out: HeadingNode[] = [];

  for (const line of lines) {
    const m = HEADING_RE.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = stripInline(m[2].trim());
    if (!text) continue;
    const base = slugify(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    out.push({ level, text, id: n === 1 ? base : `${base}-${n}` });
  }
  return out;
}

/** The ToC rows for a body: headings at level 1..3, mapped to display depth. */
export function extractToc(markdown: string): TocItem[] {
  return parseHeadings(markdown)
    .filter((h) => h.level <= 3)
    .map((h) => ({ id: h.id, text: h.text, depth: h.level <= 2 ? 2 : 3 }));
}

/** Rounded minutes at 200 wpm, floor of 1. Counts words in the raw body (heading marks and
 * punctuation add a rounding error of at most a word — not worth stripping precisely). */
export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** A question/answer pair for FAQPage structured data. */
export interface FaqPair {
  q: string;
  a: string;
}

const FAQ_SECTION_RE = /^(faq|faqs|frequently asked|common questions|questions? (and|&) answers|q ?& ?a)\b/i;

/** Pull a Q&A section out of a body for FAQPage JSON-LD, or [] if there is none.
 *
 * Convention (documented for writers): an `## FAQ` (or "Frequently asked...") section whose
 * questions are `### ...` headings, each answered by the paragraph text beneath it. Returns
 * [] for any body that does not follow it — we never fabricate an FAQ that is not written. */
export function extractFaqs(markdown: string): FaqPair[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const out: FaqPair[] = [];

  let inSection = false;
  let q: string | null = null;
  let answer: string[] = [];

  const flush = () => {
    if (q && answer.length) out.push({ q, a: answer.join(" ").trim() });
    q = null;
    answer = [];
  };

  for (const line of lines) {
    const h = HEADING_RE.exec(line);
    if (h) {
      const level = h[1].length;
      const text = stripInline(h[2].trim());
      if (level <= 2) {
        // A top-level heading ends any FAQ section and starts a new region.
        flush();
        inSection = FAQ_SECTION_RE.test(text);
        continue;
      }
      if (inSection && level === 3) {
        // New question inside the FAQ section.
        flush();
        q = text;
        continue;
      }
    }
    if (inSection && q && line.trim() !== "") answer.push(line.trim());
    else if (inSection && q && line.trim() === "" && answer.length) {
      // blank line inside an answer keeps the answer open (multi-paragraph) — no-op.
    }
  }
  flush();
  return out;
}
