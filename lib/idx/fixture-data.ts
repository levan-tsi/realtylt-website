/** Fixture listing data — ~60 OneKey-shaped sample listings across the six serviced counties.
 * Real town names, believable per-county prices (calibrated against the live-site captures:
 * Westchester skews $700k+, Ulster/Orange under $600k). Deterministic — safe for SSG.
 * SAMPLE DATA ONLY: office names are fictional; replaced by the live MLS Grid feed at launch. */

import type { CountySlug } from "@/lib/site";
import type { Listing, ListingStatus, PropertyType } from "./types";

interface Town {
  county: CountySlug;
  zip: string;
  lat: number;
  lng: number;
  note: string;
}

const TOWNS: Record<string, Town> = {
  // Dutchess
  Poughkeepsie: { county: "dutchess", zip: "12601", lat: 41.7004, lng: -73.921, note: "a short walk to the Walkway Over the Hudson and the Metro-North station" },
  Beacon: { county: "dutchess", zip: "12508", lat: 41.5048, lng: -73.9696, note: "minutes to Main Street galleries, Dia Beacon and the Metro-North line" },
  Fishkill: { county: "dutchess", zip: "12524", lat: 41.5354, lng: -73.899, note: "close to village shops with quick access to I-84 and Route 9" },
  "Wappingers Falls": { county: "dutchess", zip: "12590", lat: 41.5965, lng: -73.911, note: "near the village center and the Dutchess Rail Trail" },
  "Hyde Park": { county: "dutchess", zip: "12538", lat: 41.7842, lng: -73.9336, note: "up the road from the FDR estate and the Culinary Institute" },
  Rhinebeck: { county: "dutchess", zip: "12572", lat: 41.927, lng: -73.9126, note: "a bike ride from Rhinebeck village and the farmers market" },
  "Red Hook": { county: "dutchess", zip: "12571", lat: 41.9951, lng: -73.8754, note: "surrounded by orchards and farm stands in northern Dutchess" },
  Pawling: { county: "dutchess", zip: "12564", lat: 41.562, lng: -73.6026, note: "near the Appalachian Trail with its own Metro-North stop" },
  Millbrook: { county: "dutchess", zip: "12545", lat: 41.7851, lng: -73.694, note: "in Dutchess horse country, minutes to the village and Millbrook Vineyards" },
  Lagrangeville: { county: "dutchess", zip: "12540", lat: 41.6494, lng: -73.7735, note: "in the Arlington school district with quick Taconic access" },
  // Westchester
  Yonkers: { county: "westchester", zip: "10701", lat: 40.9312, lng: -73.8988, note: "close to the revitalized waterfront and a 28-minute ride to Grand Central" },
  "White Plains": { county: "westchester", zip: "10601", lat: 41.034, lng: -73.7629, note: "near downtown dining and the White Plains Metro-North hub" },
  "New Rochelle": { county: "westchester", zip: "10801", lat: 40.9115, lng: -73.7824, note: "minutes to the Long Island Sound shore and downtown's new dining row" },
  Scarsdale: { county: "westchester", zip: "10583", lat: 41.0051, lng: -73.7846, note: "in the sought-after Scarsdale school district" },
  Tarrytown: { county: "westchester", zip: "10591", lat: 41.0762, lng: -73.8587, note: "blocks from the Hudson riverfront and the Tarrytown Music Hall" },
  Ossining: { county: "westchester", zip: "10562", lat: 41.1626, lng: -73.8615, note: "with Hudson River views and an easy express train to the city" },
  Peekskill: { county: "westchester", zip: "10566", lat: 41.2901, lng: -73.9204, note: "near the riverfront, the Paramount theater and the artists' district" },
  "Mount Kisco": { county: "westchester", zip: "10549", lat: 41.2043, lng: -73.7271, note: "walkable to town, the train and Leonard Park" },
  Chappaqua: { county: "westchester", zip: "10514", lat: 41.1598, lng: -73.7649, note: "on a quiet lane in the Chappaqua school district" },
  Katonah: { county: "westchester", zip: "10536", lat: 41.2587, lng: -73.6854, note: "near Katonah's village shops and the Harlem line" },
  // Putnam
  Carmel: { county: "putnam", zip: "10512", lat: 41.4301, lng: -73.6802, note: "overlooking Lake Gleneida countryside in the heart of Putnam" },
  Mahopac: { county: "putnam", zip: "10541", lat: 41.3723, lng: -73.7335, note: "moments from Lake Mahopac and its marinas" },
  Brewster: { county: "putnam", zip: "10509", lat: 41.3973, lng: -73.6171, note: "close to the Southeast train station and Route 22 conveniences" },
  "Cold Spring": { county: "putnam", zip: "10516", lat: 41.4201, lng: -73.9546, note: "a stroll from Cold Spring's Main Street and the Hudson Highlands trailheads" },
  Garrison: { county: "putnam", zip: "10524", lat: 41.3826, lng: -73.9471, note: "tucked into the Hudson Highlands across from West Point" },
  "Putnam Valley": { county: "putnam", zip: "10579", lat: 41.3979, lng: -73.8377, note: "on a wooded road near Lake Oscawana" },
  Patterson: { county: "putnam", zip: "12563", lat: 41.5137, lng: -73.6051, note: "bordering the Great Swamp preserve with Harlem line access" },
  Kent: { county: "putnam", zip: "10512", lat: 41.4634, lng: -73.7291, note: "in the Kent Lakes area near hiking and reservoirs" },
  // Rockland
  "New City": { county: "rockland", zip: "10956", lat: 41.1476, lng: -73.9893, note: "in the Clarkstown school district near High Tor State Park" },
  Nyack: { county: "rockland", zip: "10960", lat: 41.0909, lng: -73.9179, note: "blocks from downtown Nyack's shops, cafes and the riverfront" },
  Nanuet: { county: "rockland", zip: "10954", lat: 41.0887, lng: -74.0132, note: "near the Shops at Nanuet and the NJ Transit line" },
  Suffern: { county: "rockland", zip: "10901", lat: 41.1146, lng: -74.1496, note: "at the foot of the Ramapo Mountains with a direct train to Hoboken" },
  "Pearl River": { county: "rockland", zip: "10965", lat: 41.059, lng: -74.0218, note: "in walkable Pearl River near the Pascack line" },
  "Stony Point": { county: "rockland", zip: "10980", lat: 41.2298, lng: -73.9871, note: "near the Hudson shoreline and Harriman State Park trailheads" },
  Piermont: { county: "rockland", zip: "10968", lat: 41.0421, lng: -73.9182, note: "steps from the Piermont Pier and the village's restaurant row" },
  Congers: { county: "rockland", zip: "10920", lat: 41.1504, lng: -73.9452, note: "between Rockland Lake and Congers Lake" },
  Haverstraw: { county: "rockland", zip: "10927", lat: 41.1976, lng: -73.9646, note: "near the Hudson waterfront and the NY Waterway ferry to Ossining" },
  // Ulster
  Kingston: { county: "ulster", zip: "12401", lat: 41.927, lng: -73.9974, note: "in Kingston's historic districts between Uptown and the Rondout waterfront" },
  "New Paltz": { county: "ulster", zip: "12561", lat: 41.7476, lng: -74.0868, note: "with Shawangunk Ridge views near the rail trail and Mohonk lands" },
  Woodstock: { county: "ulster", zip: "12498", lat: 42.0409, lng: -74.1182, note: "a short drive to the village green and Overlook Mountain trailhead" },
  Saugerties: { county: "ulster", zip: "12477", lat: 42.0776, lng: -73.9529, note: "near the village, the lighthouse trail and HITS grounds" },
  Highland: { county: "ulster", zip: "12528", lat: 41.7204, lng: -73.9601, note: "minutes to the Walkway Over the Hudson's west gate and Mid-Hudson Bridge" },
  "Stone Ridge": { county: "ulster", zip: "12484", lat: 41.8534, lng: -74.144, note: "along the historic stone-house corridor of Route 209" },
  Marlboro: { county: "ulster", zip: "12542", lat: 41.6051, lng: -73.974, note: "among the orchards and wineries of the Marlboro hills" },
  Gardiner: { county: "ulster", zip: "12525", lat: 41.6837, lng: -74.1524, note: "under the Gunks with rail-trail access and mountain views" },
  Phoenicia: { county: "ulster", zip: "12464", lat: 42.0834, lng: -74.3135, note: "creekside in the Catskills near Belleayre and tubing on the Esopus" },
  // Orange
  Newburgh: { county: "orange", zip: "12550", lat: 41.5034, lng: -74.0104, note: "near Newburgh's waterfront restaurant row and the ferry to Beacon" },
  Middletown: { county: "orange", zip: "10940", lat: 41.4459, lng: -74.4229, note: "close to downtown's revival and the Heritage Trail" },
  Goshen: { county: "orange", zip: "10924", lat: 41.4021, lng: -74.3243, note: "near the historic Goshen village green and Legoland" },
  Warwick: { county: "orange", zip: "10990", lat: 41.2565, lng: -74.3599, note: "outside Warwick village among apple orchards and wineries" },
  Monroe: { county: "orange", zip: "10950", lat: 41.3306, lng: -74.1868, note: "near Round Lake and the Monroe woodlands" },
  "Cornwall-on-Hudson": { county: "orange", zip: "12520", lat: 41.4445, lng: -74.0163, note: "at the base of Storm King Mountain near the riverfront" },
  Montgomery: { county: "orange", zip: "12549", lat: 41.5276, lng: -74.2368, note: "close to the Wallkill and the village's antique shops" },
  Chester: { county: "orange", zip: "10918", lat: 41.3626, lng: -74.2712, note: "near Sugar Loaf's craft village and the Heritage Trail" },
  Washingtonville: { county: "orange", zip: "10992", lat: 41.4276, lng: -74.166, note: "minutes from Brotherhood Winery and Route 208" },
  "Highland Mills": { county: "orange", zip: "10930", lat: 41.3473, lng: -74.1252, note: "near Woodbury Common and the Highlands trails" },
};

type Style =
  | "colonial" | "farmhouse" | "ranch" | "cape" | "victorian" | "contemporary"
  | "craftsman" | "tudor" | "cottage" | "split" | "townhouse" | "multi";

const STYLE_TEXT: Record<Style, { label: string; body: string; features: string[] }> = {
  colonial: { label: "Center-hall colonial", body: "Sun-filled center-hall colonial with a classic layout — formal living and dining rooms, an eat-in kitchen that opens to the family room, and generous bedrooms upstairs.", features: ["Hardwood floors", "Eat-in kitchen", "Formal dining room", "Two-car garage"] },
  farmhouse: { label: "Modern farmhouse", body: "Updated farmhouse blending original character with modern systems — wide-plank floors, a farmhouse kitchen with butcher-block counters, and a rocking-chair front porch.", features: ["Wraparound porch", "Wide-plank floors", "Updated kitchen", "Barn/outbuilding"] },
  ranch: { label: "Ranch", body: "Easy one-level living in this well-kept ranch — open living and dining space, a bright kitchen, and a level yard that is made for summer evenings.", features: ["One-level living", "Full basement", "Level yard", "Attached garage"] },
  cape: { label: "Cape Cod", body: "Charming cape with flexible space — two bedrooms down and two up, a wood-burning fireplace in the living room, and a fenced backyard.", features: ["Wood-burning fireplace", "Fenced yard", "First-floor bedroom", "Storage shed"] },
  victorian: { label: "Victorian", body: "Painted-lady Victorian full of period detail — pocket doors, stained glass, high ceilings and a turret reading nook — with tasteful mechanical updates throughout.", features: ["Original millwork", "Stained glass", "High ceilings", "Rocking-chair porch"] },
  contemporary: { label: "Contemporary", body: "Light-drenched contemporary with walls of glass, vaulted ceilings and an open plan built for entertaining, plus a private primary suite with treetop views.", features: ["Vaulted ceilings", "Walls of glass", "Open floor plan", "Primary suite"] },
  craftsman: { label: "Craftsman bungalow", body: "Craftsman bungalow with the details intact — tapered porch columns, built-in cabinetry, a beamed dining room and a kitchen renovated in keeping with the era.", features: ["Built-ins", "Beamed ceilings", "Covered porch", "Renovated kitchen"] },
  tudor: { label: "Tudor", body: "Storybook brick-and-stucco Tudor with arched doorways, leaded windows and a slate roof, set on a landscaped lot on a quiet tree-lined street.", features: ["Slate roof", "Arched doorways", "Leaded glass", "Landscaped lot"] },
  cottage: { label: "Cottage", body: "Storybook cottage that lives larger than it looks — an updated kitchen, a sunroom overlooking the gardens, and a stone patio under mature trees.", features: ["Sunroom", "Stone patio", "Garden beds", "Updated bath"] },
  split: { label: "Split-level", body: "Spacious split-level with room to spread out — a fireplaced living room up, family room and office down, and a deck off the kitchen overlooking the backyard.", features: ["Family room", "Home office", "Deck", "Two-car garage"] },
  townhouse: { label: "Townhouse", body: "Move-in-ready townhouse with an open main level, a private patio, and community amenities — low-maintenance living close to everything.", features: ["Open main level", "Private patio", "Community pool", "Attached garage"] },
  multi: { label: "Multi-family", body: "Solid legal multi-family with separate utilities and strong rental history — live in one unit and let the others help with the mortgage, or add it straight to the portfolio.", features: ["Separate utilities", "Strong rental history", "Off-street parking", "Updated roof"] },
};

const OFFICES = [
  "Hudson Gate Realty",
  "River & Main Properties",
  "Valley Crest Realty",
  "Blue Door Homes NY",
  "Stonebridge Realty Group",
  "Highland & Co Real Estate",
  "Millpond Realty",
  "Palisade Point Realty",
  "Catskill Line Realty",
  "Harbor Hill Realty",
];

/** [town, street, price, beds, baths, sqft, style, flags]
 * flags: F featured · OH open house · P pending · CS coming soon (multi implied by style) */
type Row = [string, string, number, number, number, number, Style, string?];

const ROWS: Row[] = [
  // ── Dutchess (median ≈ $520k)
  ["Beacon", "24 Verplanck Ave", 585_000, 3, 2, 1_620, "craftsman", "F OH"],
  ["Poughkeepsie", "18 Garfield Pl", 425_000, 4, 2, 2_100, "victorian"],
  ["Poughkeepsie", "231 Mansion St", 389_000, 6, 3, 2_850, "multi"],
  ["Fishkill", "9 Broad St", 459_000, 3, 2, 1_540, "cape"],
  ["Wappingers Falls", "42 Losee Rd", 515_000, 4, 2.5, 2_240, "colonial"],
  ["Hyde Park", "11 Cardinal Rd", 489_000, 3, 2, 1_760, "ranch"],
  ["Rhinebeck", "88 Wynkoop Ln", 899_000, 4, 3, 2_780, "farmhouse", "F"],
  ["Red Hook", "356 Budds Corners Rd", 675_000, 4, 2.5, 2_420, "farmhouse"],
  ["Pawling", "31 Dutcher Ave", 549_000, 3, 2, 1_690, "cape", "OH"],
  ["Millbrook", "104 Stanford Rd", 1_150_000, 5, 3.5, 3_400, "colonial", "F"],
  ["Lagrangeville", "27 Skidmore Rd", 565_000, 4, 2.5, 2_300, "split"],
  // ── Westchester (median ≈ $900k+)
  ["Yonkers", "83 Shonnard Ter", 749_000, 5, 3, 2_640, "victorian"],
  ["Yonkers", "119 Elm St", 599_000, 6, 4, 3_050, "multi", "P"],
  ["White Plains", "45 Gedney Esplanade", 985_000, 4, 2.5, 2_460, "tudor"],
  ["New Rochelle", "72 Mount Joy Pl", 875_000, 4, 3, 2_580, "colonial", "OH"],
  ["Scarsdale", "19 Brookby Rd", 2_395_000, 6, 4.5, 4_450, "tudor", "F"],
  ["Tarrytown", "14 Riverview Ave", 1_195_000, 4, 3, 2_700, "victorian", "F"],
  ["Ossining", "8 Sherwood Ave", 685_000, 3, 2, 1_780, "cape"],
  ["Peekskill", "512 Simpson Pl", 549_000, 3, 1.5, 1_560, "craftsman"],
  ["Mount Kisco", "36 Crow Hill Rd", 1_425_000, 5, 3.5, 3_350, "contemporary"],
  ["Chappaqua", "22 Longview Dr", 1_695_000, 5, 4, 3_900, "colonial", "CS"],
  ["Katonah", "61 Valley Rd", 1_050_000, 4, 2.5, 2_520, "farmhouse"],
  // ── Putnam (median ≈ $600k)
  ["Carmel", "17 Fair St", 545_000, 4, 2.5, 2_180, "colonial"],
  ["Mahopac", "44 Lakeview Dr W", 619_000, 4, 3, 2_350, "split", "OH"],
  ["Brewster", "230 Milltown Rd", 515_000, 3, 2, 1_720, "ranch"],
  ["Cold Spring", "12 Paulding Ave", 869_000, 3, 2, 1_680, "victorian", "F"],
  ["Garrison", "77 Snake Hill Rd", 1_295_000, 4, 3.5, 3_150, "contemporary", "F"],
  ["Putnam Valley", "156 Wiccopee Rd", 479_000, 3, 2, 1_610, "cottage"],
  ["Patterson", "9 Cornwall Hill Rd", 435_000, 3, 1.5, 1_480, "cape"],
  ["Kent", "38 Towners Rd", 399_000, 3, 2, 1_520, "ranch", "P"],
  ["Mahopac", "6 Craft Ln", 725_000, 4, 2.5, 2_540, "colonial"],
  ["Brewster", "71 Oak St", 549_000, 4, 2, 1_980, "split"],
  // ── Rockland (median ≈ $800k)
  ["New City", "31 Twin Elms Ln", 799_000, 4, 2.5, 2_480, "colonial", "OH"],
  ["Nyack", "48 High Ave", 925_000, 4, 3, 2_360, "victorian", "F"],
  ["Nanuet", "14 Barrie Dr", 649_000, 3, 2, 1_740, "split"],
  ["Suffern", "22 Squire Hill Rd", 715_000, 4, 2.5, 2_280, "colonial"],
  ["Pearl River", "119 Henry St", 685_000, 3, 2, 1_680, "cape"],
  ["Stony Point", "8 Crickettown Rd", 599_000, 3, 2, 1_820, "ranch", "P"],
  ["Piermont", "410 Piermont Ave", 1_395_000, 3, 2.5, 2_240, "contemporary", "F"],
  ["Congers", "27 Lake Rd", 575_000, 3, 1.5, 1_540, "cape"],
  ["Haverstraw", "56 Hudson Ave", 529_000, 6, 3, 2_920, "multi"],
  ["New City", "5 Pine Glen Ct", 869_000, 5, 3, 2_760, "contemporary"],
  // ── Ulster (median ≈ $470k)
  ["Kingston", "104 W Chestnut St", 465_000, 4, 2, 2_050, "victorian", "OH"],
  ["Kingston", "37 Downs St", 349_000, 5, 2, 2_400, "multi"],
  ["New Paltz", "21 Mountain Rest Rd", 645_000, 4, 2.5, 2_260, "farmhouse", "F"],
  ["Woodstock", "45 Glasco Tpke", 725_000, 3, 2, 1_850, "contemporary", "F"],
  ["Saugerties", "18 Market St", 419_000, 3, 1.5, 1_560, "colonial"],
  ["Highland", "72 Vineyard Ave", 385_000, 3, 2, 1_490, "cape"],
  ["Stone Ridge", "3688 Main St", 589_000, 4, 2, 2_150, "farmhouse", "CS"],
  ["Marlboro", "29 Orchard Ln", 439_000, 3, 2, 1_620, "ranch"],
  ["Gardiner", "356 Bruynswick Rd", 519_000, 3, 2, 1_780, "cottage"],
  ["Phoenicia", "12 Ava Maria Dr", 329_000, 2, 1, 1_080, "cottage", "P"],
  // ── Orange (median ≈ $480k)
  ["Newburgh", "191 Montgomery St", 379_000, 5, 3, 2_680, "multi"],
  ["Newburgh", "14 Bayview Ter", 425_000, 4, 2, 1_980, "victorian", "OH"],
  ["Middletown", "36 Highland Ave", 359_000, 3, 1.5, 1_520, "colonial"],
  ["Goshen", "8 Murray Ave", 549_000, 4, 2.5, 2_240, "colonial"],
  ["Warwick", "27 Kings Hwy", 675_000, 4, 2.5, 2_420, "farmhouse", "F"],
  ["Monroe", "5 Heather Ct", 499_000, 3, 2, 1_760, "townhouse"],
  ["Cornwall-on-Hudson", "44 Duncan Ave", 619_000, 4, 2, 2_080, "craftsman", "F"],
  ["Montgomery", "112 Clinton St", 465_000, 3, 2, 1_690, "cape"],
  ["Chester", "19 Lehigh Ave", 445_000, 3, 2, 1_580, "ranch", "P"],
  ["Washingtonville", "31 Toleman Rd", 479_000, 4, 2.5, 2_060, "split"],
  ["Highland Mills", "7 Ridge Rd", 529_000, 4, 2.5, 2_180, "colonial", "OH"],
];

/** Newest listing date — fixture "now". Deterministic for SSG. */
const BASE = Date.UTC(2026, 6, 9, 14, 30, 0); // 2026-07-09T14:30:00Z
const DAY = 86_400_000;
const PHOTO_COUNT = 18;

function buildListing(row: Row, i: number): Listing {
  const [townName, street, price, beds, baths, sqft, style, flags = ""] = row;
  const town = TOWNS[townName];
  if (!town) throw new Error(`Unknown fixture town: ${townName}`);
  const s = STYLE_TEXT[style];
  const propertyType: PropertyType = style === "multi" ? "Multi-Family" : "Residential";
  const status: ListingStatus = flags.includes("P")
    ? "Pending"
    : flags.includes("CS")
      ? "Coming Soon"
      : "Active";

  // Deterministic pseudo-variation
  const listedAt = new Date(BASE - ((i * 37) % 60) * DAY - (i % 5) * 3_600_000);
  const modified = new Date(BASE - ((i * 13) % 48) * 3_600_000);
  const photoBase = (i * 7) % PHOTO_COUNT;
  const photos = [0, 5, 9, 13].map(
    (o) => `/images/listings/house-${String(((photoBase + o) % PHOTO_COUNT) + 1).padStart(2, "0")}.jpg`,
  );

  const acresish = propertyType === "Multi-Family" ? "" : ` Set on ${(0.2 + ((i * 17) % 140) / 100).toFixed(2)} acres, ${town.note}.`;
  const description = `${s.body}${acresish || ` Located ${town.note}.`}`;

  return {
    id: `H6${String(400001 + i * 97)}`,
    price,
    address: street,
    city: townName,
    state: "NY",
    zip: town.zip,
    county: town.county,
    beds,
    baths,
    sqft,
    propertyType,
    status,
    openHouse: flags.includes("OH") || undefined,
    description,
    features: [s.label, ...s.features],
    photos,
    lat: +(town.lat + (((i * 29) % 21) - 10) / 1000).toFixed(5),
    lng: +(town.lng + (((i * 31) % 21) - 10) / 1000).toFixed(5),
    listOfficeName: OFFICES[i % OFFICES.length],
    originatingSystem: "OneKey MLS",
    modificationTimestamp: modified.toISOString(),
    isFeatured: flags.includes("F") || undefined,
    listedAt: listedAt.toISOString(),
  };
}

export const FIXTURE_LISTINGS: Listing[] = ROWS.map(buildListing);
