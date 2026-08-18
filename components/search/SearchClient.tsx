"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/idx/ListingCard";
import { PRESS, PRESS_GROUP } from "@/components/ui/Button";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { LocationSuggest } from "@/components/search/LocationSuggest";
import { SaveSearchDialog } from "@/components/search/SaveSearchDialog";
import { useSaved } from "@/components/auth/SavedProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { pageWindow } from "@/lib/pagination";
import { boundsForCounty, SERVED_REGION } from "@/components/idx/county-bounds";
// "New Listings" quick-filter window (≤7 days, same as the card's "New" badge). Shared with
// the server render so both sides ask the feed the same question.
import { NEW_LISTING_DAYS } from "@/lib/idx/query";
import { SERVED_AREAS, SITE, type CountySlug } from "@/lib/site";
import { listingPath } from "@/lib/idx/listing-url";
import { saveResultSet } from "@/lib/idx/result-set";
import { SEARCH_PAGE_SIZE, VIEWPORT_PAGE_SIZE } from "@/lib/idx/types";
import type { Listing, MapBounds, MapPin } from "@/lib/idx/types";

// Official Google Maps when the key is configured (live-site parity); Leaflet/OSM
// fallback otherwise. NEXT_PUBLIC_ vars are inlined at build, so only one chunk loads.
const MapView = dynamic(
  () =>
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      ? import("@/components/idx/GoogleMapView")
      : import("@/components/idx/MapView"),
  {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-96 w-full place-items-center bg-mist text-sm text-stone">
      Loading map…
    </div>
  ),
});

/** Primary chips = the six Top-Areas counties (the areas we publish pages for), Orange first
 * to match the live site. The five NYC boroughs live behind the "NYC boroughs" expander below
 * as a PRESENTATION grouping only — since round 23 the default scope includes all eleven areas
 * (owner: "set as default to show all active listings on the map"), so the chips narrow, they
 * no longer gate. */
const COUNTY_CHIPS: CountySlug[] = ["orange", "dutchess", "westchester", "putnam", "rockland", "ulster"];
const BOROUGH_CHIPS: CountySlug[] = ["bronx", "brooklyn", "manhattan", "queens", "staten-island"];

interface ApiResult {
  listings: Listing[];
  total: number;
  page: number;
  totalPages: number;
  dataLastUpdated: string;
  fixtureMode: boolean;
}

/** What /api/idx/search returns AND what app/search/page.tsx hands us for the first paint —
 * the same shape from both sides on purpose. */
export type SearchPayload = ApiResult;

interface Filters {
  q: string;
  /** An EXACT city, set only by picking one from the suggest dropdown. `q` stays the typed
   * free-text search (a substring over address+city+zip+county); choosing "Beacon, NY" from a
   * list means the city Beacon, not every address containing the word. */
  city: string;
  county: string;
  priceMin: string;
  priceMax: string;
  bedsMin: string;
  bathsMin: string;
  sqftMin: string;
  propertyType: string;
  // ── "MORE" panel fields (live parity). Stored as strings like the other selects; empty = off.
  sqftMax: string;
  garageMin: string;
  garageMax: string;
  lotMin: string;
  lotMax: string;
  yearMin: string;
  yearMax: string;
  taxMax: string;
  /** Home type — RESO PropertySubType, grouped into the words a buyer uses. Empty = any. */
  homeType: string;
  // ── Feature toggles. Yes-only: nobody searches for "no basement". A listing whose feed
  // record omits the source field is excluded rather than matched (see lib/idx/fixture.ts).
  centralAir: boolean;
  basement: boolean;
  waterfront: boolean;
  firstFloorBed: boolean;
  eatInKitchen: boolean;
  washerDryer: boolean;
  formalDining: boolean;
  /** One toggle over two facts (public water AND public sewer) — "no well, no septic". */
  municipalUtilities: boolean;
  // ── Round-24 selects (owner: "drop down filters are still less"). Strings, empty = any.
  /** Heating fuel token (HEATING_VALUES in lib/idx/types.ts). */
  heating: string;
  /** Parking kind token (PARKING_VALUES). */
  parking: string;
  /** "Days on market" — listed within N days. A PAGE param the API route translates to its
   * newDays window (composing with quick=new by taking the smaller). */
  listedDays: string;
  /** Basement, one level deeper than the yes/no flag. ONE select (Any / Yes / Finished /
   * Walk-out) drives all three basement booleans, exactly one ever set. */
  basementFinished: boolean;
  basementWalkout: boolean;
  /** lotFeatures "Near Public Transit" — the commuter question his live site asks. */
  nearTransit: boolean;
  /** Round 24b (Zillow audit): keywords = websearch full text over the remarks; views = lotFeatures Views. */
  keywords: string;
  views: boolean;
  /** true = only listings with a mirrored cover photo (default off = include everything). */
  withPhotos: boolean;
  /** "For Rent" mode — rentals only, priced per month, sale $10k floor exempt. Default off =
   * the for-sale experience (rentals are excluded from it entirely). */
  rental: boolean;
  /** Count-line quick filter. "all" = every on-market status; "active" / "pending" narrow to
   * one status; "new" is a 7-day listed-within window. One control, four exclusive answers. */
  quick: "all" | "active" | "new" | "pending";
  sort: string;
  page: number;
  view: "grid" | "map";
}

/** Keys that live in the MORE panel — used for the active-count badge and the panel reset. */
const MORE_KEYS = ["sqftMin", "sqftMax", "garageMin", "garageMax", "lotMin", "lotMax", "yearMin", "yearMax", "taxMax", "homeType", "heating", "parking", "listedDays", "keywords"] as const;

/** The MORE panel's boolean toggles. Separate from MORE_KEYS because they count as active when
 * TRUE rather than when non-empty, and because toQuery emits them as `=1` or not at all — a
 * `centralAir=false` in the URL would be noise that also breaks the "is this the default?" read. */
const MORE_FLAGS = ["centralAir", "basement", "waterfront", "firstFloorBed", "eatInKitchen", "washerDryer", "formalDining", "municipalUtilities", "basementFinished", "basementWalkout", "nearTransit", "views"] as const;

/** Feature toggles, in the order they are offered. Labels are what a buyer would say, not the
 * RESO value underneath. Counts are active inventory measured 2026-08-06, and they are the
 * reason each one is here — a filter that cannot answer is worse than no filter.
 * Basement moved OUT of this list in round 24: it became a select (Any / Yes / Finished /
 * Walk-out) — four real answers is a dropdown, not a checkbox. */
const FEATURE_TOGGLES: { key: (typeof MORE_FLAGS)[number]; label: string }[] = [
  { key: "centralAir", label: "Central air" },        // 8,398
  { key: "firstFloorBed", label: "First-floor bedroom" },
  { key: "eatInKitchen", label: "Eat-in kitchen" },
  { key: "washerDryer", label: "Washer/dryer hookup" },   // 2,585
  { key: "formalDining", label: "Formal dining room" },   // 3,264
  { key: "municipalUtilities", label: "Municipal water and sewer" }, // no well, no septic
  { key: "nearTransit", label: "Near public transit" },   // 2,871 (round 24)
  { key: "views", label: "Scenic views" },                // 804 (round 24b, lotFeatures "Views")
  { key: "waterfront", label: "Waterfront or water access" }, // 206
];

// ── Round-24 select options. Tokens match HEATING_VALUES / PARKING_VALUES in lib/idx/types.ts;
// counts are in idx_round24_facet_columns.sql's header (measured in-surface before building).
const HEATING_OPTS = [
  { value: "natural-gas", label: "Natural gas" },
  { value: "oil", label: "Oil" },
  { value: "electric", label: "Electric" },
  { value: "propane", label: "Propane" },
  { value: "heat-pump", label: "Heat pump" },
];
const PARKING_OPTS = [
  { value: "attached", label: "Attached garage" },
  { value: "detached", label: "Detached garage" },
  { value: "driveway", label: "Driveway" },
  { value: "assigned", label: "Assigned spot" },
];
const LISTED_OPTS = [
  { value: "1", label: "Last 24 hours" },
  { value: "3", label: "Last 3 days" },
  { value: "7", label: "Last week" },
  { value: "14", label: "Last 2 weeks" },
  { value: "30", label: "Last month" },
  { value: "90", label: "Last 3 months" },
];

/** Home-type options. Values match HOME_TYPE_VALUES in lib/idx/types.ts, which maps each to the
 * RESO PropertySubType values it covers.
 *
 * `rentalOnly` exists because of a real bug this shipped with for one commit: "Apartment" was
 * offered on the FOR SALE search, where it can never return anything. Measured — Apartment is
 * 1,162 Rental and exactly 1 Residential, and the for-sale search excludes rentals outright
 * (EXCLUDE_RENTALS in db.ts), so every buyer who picked it got zero results, always. The
 * original count that justified the option (243, sampled) never split sale from rental. It is
 * real inventory, just rental inventory, so it moves rather than disappears. */
const HOME_TYPE_OPTS: { value: string; label: string; rentalOnly?: boolean }[] = [
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "coop", label: "Co-op" },
  { value: "multi-family", label: "Multi-family" },
  { value: "apartment", label: "Apartment", rentalOnly: true },
  { value: "manufactured", label: "Manufactured or mobile" },
];

const PRICE_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 3000].map(
  (k) => k * 1000,
);
const fmtK = (n: number) => (n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1000}K`);
// For-rent price ladder (monthly rent) + label — the sale ladder ($100K+) is useless for rentals.
const RENT_PRICE_STEPS = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 7500, 10000];
const fmtRent = (n: number) => `$${n.toLocaleString("en-US")}/mo`;

// ── "MORE" panel option steps (structured facts replicated from the feed).
const GARAGE_OPTS = [1, 2, 3, 4, 5];
const SQFT_OPTS = [750, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000];
const LOT_OPTS = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100]; // acres
const YEAR_OPTS = [1900, 1950, 1970, 1980, 1990, 2000, 2010, 2015, 2020, 2024];
const TAX_OPTS = [2500, 5000, 7500, 10000, 15000, 20000, 30000, 50000];
const fmtLot = (n: number) => (n < 1 ? `${n} ac` : `${n} ac`);

const TRUE_FLAGS = new Set(["1", "true", "on", "yes"]);

function fromParams(sp: URLSearchParams): Filters {
  const isRental = TRUE_FLAGS.has(sp.get("rental") ?? "");
  // A rental-only home type on a FOR SALE url is a ghost filter: the option is not in the
  // dropdown, so the select reads "Any home type" while the query still narrows to something
  // that can never match. Drop it here, at the single entry point, rather than in the control.
  const rawHomeType = sp.get("homeType") ?? "";
  const homeTypeOpt = HOME_TYPE_OPTS.find((o) => o.value === rawHomeType);
  return {
    q: sp.get("q") ?? "",
    city: sp.get("city") ?? "",
    county: sp.get("county") ?? "",
    priceMin: sp.get("priceMin") ?? "",
    priceMax: sp.get("priceMax") ?? "",
    bedsMin: sp.get("bedsMin") ?? "",
    bathsMin: sp.get("bathsMin") ?? "",
    sqftMin: sp.get("sqftMin") ?? "",
    propertyType: sp.get("propertyType") ?? "",
    sqftMax: sp.get("sqftMax") ?? "",
    garageMin: sp.get("garageMin") ?? "",
    garageMax: sp.get("garageMax") ?? "",
    lotMin: sp.get("lotMin") ?? "",
    lotMax: sp.get("lotMax") ?? "",
    yearMin: sp.get("yearMin") ?? "",
    yearMax: sp.get("yearMax") ?? "",
    taxMax: sp.get("taxMax") ?? "",
    homeType: homeTypeOpt && (!homeTypeOpt.rentalOnly || isRental) ? homeTypeOpt.value : "",
    centralAir: TRUE_FLAGS.has(sp.get("centralAir") ?? ""),
    basement: TRUE_FLAGS.has(sp.get("basement") ?? ""),
    waterfront: TRUE_FLAGS.has(sp.get("waterfront") ?? ""),
    firstFloorBed: TRUE_FLAGS.has(sp.get("firstFloorBed") ?? ""),
    eatInKitchen: TRUE_FLAGS.has(sp.get("eatInKitchen") ?? ""),
    washerDryer: TRUE_FLAGS.has(sp.get("washerDryer") ?? ""),
    formalDining: TRUE_FLAGS.has(sp.get("formalDining") ?? ""),
    municipalUtilities: TRUE_FLAGS.has(sp.get("municipalUtilities") ?? ""),
    // Round-24 selects — invalid tokens fall back to "any", mirroring parseFilterParams.
    heating: HEATING_OPTS.some((o) => o.value === sp.get("heating")) ? sp.get("heating")! : "",
    parking: PARKING_OPTS.some((o) => o.value === sp.get("parking")) ? sp.get("parking")! : "",
    listedDays: LISTED_OPTS.some((o) => o.value === sp.get("listedDays")) ? sp.get("listedDays")! : "",
    basementFinished: TRUE_FLAGS.has(sp.get("basementFinished") ?? ""),
    basementWalkout: TRUE_FLAGS.has(sp.get("basementWalkout") ?? ""),
    nearTransit: TRUE_FLAGS.has(sp.get("nearTransit") ?? ""),
    keywords: (sp.get("keywords") ?? "").slice(0, 80),
    views: TRUE_FLAGS.has(sp.get("views") ?? ""),
    withPhotos: TRUE_FLAGS.has(sp.get("withPhotos") ?? ""),
    rental: TRUE_FLAGS.has(sp.get("rental") ?? ""),
    // Default "active", mirroring parseSearchRequest — if these two disagreed the visitor would
    // get one set of homes in the HTML and a different set a beat later.
    quick: (["all", "new", "pending"] as const).includes(sp.get("quick") as never)
      ? (sp.get("quick") as "all" | "new" | "pending")
      : "active",
    sort: sp.get("sort") ?? "mixed",
    // Floored — a crafted ?page=2.7 would otherwise ride into the API and break its offset math.
    page: Math.max(1, Math.floor(Number(sp.get("page"))) || 1),
    // Live realtylt.com defaults /search to the hybrid list+map view.
    view: sp.get("view") === "grid" ? "grid" : "map",
  };
}

function toQuery(f: Filters, forApi: boolean): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (k === "view" && (forApi || v === "map")) continue; // hybrid (map) is the default view
    // `quick` never goes to the API verbatim (it's translated to newDays/status in the fetch),
    // and stays out of the URL when it's the default — which is now "active", so "all" is the
    // value that has to travel.
    if (k === "quick" && (forApi || v === "active")) continue;
    // withPhotos is a boolean flag — emit `withPhotos=1` when on, drop it entirely when off.
    if (k === "withPhotos") {
      if (v) sp.set("withPhotos", "1");
      continue;
    }
    // rental (For Rent mode) — same flag treatment so it round-trips in the URL + saved searches.
    if (k === "rental") {
      if (v) sp.set("rental", "1");
      continue;
    }
    // The MORE panel's feature toggles, same rule: `=1` when on, absent when off. Without this
    // they would fall through to the generic branch below and emit `centralAir=false`, because
    // `false` is neither "" nor null.
    if ((MORE_FLAGS as readonly string[]).includes(k)) {
      if (v) sp.set(k, "1");
      continue;
    }
    if (v === "" || v == null || (k === "page" && v === 1) || (k === "sort" && v === "mixed" && forApi === false))
      continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

/** Readable summary of the active filters — the save-search default name + its chip list.
 * A convenience name, so it favors the common (min-side) direction and stays terse. */
function describeFilters(f: Filters): { name: string; parts: string[] } {
  const county = SERVED_AREAS.find((c) => c.slug === f.county)?.name;
  const parts = [
    f.q && `“${f.q}”`,
    f.city && `${f.city}, NY`,
    county && `${county}, NY`,
    f.propertyType,
    f.bedsMin && `${f.bedsMin}+ bd`,
    f.bathsMin && `${f.bathsMin}+ ba`,
    f.priceMin && `${fmtK(+f.priceMin)}+`,
    f.priceMax && `under ${fmtK(+f.priceMax)}`,
    f.sqftMin && `${(+f.sqftMin).toLocaleString()}+ sqft`,
    f.sqftMax && `under ${(+f.sqftMax).toLocaleString()} sqft`,
    f.garageMin && `${f.garageMin}+ garage`,
    f.lotMin && `${f.lotMin}+ ac`,
    f.yearMin && `built ${f.yearMin}+`,
    f.taxMax && `tax under $${(+f.taxMax).toLocaleString()}`,
    f.quick === "new" && "new listings",
    // "active only" is the default now, so it is not something the visitor narrowed BY —
    // naming it here would put it in every saved search's title. Widening to every on-market
    // status is the choice worth recording.
    f.quick === "all" && "every status",
    f.quick === "pending" && "pending only",
    f.withPhotos && "with photos",
    HOME_TYPE_OPTS.find((o) => o.value === f.homeType)?.label.toLowerCase(),
    f.heating && `${HEATING_OPTS.find((o) => o.value === f.heating)?.label.toLowerCase()} heat`,
    PARKING_OPTS.find((o) => o.value === f.parking)?.label.toLowerCase(),
    f.listedDays && LISTED_OPTS.find((o) => o.value === f.listedDays)?.label.toLowerCase(),
    f.keywords && `says "${f.keywords}"`,
    f.basement && "basement",
    f.basementFinished && "finished basement",
    f.basementWalkout && "walk-out basement",
    ...FEATURE_TOGGLES.filter((t) => f[t.key]).map((t) => t.label.toLowerCase()),
  ].filter(Boolean) as string[];
  return { name: parts.length ? parts.join(" · ") : "All listings", parts };
}

/** Project the current page's listings to slim map pins — seeds the map's first paint (and its
 * initial fit) before the viewport-scoped, clustered fetch (mapFiltersQuery below) takes over. */
const toPin = (l: Listing): MapPin => ({
  id: l.id,
  price: l.price,
  lat: l.lat,
  lng: l.lng,
  address: l.address,
  city: l.city,
  zip: l.zip,
  beds: l.beds,
  baths: l.baths,
  office: l.listOfficeName,
  // Lets the map draw a Pending home differently from one you can still buy.
  status: l.status,
  // The pager's bound: photos_servable, carried on the card as photoCount — the same number
  // the card counter and the listing page print, so a popup can never promise a photo the
  // proxy cannot serve.
  photoCount: l.photoCount ?? Math.max(l.photosMirrored ?? 0, l.photos.length ? 1 : 0),
});

/** api-shaped filters (no page/pageSize) — the same `quick` → newDays/status translation the
 * results fetch below uses, shared with the map's viewport pin fetch so both ask /api/idx the
 * identical question and never drift into showing two different sets of homes. */
function apiFilterParams(f: Filters): URLSearchParams {
  const api = new URLSearchParams(toQuery(f, true));
  if (f.quick === "new") api.set("newDays", String(NEW_LISTING_DAYS));
  if (f.quick === "active") api.set("status", "Active");
  if (f.quick === "pending") api.set("status", "Pending");
  // "Days on market" is a PAGE param; the API speaks newDays. Composes with quick=new by
  // taking the smaller window — the same translation parseSearchRequest applies server-side,
  // so the HTML render and this fetch ask the identical question.
  if (f.listedDays) {
    api.delete("listedDays");
    const current = Number(api.get("newDays"));
    api.set("newDays", String(Math.min(+f.listedDays, Number.isFinite(current) && current > 0 ? current : Infinity)));
  }
  return api;
}

/** The PLACE part of the filters — what decides where the map should be looking. A change in
 * any of these refits the map (fitKey) and invalidates the old viewport box; everything else
 * (price, beds, status, paging, sort) refines WITHIN the place and leaves the viewport alone.
 * `rental` is here because For Rent is a different universe whose extent can differ entirely. */
const placeKey = (f: Filters) => `${f.county}|${f.city}|${f.q}|${f.rental}`;

/** Everything "Clear all filters" resets. Shared because the empty state exists in two places
 * now — the grid's full-width panel and the map view's results column, which keeps its map. */
const CLEARED_FILTERS = {
  q: "", city: "", county: "", priceMin: "", priceMax: "", bedsMin: "", bathsMin: "", sqftMin: "", propertyType: "",
  sqftMax: "", garageMin: "", garageMax: "", lotMin: "", lotMax: "", yearMin: "", yearMax: "", taxMax: "", withPhotos: false,
};

/* Live filter bar: slim uppercase text dropdowns (BED ▾ BATH ▾ PRICE ▾ …), no boxes. */
const selectCls =
  // These take the global mobile 16px floor (globals.css) like every other control. They used
  // to opt out of it via .rlt-compact-control, back when this row scrolled horizontally; since
  // round 24b stacked it into a grid, 16px measures clean at 390 and 320 and the opt-out was
  // only costing an iOS focus-zoom on every tap. Desktop still renders these at text-xs.
  "cursor-pointer border-0 bg-transparent py-2 text-xs font-bold uppercase tracking-[0.12em] text-stone transition-[color,border-color,background-color] duration-150 ease-out hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-river";

/* MORE-panel dropdowns are boxed (like live's) so min/max pairs read clearly. */
const panelSelectCls =
  "min-w-0 flex-1 cursor-pointer rounded-xl border border-line-strong bg-white px-2.5 py-2 text-sm text-ink-soft transition-[color,border-color,background-color] duration-150 ease-out hover:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-river";

export function SearchClient({ initial = null }: { initial?: SearchPayload | null }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => fromParams(new URLSearchParams(searchParams)));
  // `initial` is the server's answer to THIS url (app/search/page.tsx parsed the same query
  // through lib/idx/query#parseSearchRequest), so the first paint already has homes in it.
  const [result, setResult] = useState<ApiResult | null>(initial);
  const [state, setState] = useState<"loading" | "ready" | "error">(initial ? "ready" : "loading");
  // The place whose RESULTS are currently showing — the map's refit gate (fitKey). Updated
  // when a fetch LANDS, never when a filter is merely chosen, so the map refits with the new
  // place's pins already in hand rather than the old ones.
  const [resultPlace, setResultPlace] = useState(() => placeKey(filters));
  // The map's settled viewport, tagged with the place it was showing when it settled. The tag
  // is the validity check: a box captured over Dutchess must not scope a brand-new Queens
  // search (results would be Queens ∩ Dutchess-viewport = nothing) — a stale box simply goes
  // unused until the map refits and reports a fresh one.
  const [viewport, setViewport] = useState<{ place: string; qs: string } | null>(null);
  const placeRef = useRef(placeKey(filters));
  placeRef.current = placeKey(filters);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const onMapBounds = useCallback((b: MapBounds) => {
    const qs = `north=${b.north}&south=${b.south}&east=${b.east}&west=${b.west}`;
    const prev = viewportRef.current;
    if (prev && prev.place === placeRef.current && prev.qs === qs) return; // settle, no movement
    setViewport({ place: placeRef.current, qs });
    // A moved viewport is a new question — page 1 of it is the only honest answer. (This also
    // runs on the map's first settle, so a ?page=3 deep link resets once the map takes over:
    // that page belonged to the place-scoped list, which the map view no longer shows.)
    setFilters((f) => (f.page === 1 ? f : { ...f, page: 1 }));
  }, []);
  // A viewport that matches the CURRENT place scopes the grid (map view only — the grid view
  // has no map to agree with). This string is also the fetch effect's dependency.
  const activeViewportQs =
    filters.view === "map" && viewport && viewport.place === placeKey(filters) ? viewport.qs : null;
  const [saveOpen, setSaveOpen] = useState(false);
  const { saveSearch, signedIn, favorites, toggleFavorite } = useSaved();
  const { openSignIn, enabled: accountsEnabled } = useAuth();
  // Chip ↔ card highlight: clicking a map price chip scrolls to and highlights its card;
  // hovering/focusing a card highlights its chip. Shared so panel and map stay in sync.
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());
  // The map panel, so the MAP toggle can take a phone visitor to it — see the toggle's onClick.
  const mapPanelRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLUListElement>(null); // the scrollable results column (map view)
  const resultsTopRef = useRef<HTMLDivElement>(null); // sentinel above the results
  // NYC boroughs sit behind a secondary expander so the default view stays scoped to the six
  // Hudson Valley counties. Force it open when a borough is the active filter (e.g. a
  // ?county=brooklyn deep link from /who-we-are) so the active chip is always visible.
  const [boroughsOpen, setBoroughsOpen] = useState(false);
  const boroughActive = (BOROUGH_CHIPS as string[]).includes(filters.county);
  const showBoroughs = boroughsOpen || boroughActive;

  // "MORE" filters panel (garage / sqft / lot / year / tax + without-photos). Collapsed by
  // default; the button carries a count of the active advanced filters.
  const [moreOpen, setMoreOpen] = useState(false);
  const moreCount =
    MORE_KEYS.filter((k) => filters[k] !== "").length +
    MORE_FLAGS.filter((k) => filters[k]).length +
    (filters.withPhotos ? 1 : 0);
  // Any filter that narrows the default six-county set — so the count line reads "N found"
  // instead of "across the Hudson Valley" the moment a real filter is on (honest count).
  const hasActiveFilters =
    !!filters.q || !!filters.city || !!filters.county || filters.quick !== "active" || !!filters.priceMin || !!filters.priceMax ||
    !!filters.bedsMin || !!filters.bathsMin || !!filters.propertyType || moreCount > 0;

  const apply = useCallback((patch: Partial<Filters>) => {
    // Any filter change resets to page 1 unless the patch names a page (view toggle keeps it).
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  }, []);

  // Re-sync when the URL changes underneath us (header "Search Listings" click,
  // browser Back/Forward) — state only seeds from the URL once on mount otherwise.
  // Serialized comparison keeps our own URL writes from looping.
  useEffect(() => {
    const next = fromParams(new URLSearchParams(searchParams));
    setFilters((prev) => (toQuery(prev, false) === toQuery(next, false) ? prev : next));
  }, [searchParams]);

  // Deep link from the listing "Never miss a property" band: /search?county=…&saveSearch=1
  // opens the Save Search dialog once, prefilled from the (already-applied) county filter.
  const saveSearchTriggered = useRef(false);
  useEffect(() => {
    if (saveSearchTriggered.current) return;
    if (searchParams.get("saveSearch") === "1") {
      saveSearchTriggered.current = true;
      setSaveOpen(true);
      // Strip the trigger from the URL: Back/refresh remounts reset the ref, and a URL
      // still carrying saveSearch=1 would re-open the dialog on every return visit.
      const qs = new URLSearchParams(window.location.search);
      qs.delete("saveSearch");
      window.history.replaceState(null, "", `${window.location.pathname}${qs.size ? `?${qs}` : ""}`);
    }
  }, [searchParams]);

  // Reflect the committed filters into the URL — a post-commit effect (never updates the
  // Router mid-render) keyed on the serialized query, so it writes exactly once per real
  // change and can't loop with the re-sync effect above. Reads window.location directly to
  // avoid comparing against a stale searchParams closure.
  const filtersQs = toQuery(filters, false);
  useEffect(() => {
    const urlQs = toQuery(fromParams(new URLSearchParams(window.location.search)), false);
    // The native History API, not router.replace: /search is a dynamic route now (it renders
    // the first page of results on the server), so router.replace would re-run that DB query
    // for every chip and dropdown while the client is already fetching the same page itself.
    // Next syncs pushState/replaceState into useSearchParams, so the re-sync effect above and
    // any deep link still see the truth. Same URL, same no-new-history-entry behaviour, one
    // query instead of two.
    if (filtersQs !== urlQs)
      window.history.replaceState(null, "", `/search${filtersQs ? `?${filtersQs}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersQs]);

  // The server already ran the query behind the first render — refetching it on mount would
  // be a second identical round trip and would repaint the same cards. Every later filter
  // change falls through to the fetch below.
  const serverPage = useRef(initial != null);
  useEffect(() => {
    if (serverPage.current) {
      serverPage.current = false;
      return;
    }
    let cancelled = false;
    setState("loading");
    // apiFilterParams applies the same "New Listings" quick-filter → listed-within-N-days
    // translation parseSearchRequest uses server-side, so this fetch and the first server
    // render ask the same question. With a settled map viewport (map view), the grid is
    // SCOPED TO THE BOX and asks for a whole viewport in one page (VIEWPORT_PAGE_SIZE) —
    // round 23, after the owner caught page 2 of the county scope contradicting the map.
    const api = apiFilterParams(filters);
    if (activeViewportQs) {
      for (const [k, v] of new URLSearchParams(activeViewportQs)) api.set(k, v);
      api.set("pageSize", String(VIEWPORT_PAGE_SIZE));
    } else {
      api.set("pageSize", String(SEARCH_PAGE_SIZE));
    }
    const run = () =>
      fetch(`/api/idx/search?${api.toString()}`)
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<ApiResult>;
        })
        .then((data) => {
          if (cancelled) return;
          setResult(data);
          setResultPlace(placeKey(filters));
          setState("ready");
        })
        .catch(() => !cancelled && setState("error"));
    // Wheel-zooming settles once per step, and each settle moves the box — coalesce scoped
    // refetches the same way the pin fetcher does (its debounce is 400ms) so three quick
    // steps cost one grid query. Filter edits stay immediate.
    const t = setTimeout(run, activeViewportQs ? 350 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [filters, activeViewportQs]);

  // Respect reduced-motion for programmatic scrolls (design rule).
  const scrollBehavior = (): ScrollBehavior =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  // Chip → card: flag it active, MOVE KEYBOARD FOCUS into the matching card (so a keyboard user
  // who activates a chip lands on that listing), then bring it into view honoring reduced
  // motion. The scroll is scoped to the RESULTS PANEL alone — never the window. The old
  // scrollIntoView walked every scrollable ancestor, and scrolling the page mid-click moved
  // the map under the pointer: the click's own compatibility mousedown then landed on the map
  // div and read as an outside press, closing the popup the pointerdown had just pinned
  // (watched live on the preview — scrollY jumped 0 → 252 between pointerdown and mousedown).
  // On phones the panel is not a scroll container (the page is) and the map sits BELOW the
  // list, so scrolling there would drag the map out from under the open popup — skip it.
  const focusCard = useCallback((id: string) => {
    setActiveId(id);
    const li = cardRefs.current.get(id);
    li?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const panel = panelRef.current;
    if (!li || !panel || !panel.contains(li)) return;
    if (panel.scrollHeight <= panel.clientHeight || getComputedStyle(panel).overflowY === "visible") return;
    const lr = li.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const delta = lr.top < pr.top ? lr.top - pr.top : lr.bottom > pr.bottom ? lr.bottom - pr.bottom : 0;
    if (delta) panel.scrollTo({ top: panel.scrollTop + delta, behavior: scrollBehavior() });
  }, []);

  // RECORD THE SET THE VISITOR IS LOOKING AT, so a listing page can offer "next home" and mean
  // it. Written here because this is the only place the set is genuinely known — the listing page
  // is ISR-cached and shared, and cannot be told what search produced it. In map view the result
  // is the VIEWPORT set (up to VIEWPORT_PAGE_SIZE homes), so prev/next on a listing walks exactly
  // the homes he was looking at on the map — his "it saves those 150 and lets you go back and
  // forth". See lib/idx/result-set.ts for why this is not carried in the URL.
  useEffect(() => {
    if (!result?.listings.length) return;
    saveResultSet({
      items: result.listings.map((l) => ({ id: l.id, path: listingPath(l), address: l.address })),
      page: result.page,
      totalPages: result.totalPages,
      searchHref: `/search${window.location.search}`,
    });
  }, [result]);

  // Page change scrolls the results back to the top (live parity — paging never opens a page
  // mid-list). In map view the results column is its own scroll container; in grid view the
  // window scrolls, so bring the results region into view.
  const shownPageRef = useRef<number | null>(null);
  useEffect(() => {
    if (!result) return;
    // Fresh results always restart the column at the top, even when the page number didn't
    // change (a filter edit swaps the whole list under a scrolled panel).
    if (panelRef.current) panelRef.current.scrollTop = 0;
    const prev = shownPageRef.current;
    shownPageRef.current = result.page;
    // Only PAGING may move the viewport. The first results render must not: landing on
    // /search (or a ?page=3 deep link) should show the header and filter bar, not jump the
    // visitor past them — and a programmatic scroll also drags the keyboard tab sequence
    // into the middle of the card list.
    if (prev !== null && prev !== result.page) {
      resultsTopRef.current?.scrollIntoView({ block: "start", behavior: scrollBehavior() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const listings = result?.listings ?? [];
  // Seeds the map's first paint; the map itself takes over with a viewport-scoped, clustered
  // fetch (see filtersQuery below) once it settles. favorites in deps: hearting a card must
  // restyle its map chip live, not on the next listings change.
  const mapPins = useMemo(() => listings.map((l) => ({ ...toPin(l), saved: favorites.includes(l.id) })).filter((p) => p.lat && p.lng), [listings, favorites]);
  // What the map appends its own viewport bounds to for /api/idx/pins — same filters as the
  // results fetch, so panning the map never shows homes the active filters would exclude.
  const mapFiltersQuery = useMemo(() => apiFilterParams(filters).toString(), [filters]);
  // A chosen county frames its WHOLE real extent (county-bounds.ts) rather than whatever the
  // current results page happens to contain — so picking Queens actually shows Queens, and its
  // viewport fetch pulls every pin in it (label thinning is what keeps that renderable). A
  // free-text/city search has no predefined box and frames to its own result pins; NO place at
  // all frames the whole served region, Hudson Valley AND NYC, since the boroughs joined the
  // default scope (round 23) — seed pins alone are one page and could under-frame it.
  const mapInitialBounds = useMemo(
    () => (filters.county ? boundsForCounty(filters.county) : filters.city || filters.q ? null : SERVED_REGION),
    [filters.county, filters.city, filters.q],
  );

  // One card renderer for both branches — carries the ref (chip→card scroll) and the
  // hover/focus↔chip highlight. In grid view the highlight is harmless (no map).
  // `i` is only used to mark the first row's covers as priority: one of them IS the page's LCP
  // (Next logs the warning naming the exact image), and without it the browser treats the
  // headline photo as lazy work. Four covers the widest row we render (xl:grid-cols-4).
  const renderCard = (l: Listing, i: number) => (
    <li
      key={l.id}
      ref={(el) => {
        cardRefs.current.set(l.id, el);
      }}
      onMouseEnter={() => setActiveId(l.id)}
      onMouseLeave={() => setActiveId((cur) => (cur === l.id ? null : cur))}
      onFocus={() => setActiveId(l.id)}
      // min-w-0: a grid item defaults to min-width:auto, so the card's `truncate` address
      // (white-space:nowrap) sets the track's min-content width to the FULL string and the
      // whole grid grows past the viewport instead of the text ellipsing. Current feed data
      // tops out at a 42-char address so nothing overflows today, but one longer row would
      // break the page sideways on a phone.
      // No ring at all (owner: "instead of blue we don't have a line, it just moves little
      // up as it does now") — selecting from the map reproduces the card's own hover lift,
      // via the same `translate` property .lift transitions, so the motion is identical.
      className={`min-w-0 scroll-mt-4 rounded-2xl ${
        activeId === l.id
          ? "[&_article]:[translate:0_-4px] [&_article]:shadow-lift"
          : ""
      }`}
    >
      <ListingCard listing={l} variant="plain" priority={i < 4} />
    </li>
  );

  const renderChip = (slug: CountySlug) => {
    const area = SERVED_AREAS.find((c) => c.slug === slug)!;
    const active = filters.county === slug;
    return (
      <li key={slug}>
        <button
          type="button"
          aria-pressed={active}
          onClick={() => apply({ county: active ? "" : slug })}
          className={`rounded-xl px-3.5 py-2 text-[13px] ${PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
            active ? "bg-ink text-paper" : "bg-mist text-[#555555] hover:bg-[#e2e6ea] hover:text-ink"
          }`}
        >
          {area.name}, NY
        </button>
      </li>
    );
  };

  // Clear every MORE-panel field (the bar's quick filters are left untouched).
  const clearMore = () =>
    apply({
      sqftMin: "", sqftMax: "", garageMin: "", garageMax: "", lotMin: "", lotMax: "",
      yearMin: "", yearMax: "", taxMax: "", homeType: "", withPhotos: false,
      centralAir: false, basement: false, waterfront: false, firstFloorBed: false, eatInKitchen: false,
      washerDryer: false, formalDining: false, municipalUtilities: false,
      heating: "", parking: "", listedDays: "", basementFinished: false, basementWalkout: false, nearTransit: false,
      keywords: "", views: false,
    });

  // One labelled min→max row for the MORE panel.
  type NumKey = "sqftMin" | "sqftMax" | "garageMin" | "garageMax" | "lotMin" | "lotMax" | "yearMin" | "yearMax" | "taxMax";
  const rangeRow = (label: string, minKey: NumKey, maxKey: NumKey, opts: number[], fmt: (n: number) => string) => (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone">{label}</p>
      <div className="flex items-center gap-2">
        <select
          aria-label={`Minimum ${label.toLowerCase()}`}
          value={filters[minKey]}
          onChange={(e) => apply({ [minKey]: e.target.value } as Partial<Filters>)}
          className={panelSelectCls}
        >
          <option value="">No min</option>
          {opts.map((n) => (<option key={n} value={n}>{fmt(n)}</option>))}
        </select>
        <span aria-hidden className="shrink-0 text-[11px] uppercase tracking-wide text-stone">to</span>
        <select
          aria-label={`Maximum ${label.toLowerCase()}`}
          value={filters[maxKey]}
          onChange={(e) => apply({ [maxKey]: e.target.value } as Partial<Filters>)}
          className={panelSelectCls}
        >
          <option value="">No max</option>
          {opts.map((n) => (<option key={n} value={n}>{fmt(n)}</option>))}
        </select>
      </div>
    </div>
  );

  // One labelled single-choice cell for the MORE panel (round-24 dropdowns). The flex wrapper
  // is load-bearing for the same reason as Home type's: panelSelectCls is flex-1.
  type SelKey = "heating" | "parking" | "listedDays";
  const selectRow = (label: string, key: SelKey, anyLabel: string, opts: { value: string; label: string }[]) => (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone">{label}</p>
      <div className="flex">
        <select
          aria-label={label}
          value={filters[key]}
          onChange={(e) => apply({ [key]: e.target.value } as Partial<Filters>)}
          className={panelSelectCls}
        >
          <option value="">{anyLabel}</option>
          {opts.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
      </div>
    </div>
  );

  // Live's search page runs edge-to-edge on a ~20px gutter (results start at x=20, the map
  // reaches the right edge) — far wider than the site's 1250px chrome. Match that gutter and
  // let the split breathe, capped at 1600px so ultrawide screens don't stretch the cards.
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16 lg:px-5">
      {/* ── Filter bar */}
      <form
        role="search"
        aria-label="Listing filters"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          // Typing over a picked city and submitting means the typed text, not the old city.
          apply({ q: String(fd.get("q") ?? ""), city: "" });
        }}
        // gap-x-3 (was 4): at 1440 the action cluster missed the first row by a whisker and
        // the whole bar wrapped two lines tall — the owner's "unused empty big spots". The
        // trimmed gaps fit filters AND actions on one line, and content starts a row higher.
        className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border border-line bg-white px-3.5 py-2 ${
          moreOpen ? "rounded-t-2xl" : "rounded-2xl"
        }`}
      >
        {/* For Sale / For Rent — the two are separate universes (rentals never mix into for-sale
            counts). Switching clears the price + sale-type filters since their ladders differ. */}
        <div role="group" aria-label="Sale or rent" className={`flex shrink-0 overflow-hidden rounded-xl border border-line ${PRESS_GROUP}`}>
          {([["For Sale", false], ["For Rent", true]] as const).map(([label, isRent]) => {
            const active = filters.rental === isRent;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  filters.rental === isRent
                    ? undefined
                    : apply({
                        rental: isRent,
                        priceMin: "",
                        priceMax: "",
                        propertyType: "",
                        // Leaving For Rent with "Apartment" chosen would carry a filter into
                        // the sale search that can never match there, and the dropdown would
                        // not even show it. Clear it on the way out.
                        homeType:
                          !isRent && HOME_TYPE_OPTS.find((o) => o.value === filters.homeType)?.rentalOnly
                            ? ""
                            : filters.homeType,
                      })
                }
                className={`min-h-6 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-[color,border-color,background-color] duration-150 ease-out focus:outline-none focus-visible:outline-2 focus-visible:outline-river ${
                  active ? "bg-ink text-white" : "bg-white text-stone hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex min-w-36 grow basis-40 items-center gap-2">
          {/* Live prefixes the place field with a map pin. */}
          <svg aria-hidden viewBox="0 0 20 20" className="h-[18px] w-[18px] shrink-0 text-stone" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
            <path d="M10 17.5s5.5-4.9 5.5-9a5.5 5.5 0 1 0-11 0c0 4.1 5.5 9 5.5 9Z" />
            <circle cx="10" cy="8.4" r="2.1" />
          </svg>
          <label htmlFor="search-q" className="sr-only">
            Location: town, ZIP, or address
          </label>
          <LocationSuggest
            id="search-q"
            key={filters.city || filters.q}
            defaultValue={filters.city || filters.q}
            placeholder="Find a Place"
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink-soft transition-[color,border-color,background-color] duration-150 ease-out placeholder:text-stone hover:border-ink focus:border-ink focus:outline-none"
            /* PICKING a place is a different act from typing one. A county picks its first-class
               filter, a city picks an exact city, and a ZIP stays free text (search_hay covers
               it exactly anyway). Each clears the other two so the three can never stack. */
            onPick={(s) =>
              s.kind === "county" && s.county
                ? apply({ county: s.county, q: "", city: "" })
                : s.kind === "city"
                  ? apply({ city: s.q, q: "" })
                  : apply({ q: s.q, city: "" })
            }
          />
        </div>

        {/* On a phone these six sit in two aligned columns instead of wrapping ragged — measured
            before: Bed alone beside the place field, then Bath+Min Price, then Max Price+Sqft,
            then Type+More+Search, each row starting at a different x. `sm:contents` dissolves
            this wrapper from 640px up, so the desktop row is byte-identical to before. */}
        <div className="grid w-full grid-cols-2 items-center gap-x-4 sm:contents">
        <label htmlFor="f-beds" className="sr-only">Minimum beds</label>
        <select id="f-beds" value={filters.bedsMin} onChange={(e) => apply({ bedsMin: e.target.value })} className={selectCls}>
          <option value="">Bed</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}+ Bed</option>
          ))}
        </select>
        <label htmlFor="f-baths" className="sr-only">Minimum baths</label>
        <select id="f-baths" value={filters.bathsMin} onChange={(e) => apply({ bathsMin: e.target.value })} className={selectCls}>
          <option value="">Bath</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}+ Bath</option>
          ))}
        </select>
        <label htmlFor="f-priceMin" className="sr-only">Minimum price</label>
        <select id="f-priceMin" value={filters.priceMin} onChange={(e) => apply({ priceMin: e.target.value })} className={selectCls}>
          <option value="">Min Price</option>
          {(filters.rental ? RENT_PRICE_STEPS : PRICE_STEPS).map((p) => (
            <option key={p} value={p}>{filters.rental ? fmtRent(p) : `${fmtK(p)}+`}</option>
          ))}
        </select>
        <label htmlFor="f-priceMax" className="sr-only">Maximum price</label>
        <select id="f-priceMax" value={filters.priceMax} onChange={(e) => apply({ priceMax: e.target.value })} className={selectCls}>
          <option value="">Max Price</option>
          {(filters.rental ? RENT_PRICE_STEPS : PRICE_STEPS).map((p) => (
            <option key={p} value={p}>{filters.rental ? `Under ${fmtRent(p)}` : `Under ${fmtK(p)}`}</option>
          ))}
        </select>
        <label htmlFor="f-sqft" className="sr-only">Minimum square feet</label>
        <select id="f-sqft" value={filters.sqftMin} onChange={(e) => apply({ sqftMin: e.target.value })} className={selectCls}>
          <option value="">Sqft</option>
          {[1000, 1500, 2000, 2500, 3000].map((n) => (
            <option key={n} value={n}>{n.toLocaleString()}+ sqft</option>
          ))}
        </select>
        {/* Sale-type filter is meaningless in For-Rent mode (property_type is forced to Rental). */}
        {!filters.rental && (
          <>
            <label htmlFor="f-type" className="sr-only">Property type</label>
            <select id="f-type" value={filters.propertyType} onChange={(e) => apply({ propertyType: e.target.value })} className={selectCls}>
              <option value="">Type</option>
              <option value="Residential">Residential</option>
              <option value="Multi-Family">Multi-Family</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
            </select>
          </>
        )}
        </div>

        {/* The three actions travel together. MORE opens the panel, SEARCH commits the text
            field, SAVE SEARCH sets up the alert — and before this they could split across a
            wrap: at 1440 SAVE SEARCH sat alone on a second line under a full row, which reads
            as an accident rather than a decision. Grouped and pushed right, the bar is filters
            on the left and actions on the right at every width, and when they do wrap they
            wrap as one right-aligned cluster. */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:flex-nowrap">
        {/* MORE — advanced filters (garage / sqft / lot / year / tax + photos). Live parity. */}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls="more-panel"
          onClick={() => setMoreOpen((o) => !o)}
          className={`inline-flex items-center gap-1.5 py-2 text-xs font-bold uppercase tracking-[0.12em] ${PRESS} focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
            moreOpen || moreCount > 0 ? "text-ink" : "text-stone hover:text-ink"
          }`}
        >
          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 6.5h4M11 6.5h6M3 13.5h8M15 13.5h2" />
            <circle cx="9" cy="6.5" r="1.7" fill="currentColor" stroke="none" />
            <circle cx="13" cy="13.5" r="1.7" fill="currentColor" stroke="none" />
          </svg>
          More
          {moreCount > 0 && (
            <span className="grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold leading-none text-paper">
              {moreCount}
            </span>
          )}
        </button>

        {/* Search is the primary action and grows into the space on a phone; Save Search is
            secondary and reads that way now (it was a second identical black pill competing
            with it). Both carry the same 2px border so the two boxes are exactly the same
            height — the outline treatment is the site's existing secondary button, the one
            "Clear All Filters" already uses. */}
        <button
          type="submit"
          className={`grow rounded-xl border-2 border-ink bg-ink px-3 py-2 text-sm font-bold uppercase tracking-[0.1em] text-paper ${PRESS} hover:border-ink-soft hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river sm:grow-0`}
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setSaveOpen(true)}
          className={`inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm font-bold uppercase tracking-[0.1em] text-ink ${PRESS} hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`}
        >
          {/* Live pairs SAVE SEARCH with a bell, not a heart — the action sets up an alert
              for new matches, which is what a bell reads as (the heart means "favorite"
              and is already the card action). */}
          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.5 8.2a4.5 4.5 0 0 1 9 0c0 3.2.9 4.6 1.5 5.3H4c.6-.7 1.5-2.1 1.5-5.3Z" />
            <path d="M8.4 16a1.8 1.8 0 0 0 3.2 0" />
          </svg>
          Save Search
        </button>
        </div>
      </form>

      {/* ── MORE panel: advanced filters. In-flow (pushes results down) so it stays keyboard-
          friendly and overflow-safe at every width — cleaner than live's overlay; filters
          apply live (no "apply" step), a divergence noted in the parity file. */}
      {moreOpen && (
        <div id="more-panel" className="rounded-b-2xl border border-t-0 border-line bg-white px-4 py-5 sm:px-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={filters.withPhotos}
                onChange={(e) => apply({ withPhotos: e.target.checked })}
                className="h-4 w-4 shrink-0 accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
              />
              Only show homes with photos
            </label>
            {moreCount > 0 && (
              <button
                type="button"
                onClick={clearMore}
                className="text-xs font-bold uppercase tracking-[0.12em] text-stone underline underline-offset-4 transition-[color,border-color,background-color] duration-150 ease-out hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
              >
                Reset advanced
              </button>
            )}
          </div>

          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {/* Home type leads the panel: it is the coarsest cut anyone makes and the one the
                panel could not make at all until now. PropertyType (Residential / Land /
                Commercial) is a different, blunter question and stays on the bar — condos,
                co-ops and multi-families are ALL "Residential", which is exactly why this
                exists. */}
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone">Home type</p>
              {/* The flex wrapper is load-bearing: panelSelectCls is `flex-1`, which does
                  nothing outside a flex container, so a standalone select collapses to the
                  width of its longest option while every rangeRow select fills its column. */}
              <div className="flex">
                <select
                  aria-label="Home type"
                  value={filters.homeType}
                  onChange={(e) => apply({ homeType: e.target.value })}
                  className={panelSelectCls}
                >
                  <option value="">Any home type</option>
                  {HOME_TYPE_OPTS.filter((o) => !o.rentalOnly || filters.rental).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {rangeRow("Garage", "garageMin", "garageMax", GARAGE_OPTS, (n) => `${n}`)}
            {rangeRow("Square footage", "sqftMin", "sqftMax", SQFT_OPTS, (n) => n.toLocaleString())}
            {rangeRow("Lot size", "lotMin", "lotMax", LOT_OPTS, fmtLot)}
            {rangeRow("Year built", "yearMin", "yearMax", YEAR_OPTS, (n) => `${n}`)}
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone">Max annual tax</p>
              {/* Same flex wrapper, and this one is a pre-existing defect the new Home type
                  control inherited: at 1440 this select measured ~95px against its
                  neighbours' ~315px, which reads as a broken cell rather than a choice. */}
              <div className="flex">
                <select
                  aria-label="Maximum annual property tax"
                  value={filters.taxMax}
                  onChange={(e) => apply({ taxMax: e.target.value })}
                  className={panelSelectCls}
                >
                  <option value="">No max</option>
                  {TAX_OPTS.map((n) => (<option key={n} value={n}>${n.toLocaleString()}</option>))}
                </select>
              </div>
            </div>
            {/* Round-24 dropdowns (owner: "drop down filters are still less"). Each token is a
                generated column with measured inventory — idx_round24_facet_columns.sql. */}
            {selectRow("Days on market", "listedDays", "Any time", LISTED_OPTS)}
            {selectRow("Heating fuel", "heating", "Any heating", HEATING_OPTS)}
            {selectRow("Parking", "parking", "Any parking", PARKING_OPTS)}
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone">Basement</p>
              {/* ONE select drives three URL flags, exactly one ever set: "Yes" is the old
                  basement toggle (REAL_BASEMENT semantics), the deeper cuts are exact feed
                  values — Finished 6,545 · Walk-out 4,193, measured in-surface. */}
              <div className="flex">
                <select
                  aria-label="Basement"
                  value={filters.basementWalkout ? "walkout" : filters.basementFinished ? "finished" : filters.basement ? "yes" : ""}
                  onChange={(e) =>
                    apply({
                      basement: e.target.value === "yes",
                      basementFinished: e.target.value === "finished",
                      basementWalkout: e.target.value === "walkout",
                    })
                  }
                  className={panelSelectCls}
                >
                  <option value="">Any</option>
                  <option value="yes">Yes</option>
                  <option value="finished">Finished</option>
                  <option value="walkout">Walk-out</option>
                </select>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone">Keywords</p>
              {/* Zillow's Keywords box (round 24b): websearch full text over the listing
                  remarks — 99.8% of the surface carries them, so "pool" (3,388) and
                  "fireplace" (3,620) finally answer without a sync change. Applies on Enter
                  or when focus leaves; `key` resets the box when Reset advanced clears it. */}
              <div className="flex">
                <input
                  type="text"
                  aria-label="Keywords in the listing description"
                  key={filters.keywords}
                  defaultValue={filters.keywords}
                  placeholder={'Try "pool" or "fireplace"'}
                  maxLength={80}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      apply({ keywords: e.currentTarget.value });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value !== filters.keywords) apply({ keywords: e.target.value });
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-line-strong bg-white px-2.5 py-2 text-sm text-ink-soft transition-[color,border-color,background-color] duration-150 ease-out placeholder:text-stone hover:border-ink focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-river"
                />
              </div>
            </div>
          </div>

          {/* Features. Checkboxes rather than another rank of selects, because each is a yes/no
              question and a select that only ever says "Any / Yes" is a checkbox wearing a hat.
              Every one is backed by a generated boolean column and by real inventory — see
              supabase/migrations/idx_search_facet_columns.sql for the measured counts and for
              why Pool and Fireplace are NOT here (the feed carries neither as structured data;
              "pool" lives only in free text, where it also says "no pool" and "pool table"). */}
          <fieldset className="mt-6 border-t border-line pt-5">
            <legend className="sr-only">Features</legend>
            <p aria-hidden className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone">
              Features
            </p>
            <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {FEATURE_TOGGLES.map((t) => (
                <label key={t.key} className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={filters[t.key]}
                    onChange={(e) => apply({ [t.key]: e.target.checked })}
                    className="h-4 w-4 shrink-0 accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 flex justify-end border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className={`rounded-xl bg-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-paper ${PRESS} hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`}
            >
              {state === "ready" && result ? `View ${result.total.toLocaleString()} results` : "View results"}
            </button>
          </div>
        </div>
      )}

      {/* ── Area chips: the six Top-Areas counties up front; the NYC boroughs sit behind a
          secondary expander so the default view stays scoped to the Hudson Valley. */}
      <div className="mt-4">
        <ul className="flex flex-wrap items-center gap-2" aria-label="Filter by county">
          {COUNTY_CHIPS.map(renderChip)}
          <li>
            <button
              type="button"
              aria-expanded={showBoroughs}
              aria-controls="borough-chips"
              onClick={() => setBoroughsOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] ${PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
                boroughActive
                  ? "bg-ink text-paper"
                  : "border border-line-strong bg-white text-stone hover:border-ink hover:text-ink"
              }`}
            >
              NYC Boroughs
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className={`h-2.5 w-2.5 transition-transform duration-200 ${showBoroughs ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2.5 4.5 L6 8 L9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </li>
        </ul>
        {showBoroughs && (
          <ul id="borough-chips" className="mt-2 flex flex-wrap gap-2" aria-label="Filter by NYC borough">
            {BOROUGH_CHIPS.map(renderChip)}
          </ul>
        )}
      </div>

      {/* ── Result meta row — live: light gray strip, "N listings found" + quick filter left,
          Sort By + view toggle right */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-mist px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* This strip is a row of instruments — quick filter, sort, view — and the count was
              dressed exactly like them: small, bold, the same weight as a control label. It is
              the only CONTENT here, the answer the whole page exists to give, so it is set in
              the display face the rest of the site uses for anything that leads. Sized to the
              strip's existing height rather than above it: the owner's density target is three
              full rows of cards beside the map, and a headline row would eat one. */}
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-stone" role="status">
            {state === "loading" ? "Searching…" : state === "error" ? "" : (
              <>
                <strong className="font-display text-2xl font-light leading-none text-ink">
                  {(result?.total ?? 0).toLocaleString()}
                </strong>
                {/* Say what the number IS. Once the map has settled, the grid is scoped to its
                    viewport (round 23) and the honest label is "in this map area" — his exact
                    ask: "if you zoomed and there is 150 show 150 on the list". Before that,
                    the unfiltered view is Active-only, so calling 6,738 simply "listings
                    across the Hudson Valley" would read as the whole market when 11,611 are
                    on it. "active" is also the word on the control beside it, so the page
                    uses one vocabulary for one thing. */}
                <span className="text-ink">
                  {activeViewportQs ? "homes in this map area" : hasActiveFilters ? "listings found" : "active listings"}
                </span>
                {!hasActiveFilters && !activeViewportQs && <span>across the Hudson Valley and NYC</span>}
                {/* The map draws every home in view; the list carries a page of them. Without
                    this the two disagree in silence — the count says 400, the column holds 150,
                    and paging looks like it repeats the same homes. Naming the slice is the
                    whole fix: it says which homes these are and what the next page is for.
                    Only shown when there IS a remainder, so the common case stays quiet. */}
                {result && result.listings.length < result.total && (() => {
                  // The page SIZE, not this page's length — the last page is short, and using
                  // its length would slide the whole range backwards.
                  const size = activeViewportQs ? VIEWPORT_PAGE_SIZE : SEARCH_PAGE_SIZE;
                  const first = (result.page - 1) * size + 1;
                  return (
                    <span className="text-stone">
                      · showing {first.toLocaleString()}–{(first + result.listings.length - 1).toLocaleString()}
                    </span>
                  );
                })()}
              </>
            )}
          </p>
          {/* Quick filter. Four mutually exclusive answers, in the order someone actually asks
              them: everything, then only what is still buyable, then only what is fresh, then
              only what is already spoken for. They are not all the same KIND of question —
              "new" is a 7-day window, Active/Pending are a status — which is why the
              translation lives in one place (parseSearchRequest) that both the server render
              and the client fetch go through.
              Open Houses + Price Reduced stay omitted: our OneKey feed replicates neither the
              OpenHouse resource nor a price-drop field, and a filter that cannot answer is
              worse than no filter. */}
          {/* flex-wrap, and it is load-bearing at 320: this group grew from two answers to four
              last round, and four un-wrappable buttons ("All Listings / Active / New Listings /
              Pending") measure wider than a 320px viewport can hold, so /search pushed the whole
              document 22px sideways. Wrapping is the honest fix — the row is a set of peers, and
              a phone is allowed to stack them. */}
          <div role="group" aria-label="Quick filter" className="flex flex-wrap items-center gap-1">
            {([["all", "All Listings"], ["active", "Active"], ["new", "New Listings"], ["pending", "Pending"]] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                aria-pressed={filters.quick === val}
                onClick={() => apply({ quick: val })}
                className={`px-2 py-1.5 text-xs font-bold uppercase tracking-[0.1em] ${PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
                  filters.quick === val
                    ? "text-ink underline decoration-2 underline-offset-4"
                    : "text-stone hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Saved + Plan, moved here from the round-23 left rail (round 24b — owner: "add
              saved and plan next to pending... they look faar"). Same one-click destinations,
              now beside the controls the eye already reads; the rail's width went to the
              cards and the map. Plan keeps the ?quiz=1 entry ("click on things, popup quiz"). */}
          <span aria-hidden className="hidden h-4 w-px bg-line-strong sm:block" />
          <Link
            href="/saved"
            className={`relative inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-stone ${PRESS} hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            Saved
            {favorites.length > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold leading-none text-paper">
                {favorites.length > 99 ? "99+" : favorites.length}
              </span>
            )}
          </Link>
          <Link
            href="/plan?quiz=1"
            className={`inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-stone ${PRESS} hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="6" cy="19" r="2" />
              <circle cx="18" cy="5" r="2" />
              <path d="M8 19h6a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h1" />
            </svg>
            Plan
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
          <label htmlFor="f-sort" className="text-xs font-bold uppercase tracking-[0.12em] text-stone">
            Sort By
          </label>
          <select id="f-sort" value={filters.sort} onChange={(e) => apply({ sort: e.target.value })} className={selectCls}>
            <option value="mixed">Mixed</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <div role="group" aria-label="View" className={`flex overflow-hidden rounded-xl border border-line-strong ${PRESS_GROUP}`}>
            {(["grid", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={filters.view === v}
                onClick={() => {
                  apply({ view: v, page: filters.page });
                  // On a phone, MAP looked broken. The default view IS "map" already, and this
                  // branch deliberately puts the listings above the map so an arriving visitor
                  // sees homes rather than a field of pins — which means tapping MAP changed no
                  // state and moved nothing, while the map sat ~150 cards further down. The
                  // toggle promises a map, so it now delivers one. Desktop is untouched: there
                  // the map is already beside the results.
                  if (v !== "map" || typeof window === "undefined") return;
                  if (!window.matchMedia("(max-width: 1023px)").matches) return;
                  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  // A frame of slack so the panel exists when the view actually did change.
                  setTimeout(
                    () => mapPanelRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }),
                    60,
                  );
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-[color,border-color,background-color] duration-150 ease-out ${
                  filters.view === v ? "bg-ink text-paper" : "bg-white text-stone hover:text-ink"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll anchor — paging brings this back into view (see the page-change effect). */}
      <div ref={resultsTopRef} className="scroll-mt-4" aria-hidden />

      {/* 36 cards carry ~72 tab stops before the pager. Give keyboard and screen-reader
          visitors the standard way past a repeated block (WCAG 2.4.1); hidden until focused,
          same treatment as the layout's "Skip to content". */}
      {result && result.totalPages > 1 && listings.length > 0 && (
        <a
          href="#results-pages"
          className="sr-only focus:not-sr-only focus:mt-4 focus:inline-block focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          Skip results, go to pagination
        </a>
      )}

      {/* ── Results */}
      {state === "error" && filters.view !== "map" ? (
        // role=alert so the failure is announced; the status strip above stays blank rather
        // than repeating the message to screen readers twice.
        // MAP VIEW TAKES THE OTHER ROUTE (below, in the results column). This branch sat above
        // the map branch too, and it is the SAME trapdoor the empty state had: in map view the
        // grid refetches on every settle, so one failed request during an ordinary wheel-zoom
        // replaced the whole split — deleting a working map, drawn from its OWN endpoint
        // (/api/idx/pins), because a different endpoint failed. Reproduced with a settled
        // 77-marker map and a single aborted refetch.
        <div role="alert" className="mt-10 rounded-2xl border border-red-500/40 bg-red-500/5 p-10 text-center">
          <p className="text-xl font-light text-ink">Search is temporarily unavailable.</p>
          <p className="mt-2 text-sm text-stone">
            Try again in a moment, or call us at{" "}
            <a href={SITE.phoneHref} className="font-bold text-ink">{SITE.phone}</a> and we&rsquo;ll run it for you.
          </p>
        </div>
      ) : state === "loading" && !result ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="rlt-skeleton overflow-hidden rounded-2xl border border-line motion-reduce:animate-none">
              <div className="aspect-[3/2] bg-mist" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-28 rounded-full bg-mist" />
                <div className="h-4 w-40 rounded-full bg-mist" />
                <div className="h-3 w-32 rounded-full bg-mist" />
              </div>
            </li>
          ))}
        </ul>
      ) : listings.length === 0 && filters.view !== "map" ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-strong p-12 text-center">
          <p className="text-xl font-light text-ink">No homes match those filters.</p>
          <p className="mt-2 text-sm text-stone">Try widening a range or clearing a filter.</p>
          <button
            type="button"
            onClick={() => apply(CLEARED_FILTERS)}
            className={`mt-5 rounded-xl border-2 border-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-ink ${PRESS} hover:bg-ink hover:text-paper`}
          >
            Clear All Filters
          </button>
        </div>
      ) : filters.view === "map" ? (
        // Round 23, owner: "make those boxes 10% less and make map bigger to fill that
        // space, since we are adding map zoom in zoom out all listing feature". Now that the
        // grid is viewport-scoped, the map is the primary instrument and earns the width:
        // measured at 1440 the split goes 690/690 -> ~620/760 (cards -10%, map +10%), and the
        // tightened card (aspect 21/10 photo, slimmer body) brings three FULL rows into the
        // 756px panel where the old geometry fit two. lg (small laptops) keeps the old split —
        // two 300px cards need the width more than the map does there.
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[0.9fr_1.1fr] 2xl:grid-cols-[0.85fr_1.15fr]">
          <ul
            ref={panelRef}
            aria-label="Search results"
            aria-busy={state === "loading"}
            // pl/pt-1: the panel scroll-clips at its own edge, and the active card's 2px ring was
            // losing its left side and top line (owner-reported) — 4px of breathing room keeps
            // the ring whole. gap-y-4: denser rows, more listings in the first viewport.
            // The refetch dim used to SNAP to 60% and snap back — a state change announced by a
            // hard cut. rlt-view-in is the arrival from the GRID/MAP switch (globals.css); the
            // opacity transition is what makes "searching" read as the list waiting rather than
            // as the page flickering.
            className={`rlt-view-in grid content-start gap-5 transition-opacity duration-200 ease-out motion-reduce:transition-none sm:grid-cols-2 lg:max-h-[84vh] lg:gap-x-2.5 lg:gap-y-3 lg:overflow-y-auto lg:pb-1 lg:pl-1 lg:pr-2 lg:pt-1 ${state === "loading" ? "opacity-60" : ""}`}
          >
            {state === "error" ? (
              // THE MAP STAYS, part two. The failure belongs to the results column, not to the
              // page: the map draws from /api/idx/pins and is still holding a good viewport and
              // a good pin set, so deleting it because /api/idx/search returned nothing leaves
              // the visitor with no instrument AND no way to retry except a reload. Panning or
              // zooming re-fires the scoped fetch, which is the actual recovery.
              <li role="alert" className="col-span-full rounded-2xl border border-red-500/40 bg-red-500/5 p-8 text-center">
                <p className="text-lg font-light text-ink">The list is temporarily unavailable.</p>
                <p className="mt-2 text-sm text-stone">
                  The map is still live. Move it to try again, or call us at{" "}
                  <a href={SITE.phoneHref} className="font-bold text-ink">{SITE.phone}</a> and we&rsquo;ll run the search for you.
                </p>
              </li>
            ) : listings.length === 0 ? (
              // THE MAP STAYS. This branch used to live above the map view and replaced the
              // whole split with a "No homes match those filters" panel — so zooming into any
              // patch of ground with nothing for sale (a park, a reservoir, one block too far)
              // deleted the map mid-gesture and left the visitor with no way back out: the
              // instrument you need to fix the situation is the one that was removed. The empty
              // state belongs in the RESULTS column; the map keeps drawing, keeps its viewport,
              // and one scroll-back-out is the whole recovery.
              <li className="col-span-full rounded-2xl border border-dashed border-line-strong p-8 text-center">
                <p className="text-lg font-light text-ink">
                  {activeViewportQs ? "No homes in this map area." : "No homes match those filters."}
                </p>
                <p className="mt-2 text-sm text-stone">
                  {activeViewportQs
                    ? "Zoom out or move the map to see more homes."
                    : "Try widening a range or clearing a filter."}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => apply(CLEARED_FILTERS)}
                    className={`mt-5 rounded-xl border-2 border-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-ink ${PRESS} hover:bg-ink hover:text-paper`}
                  >
                    Clear All Filters
                  </button>
                )}
              </li>
            ) : (
              listings.map(renderCard)
            )}
          </ul>
          {/* Phone order matches live: the LISTINGS lead and the map follows them (live puts its
              map below the results too), so the first thing a phone visitor sees is homes rather
              than a field of pins. The view toggle is the map-first route. Desktop is unchanged:
              the map sticks beside the results column. */}
          <div
            ref={mapPanelRef}
            className="relative h-[55vh] overflow-hidden rounded-2xl border border-line lg:sticky lg:top-4 lg:h-[84vh]"
          >
            <MapView
              pins={mapPins}
              selectedId={activeId}
              onSelect={focusCard}
              onToggleSave={toggleFavorite}
              filtersQuery={mapFiltersQuery}
              favorites={favorites}
              initialBounds={mapInitialBounds}
              fitKey={resultPlace}
              onBoundsChange={onMapBounds}
            />
          </div>
        </div>
      ) : (
        <ul
          aria-label="Search results"
          aria-busy={state === "loading"}
          className={`rlt-view-in mt-8 grid gap-6 transition-opacity duration-200 ease-out motion-reduce:transition-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${state === "loading" ? "opacity-60" : ""}`}
        >
          {listings.map(renderCard)}
        </ul>
      )}

      {/* ── Pagination */}
      {result && result.totalPages > 1 && (
        <nav
          id="results-pages"
          tabIndex={-1}
          aria-label="Results pages"
          // The owner could not see this control at all: mist (#f3f5f8) sitting on white is a
          // 1.05:1 difference, so the panel and the page were the same colour, and the numbers
          // inside it were bare text. It reads as an object now — the same bordered-panel
          // language the filter bar and the cards use — with every number in a box of its own.
          className="mt-10 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-line bg-mist px-4 py-3 scroll-mt-4"
        >
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => apply({ page: filters.page - 1 })}
            className={`rounded-lg border border-line bg-white px-3 py-2 text-sm text-stone ${PRESS} hover:border-ink hover:bg-ink/10 hover:text-ink active:bg-ink/20 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`}
            aria-label="Previous page"
          >
            «
          </button>
          {/* Live realtylt.com pages in a run of six consecutive numbers with chevrons on
              either side — no "1 … 150" ellipsis. pageWindow() clamps the run inside the
              set; the row wraps rather than overflowing a 390px viewport on 3-digit pages. */}
          {/* The number you CLICKED goes black immediately, before the new page arrives.
              It used to key off result.page, so for the few hundred milliseconds the fetch
              took, nothing on screen acknowledged the click at all — the owner read that as
              the page being frozen. The results list is already marked aria-busy and dimmed
              while it catches up, so this is the one control saying "heard you". Hover is a
              light wash of the same black rather than white-on-mist, which was very nearly
              invisible on this panel. */}
          {pageWindow(result.page, result.totalPages).map((p) => (
            <button
              key={p}
              type="button"
              aria-current={p === filters.page ? "page" : undefined}
              aria-label={`Page ${p}`}
              onClick={() => apply({ page: p })}
              // Three states that cannot be mistaken for each other: a white box with a hairline
              // (clickable), a grey fill with a black edge (under the cursor), solid black
              // (where you are).
              className={`min-w-9 rounded-lg border px-2.5 py-2 text-sm ${PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river sm:px-3.5 ${
                p === filters.page
                  ? "border-ink bg-ink font-bold text-paper"
                  : "border-line bg-white text-ink-soft hover:border-ink hover:bg-ink/10 hover:text-ink active:bg-ink/20"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={filters.page >= result.totalPages}
            onClick={() => apply({ page: filters.page + 1 })}
            className={`rounded-lg border border-line bg-white px-3 py-2 text-sm text-stone ${PRESS} hover:border-ink hover:bg-ink/10 hover:text-ink active:bg-ink/20 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`}
            aria-label="Next page"
          >
            »
          </button>
        </nav>
      )}

      {result && (
        <MlsAttribution
          dataLastUpdated={result.dataLastUpdated}
          fixtureMode={result.fixtureMode}
          className="mt-10 border-t border-line pt-6"
        />
      )}

      {saveOpen && (
        (() => {
          const { name, parts } = describeFilters(filters);
          return (
            <SaveSearchDialog
              defaultName={name}
              summary={parts}
              signedIn={signedIn}
              accountsEnabled={accountsEnabled}
              onSave={(finalName) => void saveSearch(finalName, toQuery(filters, false))}
              onSignIn={() => openSignIn("signup")}
              onClose={() => setSaveOpen(false)}
            />
          );
        })()
      )}
    </div>
  );
}
