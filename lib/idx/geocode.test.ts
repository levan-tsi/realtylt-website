import { describe, expect, it } from "vitest";
import {
  addrKey,
  censusCsvRow,
  haversineMeters,
  MAX_ZIP_KM,
  parseCensusBatch,
  parseSourceAddress,
  rejectReason,
  withoutUnit,
} from "./geocode";

/** A Census addressbatch response line. Every field is quoted; the coordinate is "lng,lat". */
const line = (id: string, match: string, exactness: string, coord: string, matched = "7 FERRIS LN") =>
  `"${id}","7 Ferris Lane, Poughkeepsie, NY, 12601","${match}","${exactness}","${matched}","${coord}","1","L"`;

const POUGHKEEPSIE = [41.6946, -73.9164];

describe("addrKey", () => {
  // The SQL idx_addr_key() compares against this string to decide whether a stored geocode
  // still applies. If they ever disagree the merge silently declines EVERY geocode and the map
  // reverts to zip centroids with nothing failing, so the normalisation must be exact.
  it("is lowercase, single-spaced and trimmed", () => {
    expect(addrKey("  7   Ferris   Lane ", "12601")).toBe("7 ferris lane|12601");
  });

  it("separates the address from the zip so a shared prefix cannot collide", () => {
    expect(addrKey("7 Ferris", "Lane12601")).not.toBe(addrKey("7 Ferris Lane", "12601"));
  });

  it("survives a missing zip without throwing", () => {
    expect(addrKey("Van Wyck Street", undefined)).toBe("van wyck street|");
  });
});

describe("withoutUnit", () => {
  it.each([
    ["8 Knightsbridge #C", "8 Knightsbridge"],
    ["160 Academy Street Apt 3", "160 Academy Street"],
    ["12 Main St Unit 4B", "12 Main St"],
    ["5 Broad Street Suite 200", "5 Broad Street"],
  ])("drops the unit from %s", (input, expected) => {
    expect(withoutUnit(input)).toBe(expected);
  });

  it("leaves a plain street line alone, so the retry pass can tell there is nothing to retry", () => {
    expect(withoutUnit("7 Ferris Lane")).toBe("7 Ferris Lane");
  });
});

describe("censusCsvRow", () => {
  it("strips commas, which are the delimiter", () => {
    const row = { id: "K1", address: "7 Ferris Lane, Rear", city: "Poughkeepsie", state: "NY", zip: "12601" };
    expect(censusCsvRow(row).split(",")).toHaveLength(5);
  });

  it("asks with queryZip when the stored zip is one we do not serve", () => {
    // A live row carries Kingston NY stamped 43164, which is Ohio. Asking with it moves the
    // home 800km; asking with the city alone finds it.
    const row = { id: "K1", address: "705 Victory Street", city: "Kingston", state: "NY", zip: "43164", queryZip: "" };
    expect(censusCsvRow(row)).toBe("K1,705 Victory Street,Kingston,NY,");
  });
});

describe("parseCensusBatch", () => {
  const rows = [{ id: "K1", address: "7 Ferris Lane", city: "Poughkeepsie", state: "NY", zip: "12601" }];

  it("reads lng,lat in that order — reversing them lands the home in Kazakhstan", () => {
    const { hits } = parseCensusBatch(line("K1", "Match", "Exact", "-73.917154,41.688537"), rows);
    expect(hits[0]).toMatchObject({ id: "K1", lat: 41.688537, lng: -73.917154, precision: "Exact" });
  });

  it("carries an addrKey built from the row, so the write can be defended later", () => {
    const { hits } = parseCensusBatch(line("K1", "Match", "Exact", "-73.917154,41.688537"), rows);
    expect(hits[0].addrKey).toBe("7 ferris lane|12601");
  });

  it("treats No_Match as a miss", () => {
    const { hits, misses } = parseCensusBatch(line("K1", "No_Match", "", ""), rows);
    expect(hits).toHaveLength(0);
    expect(misses.map((m) => m.id)).toEqual(["K1"]);
  });

  it("treats 0,0 as a miss rather than a home in the Gulf of Guinea", () => {
    const { hits, misses } = parseCensusBatch(line("K1", "Match", "Exact", "0,0"), rows);
    expect(hits).toHaveLength(0);
    expect(misses).toHaveLength(1);
  });

  it("counts a row the response never mentioned as a miss, not a silent success", () => {
    const { hits, misses } = parseCensusBatch("", rows);
    expect(hits).toHaveLength(0);
    expect(misses.map((m) => m.id)).toEqual(["K1"]);
  });
});

describe("parseSourceAddress", () => {
  it("recovers the address and zip the geocode was measured for", () => {
    expect(parseSourceAddress("7 Ferris Lane, Poughkeepsie, NY 12601")).toEqual({
      address: "7 Ferris Lane",
      city: "Poughkeepsie",
      zip: "12601",
    });
  });

  it("keeps a comma that belongs to the street line", () => {
    expect(parseSourceAddress("7 Ferris Lane, Rear, Poughkeepsie, NY 12601")?.address).toBe("7 Ferris Lane, Rear");
  });

  it("returns null for anything not that shape, so the seed skips it instead of guessing", () => {
    expect(parseSourceAddress("Poughkeepsie NY")).toBeNull();
    expect(parseSourceAddress(undefined)).toBeNull();
  });
});

describe("rejectReason — the quality gate", () => {
  const near = { lat: 41.6885, lng: -73.9171, precision: "Exact" };

  it("accepts a coordinate near its own zip centroid", () => {
    expect(rejectReason(near, POUGHKEEPSIE)).toBeNull();
  });

  it("rejects the failure mode this gate exists for: a same-named street in another county", () => {
    // Census matching "Main Street" 60km away is the one way this geocoder goes badly wrong.
    const far = { lat: 42.25, lng: -73.9, precision: "Non_Exact" };
    expect(rejectReason(far, POUGHKEEPSIE)).toMatch(/km from its zip centroid/);
  });

  it("accepts right up to the limit and rejects past it", () => {
    const at = (km: number) => ({ lat: POUGHKEEPSIE[0] + km / 111.32, lng: POUGHKEEPSIE[1], precision: "Exact" });
    expect(rejectReason(at(MAX_ZIP_KM - 0.5), POUGHKEEPSIE)).toBeNull();
    expect(rejectReason(at(MAX_ZIP_KM + 0.5), POUGHKEEPSIE)).not.toBeNull();
  });

  it("rejects null island", () => {
    expect(rejectReason({ lat: 0, lng: 0, precision: "Exact" }, POUGHKEEPSIE)).toBe("null island");
  });

  it("rejects a coordinate outside the served region even when there is no zip to check", () => {
    expect(rejectReason({ lat: 34.05, lng: -118.24, precision: "ROOFTOP" }, null)).toBe(
      "outside the served region",
    );
  });

  it("without a zip centroid, demands a building-grade answer", () => {
    // 12 live rows carry no zip at all and were invisible on the map because of it. They can
    // still be placed — but only on a geocoder's best grade, never on a street-level guess.
    expect(rejectReason({ lat: 41.68, lng: -73.91, precision: "ROOFTOP" }, null)).toBeNull();
    expect(rejectReason({ lat: 41.68, lng: -73.91, precision: "RANGE_INTERPOLATED" }, null)).toBeNull();
    expect(rejectReason({ lat: 41.68, lng: -73.91, precision: "Non_Exact" }, null)).toMatch(/no zip centroid/);
    expect(rejectReason({ lat: 41.68, lng: -73.91, precision: null }, null)).toMatch(/no zip centroid/);
  });
});

describe("haversineMeters", () => {
  it("measures the owner's example: the old centroid pin was 729m from the real house", () => {
    // stored fake (zip centroid + jitter) vs the true rooftop of 7 Ferris Lane.
    expect(haversineMeters(41.69463441706988, -73.91640857874089, 41.6880796, -73.917071)).toBeCloseTo(729, -1);
  });

  it("is zero for a point against itself", () => {
    expect(haversineMeters(41.7, -73.9, 41.7, -73.9)).toBe(0);
  });
});
