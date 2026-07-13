/** Auth + throttle for POST /api/revalidate — the hook the CRM calls after publishing.
 *
 * Auth: a shared secret in `BLOG_REVALIDATE_SECRET`, compared in CONSTANT TIME over
 * SHA-256 digests (fixed 32-byte inputs, so timingSafeEqual can't throw on a length
 * mismatch and the comparison leaks neither the secret's length nor its prefix).
 * With no secret configured the endpoint is DISABLED — never open.
 */

import crypto from "node:crypto";

export type RevalidateAuth = "ok" | "unauthorized" | "disabled";

function sha256(s: string): Buffer {
  return crypto.createHash("sha256").update(s, "utf8").digest();
}

/** The secret may arrive as `Authorization: Bearer <s>` or `x-revalidate-secret: <s>`. */
export function presentedSecret(headers: Headers): string {
  const auth = headers.get("authorization") ?? "";
  const bearer = /^Bearer\s+(.+)$/i.exec(auth.trim());
  if (bearer) return bearer[1].trim();
  return (headers.get("x-revalidate-secret") ?? "").trim();
}

export function checkRevalidateAuth(headers: Headers): RevalidateAuth {
  const expected = process.env.BLOG_REVALIDATE_SECRET?.trim();
  if (!expected) return "disabled";
  const presented = presentedSecret(headers);
  if (!presented) return "unauthorized";
  return crypto.timingSafeEqual(sha256(presented), sha256(expected)) ? "ok" : "unauthorized";
}

/** Best-effort per-IP throttle (in-memory, per serverless instance — same model as
 * lib/leads). A publish is a human action; 10/minute is generous and still blunts a
 * script hammering the endpoint to force cache churn. */
const RATE_MAX = 10;
const RATE_WINDOW_MS = 60_000;
const windows = new Map<string, number[]>();

export function revalidateRateLimited(ip: string): boolean {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  if (windows.size > 1_000) {
    for (const [k, times] of windows) {
      if ((times[times.length - 1] ?? 0) <= cutoff) windows.delete(k);
    }
  }
  const recent = (windows.get(ip) ?? []).filter((t) => t > cutoff);
  const limited = recent.length >= RATE_MAX;
  if (!limited) recent.push(Date.now());
  windows.set(ip, recent);
  return limited;
}

export function resetRevalidateRateLimitForTests(): void {
  windows.clear();
}

/** Slug in the body is optional; when present it must be a real blog slug so it can't be
 * used to revalidate arbitrary paths. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseRevalidateSlug(body: unknown): string | null {
  const raw = (body as Record<string, unknown> | null | undefined)?.slug;
  if (typeof raw !== "string") return null;
  const slug = raw.trim();
  return SLUG_RE.test(slug) && slug.length <= 120 ? slug : null;
}
