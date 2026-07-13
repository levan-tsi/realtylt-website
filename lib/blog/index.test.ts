import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POSTS } from "@/content/blog/posts";
import { BLOG_REVALIDATE_SECONDS, getArticle, getArticles, mergeArticles, staticToArticle } from "./index";
import type { Article } from "./types";

const SUPA = "https://wpfmhmnceflfruhssqqb.supabase.co";

const dbRow = (over: Record<string, unknown> = {}) => ({
  slug: "hudson-valley-market-check-in",
  title: "Hudson Valley Market Check-In",
  excerpt: "An excerpt.",
  body: "## Hello\n\nBody.",
  cover_image_url: "/images/listings/house-12.jpg",
  author_name: "Levan Tsiklauri",
  published_at: "2026-07-13 15:45:26+00",
  seo_title: null,
  seo_description: null,
  ...over,
});

function stubSupabase(rows: unknown[]) {
  vi.stubEnv("SUPABASE_URL", SUPA);
  vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(rows), { status: 200 })));
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const art = (slug: string, date: string, source: Article["source"] = "db"): Article => ({
  slug,
  title: slug,
  date,
  excerpt: "",
  cover: "/images/listings/house-01.jpg",
  author: "Levan Tsiklauri",
  source,
  placeholder: false,
  body: { kind: "markdown", markdown: "x" },
});

describe("mergeArticles", () => {
  it("with no DB posts, reproduces the static list EXACTLY (order included)", () => {
    const statics = POSTS.map(staticToArticle);
    expect(mergeArticles([], statics)).toEqual(statics);
  });

  it("sorts newest-first across both sources", () => {
    const merged = mergeArticles(
      [art("db-new", "2026-07-13"), art("db-old", "2024-01-01")],
      [art("static-mid", "2025-06-01", "static")],
    );
    expect(merged.map((a) => a.slug)).toEqual(["db-new", "static-mid", "db-old"]);
  });

  it("lets a DB post REPLACE a static stub with the same slug (the migration path)", () => {
    const statics = POSTS.map(staticToArticle);
    const stub = statics[0];
    const real = art(stub.slug, stub.date);

    const merged = mergeArticles([real], statics);
    expect(merged.filter((a) => a.slug === stub.slug)).toHaveLength(1);
    const winner = merged.find((a) => a.slug === stub.slug)!;
    expect(winner.source).toBe("db");
    expect(winner.placeholder).toBe(false);
    // The other nine stubs are untouched.
    expect(merged).toHaveLength(statics.length);
  });
});

describe("ISR window", () => {
  // Next statically analyses `export const revalidate` and REJECTS an imported constant
  // ("Unknown identifier ... at revalidate"), so the blog pages must hard-code the number.
  // This guards the two literals against drifting from BLOG_REVALIDATE_SECONDS.
  it.each(["app/blog/page.tsx", "app/blog/[slug]/page.tsx"])(
    "%s hard-codes the same revalidate window as lib/blog",
    (file) => {
      const src = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      expect(src).toContain(`export const revalidate = ${BLOG_REVALIDATE_SECONDS};`);
    },
  );
});

describe("getArticles / getArticle against a stubbed Supabase", () => {
  it("merges the published DB post in front of the static stubs", async () => {
    stubSupabase([dbRow()]);
    const all = await getArticles();
    expect(all[0].slug).toBe("hudson-valley-market-check-in");
    expect(all[0].source).toBe("db");
    // every static post still renders
    for (const p of POSTS) expect(all.some((a) => a.slug === p.slug)).toBe(true);
    expect(all).toHaveLength(POSTS.length + 1);
  });

  it("resolves a DB post by slug", async () => {
    stubSupabase([dbRow()]);
    const a = await getArticle("hudson-valley-market-check-in");
    expect(a?.title).toBe("Hudson Valley Market Check-In");
    expect(a?.body.kind).toBe("markdown");
  });

  it("returns undefined for an UNPUBLISHED slug (RLS never hands drafts to anon) → the page 404s", async () => {
    // A draft simply is not in the anon result set — this is what the website sees.
    stubSupabase([dbRow()]);
    expect(await getArticle("draft-should-never-appear-publicly")).toBeUndefined();
  });

  it("returns undefined for an unknown slug", async () => {
    stubSupabase([dbRow()]);
    expect(await getArticle("no-such-post")).toBeUndefined();
  });

  it("still serves the static posts when Supabase is down", async () => {
    vi.stubEnv("SUPABASE_URL", SUPA);
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 503 })));
    const all = await getArticles();
    expect(all).toHaveLength(POSTS.length);
    expect(all.every((a) => a.source === "static")).toBe(true);
  });
});
