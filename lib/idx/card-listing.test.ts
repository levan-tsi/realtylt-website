import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CARD_UNUSED, forCard } from "./card-listing";
import type { Listing } from "./types";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
// Code only: comments may name any field.
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

/** Every file a home-page card's listing reaches on the client (ListingCard and what it renders or
 * hands the listing to). lib/format.ts's listingStats takes a narrow type, so it cannot read more. */
const CARD_PATH = [
  "components/idx/ListingCard.tsx",
  "components/idx/CardPhotos.tsx",
  "components/idx/FavoriteButton.tsx",
  "components/idx/MlsImage.tsx",
  "components/idx/RailPager.tsx",
  "components/idx/DriftRail.tsx",
  "components/idx/DriftScroller.tsx",
  "components/idx/ResultSetScope.tsx",
  "lib/idx/listing-url.ts",
];

const listing = {
  id: "KEY1",
  price: 500000,
  address: "1 Main St",
  city: "Beacon",
  state: "NY",
  zip: "12508",
  county: "dutchess",
  beds: 3,
  baths: 2,
  sqft: 1800,
  propertyType: "Residential",
  status: "Active",
  description: "A long description no card shows.",
  features: ["Built 1920"],
  yearBuilt: 1920,
  highSchool: "Beacon High School",
  appliances: ["Dishwasher"],
  photos: ["/api/media/KEY1/0"],
  photoCount: 20,
  lat: 41.5,
  lng: -73.97,
  listOfficeName: "An Office",
  originatingSystem: "OneKey MLS",
  modificationTimestamp: "2026-09-25T00:00:00.000Z",
  listedAt: "2026-09-20T00:00:00.000Z",
  geocoded: true,
} as unknown as Listing;

describe("the card's listing (round 61: the home page's payload)", () => {
  it("no file on a card's path reads a field the card's listing leaves out", () => {
    for (const f of CARD_PATH) {
      const src = code(read(f));
      for (const k of [...CARD_UNUSED, "description", "features", "geocoded", "geocodeTried"]) {
        expect(new RegExp(`\\b${k}\\b`).test(src), `${f} reads "${k}"`).toBe(false);
      }
    }
  });

  it("keeps everything a card shows and drops the rest", () => {
    const c = forCard(listing) as unknown as Record<string, unknown>;
    for (const k of ["id", "price", "address", "city", "state", "zip", "county", "beds", "baths", "sqft", "propertyType", "status", "photos", "photoCount", "lat", "lng", "listOfficeName", "listedAt"]) {
      expect(c[k], k).toEqual((listing as unknown as Record<string, unknown>)[k]);
    }
    expect(c.description).toBe("");
    expect(c.features).toEqual([]);
    for (const k of ["yearBuilt", "highSchool", "appliances", "geocoded"]) expect(k in c, k).toBe(false);
    // The source listing is not touched (the page hands the same objects to other props).
    expect(listing.description).toBe("A long description no card shows.");
  });

  it("the home page hands both rails their listings through forCard", () => {
    const page = read("app/page.tsx");
    expect(page).toMatch(/<DriftRail listings=\{featured\.map\(forCard\)\}/);
    expect(page).toMatch(/<RailPager listings=\{fresh\.map\(forCard\)\}/);
  });
});
