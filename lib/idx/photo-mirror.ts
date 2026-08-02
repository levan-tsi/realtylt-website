/** Photo mirroring engine — downloads a listing's freshly-signed MediaURLs and uploads the bytes
 * to Supabase Storage, WHILE THE URLS ARE STILL VALID (they expire ~1h after the sync captures
 * them). Shared by the hourly sync cron and the backfill script.
 *
 * Design (docs/mls-fix/PHOTO-MIRRORING.md):
 * - Deterministic object path `<id>/<idx>.jpg` → re-mirror overwrites in place (idempotent).
 * - COVERS-FIRST fairness: photo 0 of every listing before photo 1 of any, so a budget-bounded
 *   run degrades to "every card has a cover, some galleries are shallow" rather than "some
 *   listings fully mirrored, the rest blank".
 * - CONTIGUOUS PREFIX: `photosMirrored` counts leading photos confirmed in storage. The media
 *   route serves index n from storage iff n < photosMirrored, so the count must stay contiguous.
 * - CHANGE DETECTION: when a listing's `modificationTimestamp` is newer than the one its mirror
 *   was built for, the photo set may have changed → re-mirror from 0. Otherwise resume from the
 *   already-mirrored prefix (never re-download a photo we already have — MLS best practice).
 * - PACING: a small worker pool with exponential backoff on 429 (the account hits intermittent
 *   429 windows on the media host); a photo budget + time budget bound each invocation.
 *
 * All I/O is injected (`download`, `upload`) so this is unit-tested with no network or storage.
 */

export const MAX_MIRROR_PHOTOS = 50; // matches MAX_PHOTOS — a listing never stores more than 50

export interface DownloadResult {
  ok: boolean;
  status: number; // carries 429 so the caller can back off; 0 = network error
  bytes?: Uint8Array | ArrayBuffer;
  contentType?: string;
}

export interface MirrorDeps {
  /** Fetch one photo. ok=false + status lets the pool retry/backoff (429) or give up (404). */
  download(url: string): Promise<DownloadResult>;
  /** Upload bytes to the deterministic path. Returns true on success. */
  upload(path: string, bytes: Uint8Array | ArrayBuffer, contentType: string): Promise<boolean>;
  /** Injectable for tests; defaults to real setTimeout. */
  sleep?(ms: number): Promise<void>;
  /** Injectable clock for tests; defaults to Date.now. */
  now?(): number;
}

export interface MirrorTarget {
  id: string;
  /** Fresh signed source URLs, in display order. */
  photos: string[];
  /** Current listing modification timestamp (drives change detection). */
  modificationTimestamp: string;
  /** Contiguous count already in storage from a prior run (0 when new). */
  priorMirrored?: number;
  /** The modificationTimestamp that prior mirror was built for. */
  priorMirroredTs?: string;
  /** How many photos the listing had when that mirror was built. This — not the modification
   * timestamp — is what decides whether the set changed; see planRange. */
  priorPhotoCount?: number;
}

export interface MirrorOutcome {
  id: string;
  /** New contiguous mirrored count (>= priorMirrored, unless the photo set shrank). */
  photosMirrored: number;
  /** Timestamp this mirror now corresponds to (always the current modificationTimestamp). */
  photosMirroredTs: string;
  /** Photo count this mirror was built against — the change-detection signal for next time. */
  photosMirroredCount: number;
  /** True when every photo (up to the cap) is mirrored. Reported for observability — the sync
   * advances its watermark regardless, because photo debt is recoverable and stale data is not. */
  fully: boolean;
  /** Photos actually downloaded+uploaded this run (for logging/observability). */
  uploaded: number;
}

export interface MirrorOptions {
  /** Max photos to mirror per listing (default MAX_MIRROR_PHOTOS; config caps to covers only, etc). */
  cap?: number;
  /** Max photos to mirror across ALL targets this invocation (serverless bound). */
  photoBudget?: number;
  /** Wall-clock budget for the whole run in ms (serverless bound). */
  timeBudgetMs?: number;
  /** Concurrent downloads (default 4). Keep small — the media host 429s under load. */
  concurrency?: number;
  /** Retries per photo on 429/transient failure (default 3). */
  maxRetries?: number;
  /** CIRCUIT BREAKER. Give up on the whole run after this many consecutive failures with not a
   * single success (default 24; 0 disables). When the media host is refusing everything — a
   * sustained 429 window — every photo costs its full retry ladder, and a run spends its entire
   * wall clock proving the same point several hundred times. Measured 2026-08-01: two feed pages
   * took 279s and mirrored nothing, which starved the data sync that runs after it. Tripping
   * early costs a little mirroring on a flaky minute and buys the sync its whole budget back. */
  failFastAfter?: number;
}

const clampCap = (cap: number | undefined) => Math.max(0, Math.min(cap ?? MAX_MIRROR_PHOTOS, MAX_MIRROR_PHOTOS));

/** Magic-byte signatures for the formats the mls-photos bucket accepts. */
const IMAGE_MAGIC: ReadonlyArray<readonly number[]> = [
  [0xff, 0xd8, 0xff], // JPEG
  [0x89, 0x50, 0x4e, 0x47], // PNG
  [0x52, 0x49, 0x46, 0x46], // RIFF — WebP (checked further below)
  [0x47, 0x49, 0x46, 0x38], // GIF8
];

const toBytes = (b: Uint8Array | ArrayBuffer | undefined): Uint8Array | undefined =>
  b === undefined ? undefined : b instanceof Uint8Array ? b : new Uint8Array(b);

/** Is this 2xx media response ACTUALLY a photo?
 *
 * WHY THIS EXISTS (measured 2026-08-01, and it froze the whole site's inventory for seven days):
 * media.mlsgrid.com answers a rate limit with the 21-byte `text/plain` body "Request limit
 * reached". Our download only gated on `response.ok`, so whenever that arrived under a 2xx it
 * counted as a successful photo — and we then uploaded a text file to Storage as `<id>/<idx>.jpg`.
 * The bucket's mime allowlist correctly refused it (HTTP 400 `invalid_mime_type`), the photo never
 * mirrored, `fully` never went true, and the sync cron HELD ITS WATERMARK on every run. The feed
 * stopped advancing past 2026-07-25 while the cron re-downloaded the same failing photos hourly,
 * which is itself what kept the media host returning 429.
 *
 * So: never trust the status alone. Require an image content-type AND real image magic bytes —
 * a truncated or error payload passes neither, and a mislabelled-but-valid JPEG still passes on
 * its bytes. A response that fails this is treated as a retryable failure, exactly like a 429. */
export function isImagePayload(contentType: string | null | undefined, bytes: Uint8Array | undefined): boolean {
  if (!bytes || bytes.length < 12) return false; // nothing real is this small
  const ct = (contentType ?? "").toLowerCase();
  if (ct && !ct.startsWith("image/")) return false;
  const magic = IMAGE_MAGIC.some((sig) => sig.every((b, i) => bytes[i] === b));
  if (!magic) return false;
  // RIFF is also WAV/AVI — a WebP names itself at offset 8.
  if (bytes[0] === 0x52 && bytes[1] === 0x49) {
    return bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  return true;
}

/** Where a target should (re)start mirroring: 0 when the photo set really may have changed,
 * otherwise the already-mirrored prefix. `end` is the capped photo count.
 *
 * WHY THIS IS NOT KEYED ON ModificationTimestamp ANY MORE (measured 2026-08-02): it used to be,
 * and any change to a listing — a price edit, a status flip to Pending — reset its mirror to 0.
 * A budget-bounded run then re-mirrored only the COVER (the queue is covers-first), so the row
 * came back reporting exactly one photo and threw away the record of the rest. Listings that
 * churn churn a lot: 84% of our Pending rows were serving ONE photo while the feed held 7, 14,
 * 25, 29, 35, 38. It was not that OneKey removed pictures; we kept discarding them.
 *
 * The photo COUNT is the honest cheap signal instead. Signed MediaURLs are re-issued on every
 * fetch so the URLs themselves cannot be compared, but a listing whose photo count is unchanged
 * has almost certainly not had its set rebuilt — and the objects live at deterministic paths,
 * so even a swapped photo at the same index is overwritten in place the next time that listing
 * genuinely grows or shrinks. Re-mirroring from 0 on every price change is the expensive,
 * lossy option; this is the one that lets a gallery actually fill up. */
export function planRange(t: MirrorTarget, cap: number): { start: number; end: number } {
  const end = Math.min(t.photos.length, cap);
  const knownSet = t.priorPhotoCount != null && t.priorPhotoCount === t.photos.length;
  // No recorded count yet (rows mirrored before this change) → fall back to the old timestamp
  // test rather than assuming, so an unknown row still self-heals instead of trusting a stale prefix.
  const sameSet = knownSet || (t.priorPhotoCount == null && !!t.priorMirroredTs && t.priorMirroredTs === t.modificationTimestamp);
  const start = sameSet ? Math.min(t.priorMirrored ?? 0, end) : 0;
  return { start, end };
}

/** Marker to WRITE for an upserted listing when mirroring is UNAVAILABLE this run (no storage
 * write config, i.e. no SUPABASE_SERVICE_ROLE_KEY server-side). The sync's upsert REPLACES the
 * whole `listing` JSONB, so omitting the mirror marker regresses it to null and the media route
 * stops serving the permanent storage objects — blanking photos that physically still exist (the
 * "first photos disappear on refresh" bug). The objects outlive the ~1h signed-URL expiry, so we
 * carry the prior contiguous prefix forward, clamped to the current photo count. The prior
 * timestamp is kept so a future mirror run (once the key is configured) re-checks change detection
 * via planRange and re-mirrors from 0 if the photos actually changed. Returns undefined when there
 * is nothing to preserve (never mirrored). */
export function preservedMarker(
  photoCount: number,
  prior?: { mirrored: number; ts?: string },
): { photosMirrored: number; photosMirroredTs?: string } | undefined {
  if (!prior || prior.mirrored <= 0) return undefined;
  return { photosMirrored: Math.min(prior.mirrored, Math.max(0, photoCount)), photosMirroredTs: prior.ts };
}

interface WorkItem {
  id: string;
  idx: number;
  url: string;
}

/** Build the covers-first work queue: depth 0 across all targets, then depth 1, etc., skipping
 * each target's already-mirrored prefix, capped at `photoBudget`. */
export function buildQueue(targets: readonly MirrorTarget[], cap: number, photoBudget: number): WorkItem[] {
  const ranges = targets.map((t) => planRange(t, cap));
  const maxEnd = ranges.reduce((m, r) => Math.max(m, r.end), 0);
  const queue: WorkItem[] = [];
  for (let depth = 0; depth < maxEnd && queue.length < photoBudget; depth++) {
    for (let i = 0; i < targets.length && queue.length < photoBudget; i++) {
      const { start, end } = ranges[i];
      if (depth < start || depth >= end) continue;
      queue.push({ id: targets[i].id, idx: depth, url: targets[i].photos[depth] });
    }
  }
  return queue;
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Download one photo with bounded retries; backs off on 429 and transient (0/5xx) failures. */
async function fetchWithBackoff(
  deps: MirrorDeps,
  url: string,
  maxRetries: number,
  sleep: (ms: number) => Promise<void>,
): Promise<DownloadResult> {
  let last: DownloadResult = { ok: false, status: 0 };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    last = await deps.download(url);
    // A 2xx carrying something that is not an image is a RATE LIMIT IN DISGUISE, not a photo
    // (see isImagePayload). Demote it to a retryable failure so it backs off and is never
    // uploaded — uploading it is what deadlocked the sync's watermark.
    if (last.ok && !isImagePayload(last.contentType, toBytes(last.bytes))) {
      last = { ok: false, status: last.status || 429 };
    }
    if (last.ok) return last;
    // 404/403 are permanent for this URL — do not hammer the media host.
    if (last.status === 404 || last.status === 403) return last;
    if (attempt < maxRetries) await sleep(Math.min(8000, 500 * 2 ** attempt));
  }
  return last;
}

/** Mirror a batch of listings. Idempotent, budget-bounded, covers-first. Never throws for a
 * single photo failure — a partial mirror simply reports `fully:false` and self-heals next run. */
export async function mirrorPhotos(
  targets: readonly MirrorTarget[],
  deps: MirrorDeps,
  opts: MirrorOptions = {},
): Promise<MirrorOutcome[]> {
  const cap = clampCap(opts.cap);
  const photoBudget = Math.max(0, opts.photoBudget ?? Number.MAX_SAFE_INTEGER);
  const timeBudgetMs = opts.timeBudgetMs ?? Number.MAX_SAFE_INTEGER;
  const concurrency = Math.max(1, opts.concurrency ?? 4);
  const maxRetries = Math.max(0, opts.maxRetries ?? 3);
  const failFastAfter = Math.max(0, opts.failFastAfter ?? 24);
  const sleep = deps.sleep ?? defaultSleep;
  const now = deps.now ?? Date.now;

  const queue = buildQueue(targets, cap, photoBudget);
  const succeeded = new Set<string>(); // `${id}:${idx}`
  const startedAt = now();
  let cursor = 0;
  let consecutiveFailures = 0;

  const tripped = () => failFastAfter > 0 && succeeded.size === 0 && consecutiveFailures >= failFastAfter;

  const worker = async () => {
    for (;;) {
      if (now() - startedAt >= timeBudgetMs) return; // out of time — stop pulling work
      if (tripped()) return; // nothing is getting through — stop wasting the run's clock
      const i = cursor++;
      if (i >= queue.length) return;
      const item = queue[i];
      const dl = await fetchWithBackoff(deps, item.url, maxRetries, sleep);
      if (!dl.ok || !dl.bytes) {
        consecutiveFailures++;
        continue;
      }
      const ok = await deps.upload(`${item.id}/${item.idx}.jpg`, dl.bytes, dl.contentType ?? "image/jpeg");
      if (ok) {
        succeeded.add(`${item.id}:${item.idx}`);
        consecutiveFailures = 0;
      } else {
        consecutiveFailures++;
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));

  return targets.map((t) => {
    const { start, end } = planRange(t, cap);
    let mirrored = start;
    while (mirrored < end && succeeded.has(`${t.id}:${mirrored}`)) mirrored++;
    let uploaded = 0;
    for (let d = start; d < end; d++) if (succeeded.has(`${t.id}:${d}`)) uploaded++;
    return {
      id: t.id,
      photosMirrored: mirrored,
      photosMirroredTs: t.modificationTimestamp,
      photosMirroredCount: t.photos.length,
      fully: mirrored >= end,
      uploaded,
    };
  });
}
