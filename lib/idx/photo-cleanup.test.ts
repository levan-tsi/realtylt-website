import { describe, expect, it, vi } from "vitest";
import { cleanupOffMarketPhotos, withoutMirrorMarker, type CleanupDeps } from "./photo-cleanup";

function fakeDeps(over: Partial<CleanupDeps> & { stale?: Array<{ id: string; servable: number }> } = {}) {
  const deleted: string[] = [];
  const cleared: string[] = [];
  const stale = over.stale ?? [
    { id: "A", servable: 3 },
    { id: "B", servable: 1 },
  ];
  const deps: CleanupDeps = {
    findStale: over.findStale ?? (async (n) => stale.slice(0, n)),
    listObjects: over.listObjects ?? (async (id) => [`${id}/0.jpg`, `${id}/1.jpg`]),
    deleteObjects:
      over.deleteObjects ??
      (async (keys) => {
        deleted.push(...keys);
        return keys.length;
      }),
    clearMarker:
      over.clearMarker ??
      (async (id) => {
        cleared.push(id);
        return true;
      }),
  };
  return { deps, deleted, cleared };
}

describe("withoutMirrorMarker", () => {
  it("removes every field that would make a returning listing skip its download", () => {
    const out = withoutMirrorMarker({
      id: "A",
      price: 1,
      photosMirrored: 30,
      photosMirroredTs: "T",
      photosMirroredCount: 30,
    });
    expect(out).toEqual({ id: "A", price: 1 });
  });

  it("does not mutate the input", () => {
    const src = { id: "A", photosMirrored: 4 };
    withoutMirrorMarker(src);
    expect(src.photosMirrored).toBe(4);
  });

  it("is a no-op on a listing that was never mirrored", () => {
    expect(withoutMirrorMarker({ id: "A" })).toEqual({ id: "A" });
  });
});

describe("cleanupOffMarketPhotos", () => {
  it("deletes the objects and clears the marker for each stale listing", async () => {
    const { deps, deleted, cleared } = fakeDeps();
    const r = await cleanupOffMarketPhotos(deps);
    expect(deleted).toEqual(["A/0.jpg", "A/1.jpg", "B/0.jpg", "B/1.jpg"]);
    expect(cleared).toEqual(["A", "B"]);
    expect(r).toMatchObject({ listings: 2, objects: 4, markersCleared: 2, failed: 0 });
  });

  it("clears the marker AFTER deleting, never before", async () => {
    const order: string[] = [];
    const { deps } = fakeDeps({
      stale: [{ id: "A", servable: 2 }],
      deleteObjects: async (k) => {
        order.push("delete");
        return k.length;
      },
      clearMarker: async () => {
        order.push("clear");
        return true;
      },
    });
    await cleanupOffMarketPhotos(deps);
    // A failed delete must leave photos WITH a marker that still describes them — the safe
    // direction. Clearing first would strand photos nobody counts.
    expect(order).toEqual(["delete", "clear"]);
  });

  it("still clears the marker when a listing has no objects left", async () => {
    const { deps, cleared } = fakeDeps({ stale: [{ id: "A", servable: 0 }], listObjects: async () => [] });
    const r = await cleanupOffMarketPhotos(deps);
    expect(cleared).toEqual(["A"]);
    expect(r.objects).toBe(0);
  });

  it("one failing listing does not abort the pass", async () => {
    const { deps } = fakeDeps({
      stale: [{ id: "A", servable: 1 }, { id: "B", servable: 1 }, { id: "C", servable: 1 }],
      listObjects: async (id) => {
        if (id === "B") throw new Error("storage hiccup");
        return [`${id}/0.jpg`];
      },
    });
    const r = await cleanupOffMarketPhotos(deps);
    expect(r).toMatchObject({ listings: 2, failed: 1 });
  });

  it("respects the budget — this is the only destructive path in the sync", async () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ id: `L${i}`, servable: 1 }));
    const findStale = vi.fn(async (n: number) => many.slice(0, n));
    const { deps } = fakeDeps({ stale: many, findStale });
    const r = await cleanupOffMarketPhotos(deps, 5);
    expect(findStale).toHaveBeenCalledWith(5);
    expect(r.listings).toBe(5);
  });

  it("does nothing at all with a zero or negative budget", async () => {
    const findStale = vi.fn();
    const { deps } = fakeDeps({ findStale });
    expect(await cleanupOffMarketPhotos(deps, 0)).toMatchObject({ listings: 0, objects: 0 });
    expect(findStale).not.toHaveBeenCalled();
  });
});
