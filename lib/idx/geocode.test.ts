import { describe, expect, it } from "vitest";
import {
  addrKey,
  censusCsvRow,
  haversineMeters,
  MAX_ZIP_KM,
  parseCensusBatch,
  parseSourceAddress,
  rejectReason,
  retryStreet,
  withoutUnit,
} from "./geocode";

/** A Census addressbatch response line. Every field is quoted; the coordinate is "lng,lat"; the
 * second field is Census echoing the address it was sent. */
const line = (
  id: string,
  match: string,
  exactness: string,
  coord: string,
  matched = "7 FERRIS LN",
  asked = "7 Ferris Lane, Poughkeepsie, NY, 12601",
) => `"${id}","${asked}","${match}","${exactness}","${matched}","${coord}","1","L"`;

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

  it("drops a unit list written with slashes (measured: Census places the building once it goes)", () => {
    expect(withoutUnit("81 Hill Street #1F/1R/2F/2R")).toBe("81 Hill Street");
    expect(withoutUnit("99-60 63rd Road #3A/A")).toBe("99-60 63rd Road");
  });
});

describe("retryStreet", () => {
  // Queens numbers a house "cross street - house" (37-20 Prince Street). The feed often drops
  // the hyphen, and Census answers No_Match for "3720 Prince Street"; asked with the hyphen
  // back, 33 of 38 such live rows matched Exact (2026-10-04).
  it.each([
    ["3720 Prince Street #1F", "11354", "37-20 Prince Street"],
    ["14814 97th Avenue", "11435", "148-14 97th Avenue"],
    ["5142 35th Street", "11101", "51-42 35th Street"],
    ["1678 Gates Avenue", "11385", "16-78 Gates Avenue"],
  ])("puts the dropped hyphen back in a Queens zip: %s", (address, zip, expected) => {
    expect(retryStreet(address, zip)).toBe(expected);
  });

  it("never re-hyphenates outside Queens, where a four-digit number is just a number", () => {
    expect(retryStreet("2286 Route 9W", "12477")).toBe("2286 Route 9W");
    // Gates Avenue runs through Brooklyn too, numbered the ordinary way.
    expect(retryStreet("1678 Gates Avenue", "11221")).toBe("1678 Gates Avenue");
    expect(retryStreet("1678 Gates Avenue", "")).toBe("1678 Gates Avenue");
  });

  it("leaves numbers that are not the dropped-hyphen shape alone", () => {
    expect(retryStreet("71-32 Little Neck Parkway #148B", "11426")).toBe("71-32 Little Neck Parkway");
    expect(retryStreet("188 Beach 115th Street", "11694")).toBe("188 Beach 115th Street");
    expect(retryStreet("Walnut Street", "11354")).toBe("Walnut Street");
  });

  it("is withoutUnit when there is no hyphen to restore, so the retry filter still works", () => {
    expect(retryStreet("8 Knightsbridge #C", "10583")).toBe("8 Knightsbridge");
    expect(retryStreet("7 Ferris Lane", "12601")).toBe("7 Ferris Lane");
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

describe("rejectReason — rule A, a Non_Exact answer on another street", () => {
  // KEY1041042 "50 North Broadway #6H, White Plains" was placed at 50 S BROADWAY (round 66, 6b):
  // Census relaxed the directional, landed on the other half of Broadway, and the 15 km gate
  // cannot see a mistake that small.
  const WHITE_PLAINS = [41.0329, -73.7651];
  const rows = [{ id: "KEY1041042", address: "50 North Broadway #6H", city: "White Plains", state: "NY", zip: "10601" }];
  const answer = (exactness: string) =>
    parseCensusBatch(
      line(
        "KEY1041042",
        "Match",
        exactness,
        "-73.7660,41.0303",
        "50 S BROADWAY, WHITE PLAINS, NY, 10601",
        "50 North Broadway #6H, White Plains, NY, 10601",
      ),
      rows,
    ).hits[0];
  const asked = (street: string, matched: string, precision = "Non_Exact") => ({
    lat: 41.6885,
    lng: -73.9171,
    precision,
    askedAddress: `${street}, Poughkeepsie, NY, 12601`,
    matchedAddress: `${matched}, POUGHKEEPSIE, NY, 12601`,
  });

  it("refuses KEY1041042 and names both streets", () => {
    const why = rejectReason(answer("Non_Exact"), WHITE_PLAINS);
    expect(why).toMatch(/another street/);
    expect(why).toContain("50 North Broadway #6H");
    expect(why).toContain("50 S BROADWAY");
  });

  it("never checks an Exact answer", () => {
    expect(rejectReason(answer("Exact"), WHITE_PLAINS)).toBeNull();
  });

  it.each([
    ["7 North Ferris Lane", "7 N FERRIS LN"],
    ["30 West Fifth Avenue #2", "30 W 5TH AVE"],
    // The suffix is not the rule's business, only the directional and the name: the feed often
    // leaves it off ("8 Knightsbridge #C"), and TIGER names a route by its system.
    ["8 Knightsbridge", "8 KNIGHTSBRIDGE RD"],
    ["2286 Route 9W", "2286 US HWY 9W"],
  ])("accepts the same street written two ways: %s / %s", (street, matched) => {
    expect(rejectReason(asked(street, matched), POUGHKEEPSIE)).toBeNull();
  });

  it.each([
    // A directional on one side only is a difference: KEY1041042 is exactly a directional swap.
    ["50 Broadway", "50 S BROADWAY"],
    ["12 Smith Road", "12 SMYTH RD"],
  ])("refuses another street: %s / %s", (street, matched) => {
    expect(rejectReason(asked(street, matched), POUGHKEEPSIE)).toMatch(/another street/);
  });

  it("compares against the street that was SENT: a Queens retry asked with its hyphen back", () => {
    const queens = [{ id: "Q1", address: "3720 Prince Street #1F", city: "Flushing", state: "NY", zip: "11354" }];
    const sent = "37-20 Prince Street, Flushing, NY, 11354";
    const { hits } = parseCensusBatch(
      line("Q1", "Match", "Non_Exact", "-73.8301,40.7612", "37-20 PRINCE ST, FLUSHING, NY, 11354", sent),
      queens,
    );
    expect(hits[0].askedAddress).toBe(sent);
    expect(rejectReason(hits[0], [40.7682, -73.8274])).toBeNull();
  });
});

describe("rejectReason — rule B, a zip typo in the feed", () => {
  // Round 66 (6b, 6g): the 15 km gate refused the right building because the FEED's zip was the
  // typo (12545 for 12546, 11023 for 10023); the geocoder's matched address carries the right one.
  const CENTROIDS: Record<string, number[]> = {
    "12545": [41.7829, -73.6694],
    "12546": [41.948, -73.5233],
    "11023": [40.7989, -73.7337],
    "10023": [40.7759, -73.9826],
    "12401": [41.9875, -74.0103],
  };
  const centroidOf = (zip: string) => CENTROIDS[zip] ?? null;
  const millerton = (askedCity: string, lat = 41.9465, lng = -73.5251) => ({
    lat,
    lng,
    precision: "Exact",
    askedAddress: `12 Main Street, ${askedCity}, NY, 12545`,
    matchedAddress: "12 MAIN ST, MILLERTON, NY, 12546",
  });

  it("measures against the matched zip when the city agrees: 12545 for 12546", () => {
    expect(rejectReason(millerton("Millerton"), centroidOf("12545"), centroidOf)).toBeNull();
    expect(rejectReason(millerton(" millerton "), centroidOf("12545"), centroidOf)).toBeNull();
  });

  it("measures against the matched zip when the city agrees: 11023 for 10023, a Non_Exact on the same street", () => {
    const hit = {
      lat: 40.7779,
      lng: -73.979,
      precision: "Non_Exact",
      askedAddress: "1 West 72nd Street, New York, NY, 11023",
      matchedAddress: "1 W 72ND ST, NEW YORK, NY, 10023",
    };
    expect(rejectReason(hit, centroidOf("11023"), centroidOf)).toBeNull();
  });

  it("is off when the caller passes no centroid table", () => {
    expect(rejectReason(millerton("Millerton"), centroidOf("12545"))).toMatch(/km from its zip centroid/);
  });

  it("refuses when the matched city differs from the asked city", () => {
    expect(rejectReason(millerton("Millbrook"), centroidOf("12545"), centroidOf)).toMatch(/km from its zip centroid/);
  });

  it("refuses when the point is over 15 km from the matched zip's centroid too", () => {
    expect(rejectReason(millerton("Millerton", 42.2, -73.5), centroidOf("12545"), centroidOf)).toMatch(
      /km from its zip centroid/,
    );
  });

  it("changes nothing when the matched zip IS the asked zip (the five Kingston 12401 homes stay out)", () => {
    const kingston = {
      lat: 41.9875 + 15.5 / 111.32,
      lng: -74.0103,
      precision: "Exact",
      askedAddress: "705 Victory Street, Kingston, NY, 12401",
      matchedAddress: "705 VICTORY ST, KINGSTON, NY, 12401",
    };
    const before = rejectReason({ lat: kingston.lat, lng: kingston.lng, precision: "Exact" }, centroidOf("12401"));
    expect(before).toMatch(/km from its zip centroid/);
    expect(rejectReason(kingston, centroidOf("12401"), centroidOf)).toBe(before);
  });

  it("leaves an answer the old gate accepted accepted", () => {
    const plain = { lat: 41.6885, lng: -73.9171, precision: "Exact" };
    expect(rejectReason(plain, POUGHKEEPSIE, centroidOf)).toBeNull();
    const told = {
      ...plain,
      askedAddress: "7 Ferris Lane, Poughkeepsie, NY, 12601",
      matchedAddress: "7 FERRIS LN, POUGHKEEPSIE, NY, 12603",
    };
    expect(rejectReason(told, POUGHKEEPSIE, centroidOf)).toBeNull();
    expect(rejectReason({ ...told, precision: "Non_Exact" }, POUGHKEEPSIE, centroidOf)).toBeNull();
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
