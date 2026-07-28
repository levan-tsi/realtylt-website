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
/** A film that belongs to an article. Present only on posts that actually have one; its
 * presence is what makes the page emit `VideoObject`, so an article can never advertise a
 * video it does not serve. */
export interface ArticleFilm {
  src: string;
  poster: string;
  width: number;
  height: number;
  /** ISO 8601, e.g. "PT31S" — the only duration format VideoObject accepts. */
  duration: string;
  name: string;
  description: string;
}

export interface Article {
  slug: string;
  title: string;
  /** ISO date (YYYY-MM-DD) — display date and JSON-LD datePublished. */
  date: string;
  /** ISO date (YYYY-MM-DD) of the last substantive edit, when there has been one.
   * Drives JSON-LD dateModified and the visible "Updated" line. Absent means never
   * revised, in which case the publish date IS the honest modified date. */
  updated?: string;
  excerpt: string;
  /** Always a renderable image (site-relative path or an allowed https URL). */
  cover: string;
  author: string;
  source: "static" | "db";
  /** True only for the seeded content stubs — renders the "Draft stub" note. */
  placeholder: boolean;
  seoTitle?: string;
  seoDescription?: string;
  /** Set only by posts that ship a film. Drives the VideoObject block. */
  film?: ArticleFilm;
  body:
    | { kind: "paragraphs"; paragraphs: string[] }
    | { kind: "markdown"; markdown: string };
}
