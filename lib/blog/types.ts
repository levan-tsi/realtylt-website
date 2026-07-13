/** The unified blog article the /blog pages render.
 *
 * Two producers feed it:
 *  - `static` — the hand-authored stubs in content/blog/posts.ts (paragraph bodies)
 *  - `db`     — rows published from the CRM "Website" section into Supabase
 *               public.blog_posts (markdown bodies). See docs/BLOG-CMS.md.
 *
 * Everything downstream (index, detail, sitemap, JSON-LD) works off this one shape, so a
 * DB post and a static post are visually and structurally indistinguishable.
 */
export interface Article {
  slug: string;
  title: string;
  /** ISO date (YYYY-MM-DD) — display date and JSON-LD datePublished. */
  date: string;
  excerpt: string;
  /** Always a renderable image (site-relative path or an allowed https URL). */
  cover: string;
  author: string;
  source: "static" | "db";
  /** True only for the seeded content stubs — renders the "Draft stub" note. */
  placeholder: boolean;
  seoTitle?: string;
  seoDescription?: string;
  body:
    | { kind: "paragraphs"; paragraphs: string[] }
    | { kind: "markdown"; markdown: string };
}
