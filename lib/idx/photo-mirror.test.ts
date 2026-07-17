import { describe, expect, it, vi } from "vitest";
import {
  buildQueue,
  mirrorPhotos,
  planRange,
  type MirrorDeps,
  type MirrorTarget,
} from "./photo-mirror";

/** Fake deps that record every download/upload and let a test script per-URL outcomes. */
function fakeDeps(opts: {
  downloadStatus?: (url: string, attempt: number) => number; // non-200 → failure
  uploadOk?: (path: string) => boolean;
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
      return { ok: true, status: 200, bytes: new Uint8Array([1, 2, 3]), contentType: "image/jpeg" };
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
