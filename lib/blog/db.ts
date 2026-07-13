/** DB-backed blog posts — the CRM "Website" section publishes into Supabase
 * `public.blog_posts`; this module is the website's read side.
 *
 * Read with the ANON key only. RLS (`blog_posts_public_select`) hard-limits anon to
 * `status = 'published'`, so a draft can never leak even if this query were wrong —
 * we still send `status=eq.published` as belt-and-suspenders.
 *
 * Failure policy: this never throws. If Supabase is unconfigured, down, or answers
 * garbage, we log and return [] — the blog keeps rendering the static posts.
 *
 * Contract + schema: docs/BLOG-CMS.md
 */

import type { Article } from "./types";

/** Shown when a DB post has no cover (or an untrusted one). */
export const DEFAULT_COVER = "/images/listings/house-16.jpg";

/** Same shape the DB CHECK constraint enforces — re-validated here so a bad row is
 * dropped rather than routed into a URL. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** ISR window for the published-posts query. A CRM publish calls POST /api/revalidate
 * (tag `blog`) for an instant update; this is the fallback ceiling. */
export const BLOG_REVALIDATE_SECONDS = 300;
export const BLOG_CACHE_TAG = "blog";

const SELECT =
  "slug,title,excerpt,body,cover_image_url,author_name,published_at,seo_title,seo_description";

interface DbRow {
  slug: unknown;
  title: unknown;
  excerpt: unknown;
  body: unknown;
  cover_image_url: unknown;
  author_name: unknown;
  published_at: unknown;
  seo_title: unknown;
  seo_description: unknown;
}

function supabaseOrigin(): string | null {
  const raw = process.env.SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/** Only two cover sources are trusted: a site-relative path, or an https URL on OUR
 * Supabase origin (the `blog-media` storage bucket the CRM uploads to). Anything else
 * — including a protocol-relative `//evil.com/x.jpg` — falls back to the default cover,
 * so a bad value can never point next/image at an arbitrary host. */
export function safeCover(value: unknown): string {
  const url = typeof value === "string" ? value.trim() : "";
  if (!url) return DEFAULT_COVER;
  if (url.startsWith("//")) return DEFAULT_COVER;
  if (url.startsWith("/")) return url;
  const origin = supabaseOrigin();
  if (origin && url.startsWith(`${origin}/storage/v1/object/public/`)) return url;
  return DEFAULT_COVER;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Map one PostgREST row → Article. Returns null for a row we refuse to render. */
export function rowToArticle(row: DbRow): Article | null {
  const slug = str(row.slug);
  const title = str(row.title);
  const markdown = typeof row.body === "string" ? row.body : "";
  if (!SLUG_RE.test(slug) || !title || !markdown.trim()) return null;

  const publishedAt = str(row.published_at);
  // `2026-07-13 15:45:26.79+00` (PostgREST) → `2026-07-13`; fall back to today so a row
  // missing the stamp still sorts and renders instead of showing "Invalid Date".
  const parsed = new Date(publishedAt.replace(" ", "T"));
  const date = Number.isNaN(parsed.getTime())
    ? new Date().toISOString().slice(0, 10)
    : parsed.toISOString().slice(0, 10);

  const article: Article = {
    slug,
    title,
    date,
    excerpt: str(row.excerpt),
    cover: safeCover(row.cover_image_url),
    author: str(row.author_name) || "Levan Tsiklauri",
    source: "db",
    placeholder: false,
    body: { kind: "markdown", markdown },
  };
  const seoTitle = str(row.seo_title);
  const seoDescription = str(row.seo_description);
  if (seoTitle) article.seoTitle = seoTitle;
  if (seoDescription) article.seoDescription = seoDescription;
  return article;
}

/** Fetch every PUBLISHED post. Never throws; [] when the CMS isn't configured. */
export async function fetchDbArticles(): Promise<Article[]> {
  const origin = supabaseOrigin();
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!origin || !key) return [];

  const url =
    `${origin}/rest/v1/blog_posts?select=${SELECT}` +
    `&status=eq.published&order=published_at.desc&limit=200`;

  try {
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: BLOG_REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG] },
    });
    if (!res.ok) {
      console.warn(`[blog] Supabase responded ${res.status} — serving static posts only`);
      return [];
    }
    const rows: unknown = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows
      .map((r) => rowToArticle(r as DbRow))
      .filter((a): a is Article => a !== null);
  } catch (e) {
    console.warn("[blog] Supabase fetch failed — serving static posts only:", e);
    return [];
  }
}
