import { describe, expect, it } from "vitest";
import { getCommittedSnapshot } from "./snapshot";

/** Guards the committed snapshot (data/mls-snapshot.json) — the production data source.
 * Encodes the restore contract: real six-county inventory, valid shape, and ZERO photo
 * URLs (signed media URLs expire in ~1h and must never be committed to the repo). */
describe("committed MLS snapshot", () => {
  const snap = getCommittedSnapshot();

  it("parses and carries the full six-county Active inventory", () => {
    expect(snap).not.toBeNull();
    expect(snap!.listings.length).toBeGreaterThan(5000);
    expect(Date.parse(snap!.syncedAt)).not.toBeNaN();
    const counties = new Set<string>(snap!.listings.map((l) => l.county));
    for (const c of ["westchester", "dutchess", "orange", "rockland", "ulster", "putnam"]) {
      expect(counties).toContain(c);
    }
  });

  it("contains no photo URLs at all (no signed/expiring media in the repo)", () => {
    for (const l of snap!.listings) {
      expect(l.photos).toEqual([]);
    }
  });

  it("every listing has the fields the site renders", () => {
    for (const l of snap!.listings) {
      expect(typeof l.id).toBe("string");
      expect(typeof l.price).toBe("number");
      expect(typeof l.listOfficeName).toBe("string");
      expect(Date.parse(l.modificationTimestamp)).not.toBeNaN();
    }
  });
});
