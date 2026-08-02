import { describe, expect, it, vi } from "vitest";
import {
  buildQueue,
  isImagePayload,
  mirrorPhotos,
  planRange,
  preservedMarker,
  type MirrorDeps,
  type MirrorTarget,
} from "./photo-mirror";

/** A byte payload that passes isImagePayload — a real JPEG signature plus enough length.
 * The fake must produce something plausible now that a non-image 2xx is treated as a failure. */
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 0, 0]);

/** Fake deps that record every download/upload and let a test script per-URL outcomes. */
function fakeDeps(opts: {
  downloadStatus?: (url: string, attempt: number) => number; // non-200 → failure
  uploadOk?: (path: string) => boolean;
  /** Override the downloaded payload — used to simulate the media host's text/plain rate limit. */
  payload?: (url: string) => { bytes: Uint8Array; contentType: string };
} = {}) {
  const downloads: string[] = [];
  const uploads: string[] = [];
  const attempts = new Map<string, number>();
  const sleeps: number[] = [];
  const deps: MirrorDeps = {
    async download(url) {
      downloads.push(url);
      const a = attempts.get(url) ?? 0;
      attempts.set(url, a + 1);
      const status = opts.downloadStatus ? opts.downloadStatus(url, a) : 200;
      if (status !== 200) return { ok: false, status };
      const p = opts.payload?.(url) ?? { bytes: JPEG, contentType: "image/jpeg" };
      return { ok: true, status: 200, bytes: p.bytes, contentType: p.contentType };
    },
    async upload(path) {
      const ok = opts.uploadOk ? opts.uploadOk(path) : true;
      if (ok) uploads.push(path);
      return ok;
    },
    sleep: async (ms) => { sleeps.push(ms); },
    now: () => 0, // frozen clock — time budget never trips in these tests
  };
  return { deps, downloads, uploads, sleeps };
}

const target = (id: string, n: number, ts = "2026-07-16T00:00:00Z", extra: Partial<MirrorTarget> = {}): MirrorTarget => ({
  id,
  photos: Array.from({ length: n }, (_, i) => `https://media.mlsgrid.com/${id}/${i}?token=x`),
  modificationTimestamp: ts,
  ...extra,
});

describe("planRange — where a listing (re)starts mirroring", () => {
  it("starts at 0 for a never-mirrored listing", () => {
    expect(planRange(target("A", 5), 50)).toEqual({ start: 0, end: 5 });
  });
  it("resumes from the prior prefix when the modificationTimestamp is unchanged", () => {
    expect(planRange(target("A", 5, "T1", { priorMirrored: 2, priorMirroredTs: "T1" }), 50)).toEqual({ start: 2, end: 5 });
  });
  it("re-mirrors from 0 when the photo set may have changed (newer ts)", () => {
    expect(planRange(target("A", 5, "T2", { priorMirrored: 2, priorMirroredTs: "T1" }), 50)).toEqual({ start: 0, end: 5 });
  });
  it("caps end at the configured cap (covers-only mode)", () => {
    expect(planRange(target("A", 40), 1)).toEqual({ start: 0, end: 1 });
  });
});

describe("preservedMarker — never regress an existing mirror prefix when mirroring is unavailable", () => {
  it("carries the prior prefix + ts forward (the JSONB-replace upsert would otherwise wipe it)", () => {
    expect(preservedMarker(33, { mirrored: 32, ts: "T1" })).toEqual({
      photosMirrored: 32,
      photosMirroredTs: "T1",
    });
  });
  it("clamps the preserved prefix to the current photo count when the set shrank", () => {
    expect(preservedMarker(10, { mirrored: 32, ts: "T1" })).toEqual({
      photosMirrored: 10,
      photosMirroredTs: "T1",
    });
  });
  it("returns undefined when nothing was mirrored (leave the marker unset)", () => {
    expect(preservedMarker(20, { mirrored: 0, ts: "T1" })).toBeUndefined();
    expect(preservedMarker(20, undefined)).toBeUndefined();
  });
  it("preserves the prefix even without a prior ts (a future mirror re-checks from 0)", () => {
    expect(preservedMarker(5, { mirrored: 3 })).toEqual({
      photosMirrored: 3,
      photosMirroredTs: undefined,
    });
  });
});

describe("buildQueue — covers-first fairness", () => {
  it("emits photo 0 of every listing before photo 1 of any, bounded by the budget", () => {
    const q = buildQueue([target("A", 3), target("B", 2)], 50, 100);
    expect(q.map((w) => `${w.id}:${w.idx}`)).toEqual(["A:0", "B:0", "A:1", "B:1", "A:2"]);
  });
  it("truncates at the photo budget (covers first)", () => {
    const q = buildQueue([target("A", 3), target("B", 3)], 50, 2);
    expect(q.map((w) => `${w.id}:${w.idx}`)).toEqual(["A:0", "B:0"]);
  });
});

describe("mirrorPhotos — happy path", () => {
  it("mirrors every photo and reports fully:true with the current ts", async () => {
    const { deps, uploads } = fakeDeps();
    const out = await mirrorPhotos([target("A", 2), target("B", 1)], deps);
    expect(uploads.sort()).toEqual(["A/0.jpg", "A/1.jpg", "B/0.jpg"]);
    expect(out).toEqual([
      { id: "A", photosMirrored: 2, photosMirroredTs: "2026-07-16T00:00:00Z", fully: true, uploaded: 2 },
      { id: "B", photosMirrored: 1, photosMirroredTs: "2026-07-16T00:00:00Z", fully: true, uploaded: 1 },
    ]);
  });
});

describe("mirrorPhotos — resume never re-downloads a mirrored prefix", () => {
  it("skips indices below the prior prefix (same ts)", async () => {
    const { deps, downloads } = fakeDeps();
    const out = await mirrorPhotos(
      [target("A", 4, "T1", { priorMirrored: 2, priorMirroredTs: "T1" })],
      deps,
    );
    // Only photos 2 and 3 are (re)fetched — 0 and 1 are already in storage.
    expect(downloads.map((u) => u.split("?")[0])).toEqual([
      "https://media.mlsgrid.com/A/2",
      "https://media.mlsgrid.com/A/3",
    ]);
    expect(out[0]).toMatchObject({ photosMirrored: 4, fully: true });
  });
});

describe("mirrorPhotos — budget bound (serverless safety)", () => {
  it("mirrors only up to the photo budget and reports fully:false", async () => {
    const { deps, uploads } = fakeDeps();
    const out = await mirrorPhotos([target("A", 5), target("B", 5)], deps, { photoBudget: 3 });
    expect(uploads.length).toBe(3); // A:0, B:0, A:1 (covers-first)
    const a = out.find((o) => o.id === "A")!;
    const b = out.find((o) => o.id === "B")!;
    expect(a.photosMirrored).toBe(2); // A:0 + A:1
    expect(a.fully).toBe(false);
    expect(b.photosMirrored).toBe(1); // B:0
    expect(b.fully).toBe(false);
  });
});

describe("mirrorPhotos — 429 backoff", () => {
  it("retries a 429 and succeeds, sleeping between attempts", async () => {
    // First attempt on A/0 → 429, second → 200. Everything else 200 first try.
    const { deps, uploads, sleeps } = fakeDeps({
      downloadStatus: (url, attempt) => (url.includes("/A/0") && attempt === 0 ? 429 : 200),
    });
    const out = await mirrorPhotos([target("A", 1)], deps, { maxRetries: 3 });
    expect(uploads).toEqual(["A/0.jpg"]);
    expect(sleeps.length).toBe(1); // one backoff before the retry
    expect(out[0]).toMatchObject({ photosMirrored: 1, fully: true });
  });

  it("gives up after maxRetries and leaves the prefix short (contiguous)", async () => {
    // A/1 always 429; A/0 and A/2 succeed → contiguous prefix stops at 1.
    const { deps } = fakeDeps({ downloadStatus: (url) => (url.includes("/A/1") ? 429 : 200) });
    const out = await mirrorPhotos([target("A", 3)], deps, { maxRetries: 1 });
    expect(out[0].photosMirrored).toBe(1); // only A/0 counts — the prefix is contiguous
    expect(out[0].fully).toBe(false);
  });

  it("does not retry a permanent 404", async () => {
    const { deps, downloads } = fakeDeps({ downloadStatus: () => 404 });
    await mirrorPhotos([target("A", 1)], deps, { maxRetries: 3 });
    expect(downloads.length).toBe(1); // no retries on 404
  });
});

describe("isImagePayload — a 2xx is not proof of a photo", () => {
  const TEXT = new TextEncoder().encode("Request limit reached");

  it("rejects the media host's text/plain rate-limit body", () => {
    expect(isImagePayload("text/plain", TEXT)).toBe(false);
  });

  it("rejects that body even when it is served WITHOUT a content-type", () => {
    expect(isImagePayload(undefined, TEXT)).toBe(false);
  });

  it("rejects an image/jpeg label over a non-image body", () => {
    expect(isImagePayload("image/jpeg", TEXT)).toBe(false);
  });

  it("rejects an empty or truncated payload", () => {
    expect(isImagePayload("image/jpeg", new Uint8Array(0))).toBe(false);
    expect(isImagePayload("image/jpeg", new Uint8Array([0xff, 0xd8, 0xff]))).toBe(false);
  });

  it("accepts a real JPEG, PNG and WebP", () => {
    expect(isImagePayload("image/jpeg", JPEG)).toBe(true);
    expect(isImagePayload("image/png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 0, 0, 0, 13]))).toBe(true);
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]);
    expect(isImagePayload("image/webp", webp)).toBe(true);
  });

  it("rejects a RIFF container that is not WebP (a WAV, not a photo)", () => {
    const wav = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45]);
    expect(isImagePayload("image/webp", wav)).toBe(false);
  });

  it("accepts a valid JPEG that the host mislabelled", () => {
    expect(isImagePayload("application/octet-stream", JPEG)).toBe(false); // declared non-image wins
    expect(isImagePayload("", JPEG)).toBe(true); // no declaration → trust the bytes
  });
});

describe("mirrorPhotos — a disguised rate limit never becomes a photo", () => {
  /** THE ROUND-16 DEADLOCK: the media host returned 200 + "Request limit reached" as text/plain,
   * mirrorPhotos uploaded it as a .jpg, Storage refused it (400 invalid_mime_type), so `fully`
   * never went true and the sync cron held its watermark — for seven days. */
  const rateLimitBody = () => ({
    bytes: new TextEncoder().encode("Request limit reached"),
    contentType: "text/plain",
  });

  it("does not upload a 200 that carries a text/plain body", async () => {
    const { deps, uploads } = fakeDeps({ payload: rateLimitBody });
    const out = await mirrorPhotos([target("A", 2)], deps, { maxRetries: 0 });
    expect(uploads).toEqual([]); // nothing poisoned the bucket
    expect(out[0]).toMatchObject({ photosMirrored: 0, fully: false, uploaded: 0 });
  });

  it("treats it as retryable — it backs off like a 429 rather than accepting it", async () => {
    const { deps, downloads, sleeps } = fakeDeps({ payload: rateLimitBody });
    await mirrorPhotos([target("A", 1)], deps, { maxRetries: 2 });
    expect(downloads.length).toBe(3); // initial + 2 retries
    expect(sleeps).toEqual([500, 1000]); // exponential backoff, same as a real 429
  });

  it("recovers on the retry that finally returns a real photo", async () => {
    let n = 0;
    const { deps, uploads } = fakeDeps({
      payload: () => (n++ === 0 ? rateLimitBody() : { bytes: JPEG, contentType: "image/jpeg" }),
    });
    const out = await mirrorPhotos([target("A", 1)], deps, { maxRetries: 3 });
    expect(uploads).toEqual(["A/0.jpg"]);
    expect(out[0]).toMatchObject({ photosMirrored: 1, fully: true });
  });
});

describe("mirrorPhotos — circuit breaker on a refusing media host", () => {
  it("stops early once nothing at all is getting through", async () => {
    const { deps, downloads } = fakeDeps({ downloadStatus: () => 429 });
    await mirrorPhotos([target("A", 50), target("B", 50)], deps, { maxRetries: 0, failFastAfter: 5 });
    // Without the breaker this would attempt all 100. It gives up shortly after the threshold
    // (in-flight workers finish their current item).
    expect(downloads.length).toBeLessThan(20);
    expect(downloads.length).toBeGreaterThanOrEqual(5);
  });

  it("does NOT trip while photos are still succeeding", async () => {
    // Every other photo fails, so failures never run consecutively past the threshold.
    const { deps, uploads } = fakeDeps({
      downloadStatus: (url) => (Number(url.split("/").pop()?.split("?")[0]) % 2 === 1 ? 429 : 200),
    });
    // Threshold above the concurrency: up to 3 failures can land before the first success
    // resolves, and that must not be mistaken for "nothing is getting through".
    const out = await mirrorPhotos([target("A", 10)], deps, { maxRetries: 0, failFastAfter: 5 });
    expect(uploads.length).toBe(5); // all five even-indexed photos still mirrored
    expect(out[0].photosMirrored).toBe(1); // contiguous prefix stops at the first gap
  });

  it("is disabled by failFastAfter: 0", async () => {
    const { deps, downloads } = fakeDeps({ downloadStatus: () => 429 });
    await mirrorPhotos([target("A", 30)], deps, { maxRetries: 0, failFastAfter: 0 });
    expect(downloads.length).toBe(30); // every photo attempted
  });
});

describe("mirrorPhotos — upload failure stops the prefix", () => {
  it("does not count a photo whose upload failed", async () => {
    const { deps } = fakeDeps({ uploadOk: (path) => path !== "A/1.jpg" });
    const out = await mirrorPhotos([target("A", 3)], deps);
    expect(out[0].photosMirrored).toBe(1); // A/0 ok, A/1 upload failed → prefix stops
    expect(out[0].fully).toBe(false);
  });
});

describe("mirrorPhotos — already fully mirrored is a no-op", () => {
  it("does no work when the prior prefix already covers the set", async () => {
    const { deps, downloads } = fakeDeps();
    const out = await mirrorPhotos(
      [target("A", 3, "T1", { priorMirrored: 3, priorMirroredTs: "T1" })],
      deps,
    );
    expect(downloads.length).toBe(0);
    expect(out[0]).toMatchObject({ photosMirrored: 3, fully: true, uploaded: 0 });
  });
});
