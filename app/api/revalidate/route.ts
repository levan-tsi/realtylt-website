import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { BLOG_CACHE_TAG } from "@/lib/blog/db";
import {
  checkRevalidateAuth,
  parseRevalidateSlug,
  revalidateRateLimited,
} from "@/lib/blog/revalidate";

/** The CRM "Website" section calls this after publishing/unpublishing a blog post so the
 * marketing site updates immediately instead of waiting out the 5-minute ISR window.
 * Contract: docs/BLOG-CMS.md.
 *
 *   POST /api/revalidate
 *   Authorization: Bearer <BLOG_REVALIDATE_SECRET>   (or x-revalidate-secret: <secret>)
 *   {"slug": "my-post"}        ← optional; omit to refresh just the index
 */

// A publish ping is a couple of hundred bytes.
const MAX_BODY_BYTES = 4 * 1024;

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  try {
    if (revalidateRateLimited(clientIp(req))) {
      return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
    }

    const auth = checkRevalidateAuth(req.headers);
    if (auth === "disabled") {
      // No secret configured → the hook is off, not open. Say so plainly; the caller is
      // our own CRM, and an attacker learns nothing exploitable.
      return NextResponse.json(
        { ok: false, error: "Revalidation is not configured." },
        { status: 503 },
      );
    }
    if (auth === "unauthorized") {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const declared = Number(req.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "Request too large." }, { status: 413 });
    }
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "Request too large." }, { status: 413 });
    }

    // An empty body is valid — it means "refresh the blog index".
    let body: unknown = null;
    if (raw.trim() !== "") {
      try {
        body = JSON.parse(raw);
      } catch {
        return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
      }
    }

    const slug = parseRevalidateSlug(body);
    const revalidated: string[] = [];

    // The tag drops the cached Supabase query everywhere it is used (index, detail,
    // sitemap); the explicit paths drop the pre-rendered HTML for the affected routes.
    revalidateTag(BLOG_CACHE_TAG);
    revalidated.push(`tag:${BLOG_CACHE_TAG}`);

    revalidatePath("/blog");
    revalidated.push("/blog");

    if (slug) {
      revalidatePath(`/blog/${slug}`);
      revalidated.push(`/blog/${slug}`);
    }

    revalidatePath("/sitemap.xml");
    revalidated.push("/sitemap.xml");

    return NextResponse.json({ ok: true, revalidated, now: Date.now() });
  } catch (e) {
    console.error("[api/revalidate]", e);
    return NextResponse.json({ ok: false, error: "Revalidation failed." }, { status: 500 });
  }
}
