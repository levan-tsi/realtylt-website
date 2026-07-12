/** On-demand MLS media resolver — the ONLY photo path in snapshot mode.
 *
 * Real-IDX model (owner requirement): a listing's photos are fetched from MLS Grid
 * ONLY when that listing is actually viewed, cached briefly, and NEVER stored (no
 * Blob, no bulk download, no image DB). ONE data-API call resolves ALL of a
 * listing's ~1h-signed media URLs (`ListingId eq '<id>'` + `$expand=Media` —
 * ListingId is an allowed $filter field); /api/media/[id]/[idx] streams individual
 * photos behind the Vercel CDN, so the media budget costs ≈ unique photos viewed
 * per CDN window, not per view.
 *
 * Budget discipline (the account was throttled twice by past bulk work — never again):
 * - per-listing lookup cache (20 min TTL) — all photos of one listing + repeat views
 *   share ONE data call per warm instance;
 * - negative cache (90s) after any MLS failure — errors can never become hammering;
 * - a paced FIFO queue keeps data calls ≥600ms apart (strictly < the 2 req/s
 *   per-account cap), failing fast to the placeholder when the queue is already a
 *   full page deep (no-store → the next viewer retries).
 */

const MEDIA_TTL_MS = 20 * 60 * 1000; // per-listing lookup cache — well under ~1h URL signing
const ERROR_TTL_MS = 90 * 1000; // negative cache after an MLS failure
const FETCH_GAP_MS = 600; // ≥600ms between data calls — strictly < 2 req/s
const MAX_QUEUE = 12; // one search page of cards; beyond that fail fast
const MAX_PHOTOS = 40; // matches the proxy route's index bound

interface MediaRow {
  MediaURL?: string;
  Order?: number;
  MediaCategory?: string;
}

const cache = new Map<string, { urls: string[]; at: number }>();
const errorUntil = new Map<string, number>();
const inflight = new Map<string, Promise<string[] | null>>();

let lastFetchAt = 0;
let queueDepth = 0;
let queue: Promise<unknown> = Promise.resolve();

/** Signed, Order-sorted photo URLs for a listing — [] when it truly has none, null
 * when MLS can't answer right now (no creds / throttled / error → placeholder, no-store). */
export function getListingMedia(id: string): Promise<string[] | null> {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return Promise.resolve(null);
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < MEDIA_TTL_MS) return Promise.resolve(hit.urls);
  if ((errorUntil.get(id) ?? 0) > Date.now()) return Promise.resolve(null);
  const pending = inflight.get(id);
  if (pending) return pending;
  if (queueDepth >= MAX_QUEUE) return Promise.resolve(null); // protect the account cap

  const p = enqueue(() => fetchMedia(id))
    .then((urls) => {
      if (urls) cache.set(id, { urls, at: Date.now() });
      else errorUntil.set(id, Date.now() + ERROR_TTL_MS);
      return urls;
    })
    .finally(() => inflight.delete(id));
  inflight.set(id, p);
  return p;
}

/** Proxy paths for the detail-page gallery: /api/media/{id}/{0..n-1}. Falls back to
 * the single primary path when MLS can't answer — the proxy then serves the branded
 * placeholder, the page still renders, and a later view heals it. */
export async function getProxiedPhotoPaths(id: string): Promise<string[]> {
  const urls = await getListingMedia(id);
  if (urls === null) return [`/api/media/${id}/0`];
  return urls.map((_, i) => `/api/media/${id}/${i}`);
}

/** Serialize MLS data calls with a FETCH_GAP_MS floor between them. */
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  queueDepth++;
  const run = queue.then(async () => {
    const wait = lastFetchAt + FETCH_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastFetchAt = Date.now();
    try {
      return await task();
    } finally {
      queueDepth--;
    }
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function fetchMedia(id: string): Promise<string[] | null> {
  const endpoint = (process.env.MLS_API_ENDPOINT || "https://api.mlsgrid.com/v2").replace(/\/$/, "");
  const apiKey = process.env.MLS_API_KEY;
  const feedId = process.env.MLS_FEED_ID || "onekey2";
  if (!apiKey) return null;
  // id is regex-validated (see getListingMedia) — the $filter stays uninjectable.
  const filter = `ListingId eq '${id}' and MlgCanView eq true and OriginatingSystemName eq '${feedId}'`;
  const url = `${endpoint}/Property?$filter=${encodeURIComponent(filter)}&$expand=Media&$select=ListingId`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Accept-Encoding": "gzip", // mandatory — MLS Grid 400s without it
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[media] MLS lookup for ${id} failed: ${res.status}`);
      return null;
    }
    const data = (await res.json()) as { value?: { Media?: MediaRow[] }[] };
    const media = data.value?.[0]?.Media ?? []; // unknown id / photo-less listing → []
    return media
      .filter((m) => !!m.MediaURL && (!m.MediaCategory || m.MediaCategory === "Photo"))
      .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
      .slice(0, MAX_PHOTOS)
      .map((m) => m.MediaURL as string);
  } catch (e) {
    console.error(`[media] MLS lookup for ${id} errored:`, e);
    return null;
  }
}

/** Test hook — clears caches, the negative cache, and the pacing queue. */
export function resetMediaCacheForTests(): void {
  cache.clear();
  errorUntil.clear();
  inflight.clear();
  lastFetchAt = 0;
  queueDepth = 0;
  queue = Promise.resolve();
}
