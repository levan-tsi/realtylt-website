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
}

export interface MirrorOutcome {
  id: string;
  /** New contiguous mirrored count (>= priorMirrored, unless the photo set shrank). */
  photosMirrored: number;
  /** Timestamp this mirror now corresponds to (always the current modificationTimestamp). */
  photosMirroredTs: string;
  /** True when every photo (up to the cap) is mirrored — the sync may advance its watermark. */
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
}

const clampCap = (cap: number | undefined) => Math.max(0, Math.min(cap ?? MAX_MIRROR_PHOTOS, MAX_MIRROR_PHOTOS));

/** Where a target should (re)start mirroring: 0 when the photo set may have changed, else the
 * already-mirrored prefix. `end` is the capped photo count. */
export function planRange(t: MirrorTarget, cap: number): { start: number; end: number } {
  const end = Math.min(t.photos.length, cap);
  const sameSet = !!t.priorMirroredTs && t.priorMirroredTs === t.modificationTimestamp;
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
  const sleep = deps.sleep ?? defaultSleep;
  const now = deps.now ?? Date.now;

  const queue = buildQueue(targets, cap, photoBudget);
  const succeeded = new Set<string>(); // `${id}:${idx}`
  const startedAt = now();
  let cursor = 0;

  const worker = async () => {
    for (;;) {
      if (now() - startedAt >= timeBudgetMs) return; // out of time — stop pulling work
      const i = cursor++;
      if (i >= queue.length) return;
      const item = queue[i];
      const dl = await fetchWithBackoff(deps, item.url, maxRetries, sleep);
      if (!dl.ok || !dl.bytes) continue;
      const ok = await deps.upload(`${item.id}/${item.idx}.jpg`, dl.bytes, dl.contentType ?? "image/jpeg");
      if (ok) succeeded.add(`${item.id}:${item.idx}`);
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
      fully: mirrored >= end,
      uploaded,
    };
  });
}
