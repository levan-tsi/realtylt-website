"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/idx/ListingCard";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { LocationSuggest } from "@/components/search/LocationSuggest";
import { SaveSearchDialog } from "@/components/search/SaveSearchDialog";
import { useSaved } from "@/components/auth/SavedProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { pageWindow } from "@/lib/pagination";
// "New Listings" quick-filter window (≤7 days, same as the card's "New" badge). Shared with
// the server render so both sides ask the feed the same question.
import { NEW_LISTING_DAYS } from "@/lib/idx/query";
import { SERVED_AREAS, SITE, type CountySlug } from "@/lib/site";
import { SEARCH_PAGE_SIZE } from "@/lib/idx/types";
import type { Listing, MapPin } from "@/lib/idx/types";

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
 * to match the live site. The five NYC boroughs live behind the "NYC boroughs" expander below,
 * so the default /search stays scoped to the Hudson Valley — boroughs are still fully
 * searchable and deep-linkable (?county=brooklyn), just not front-and-center. */
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
  /** true = only listings with a mirrored cover photo (default off = include everything). */
  withPhotos: boolean;
  /** "For Rent" mode — rentals only, priced per month, sale $10k floor exempt. Default off =
   * the for-sale experience (rentals are excluded from it entirely). */
  rental: boolean;
  /** Count-line quick filter (live realtylt.com): "all" or "new" (listed ≤7 days). */
  quick: "all" | "new";
  sort: string;
  page: number;
  view: "grid" | "map";
}

/** Keys that live in the MORE panel — used for the active-count badge and the panel reset. */
const MORE_KEYS = ["sqftMin", "sqftMax", "garageMin", "garageMax", "lotMin", "lotMax", "yearMin", "yearMax", "taxMax"] as const;

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
    withPhotos: TRUE_FLAGS.has(sp.get("withPhotos") ?? ""),
    rental: TRUE_FLAGS.has(sp.get("rental") ?? ""),
    quick: sp.get("quick") === "new" ? "new" : "all",
    sort: sp.get("sort") ?? "mixed",
    page: Math.max(1, Number(sp.get("page")) || 1),
    // Live realtylt.com defaults /search to the hybrid list+map view.
    view: sp.get("view") === "grid" ? "grid" : "map",
  };
}

function toQuery(f: Filters, forApi: boolean): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (k === "view" && (forApi || v === "map")) continue; // hybrid (map) is the default view
    // `quick` never goes to the API verbatim (it's translated to newDays in the fetch), and
    // stays out of the URL when it's the default "all".
    if (k === "quick" && (forApi || v === "all")) continue;
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
    f.withPhotos && "with photos",
  ].filter(Boolean) as string[];
  return { name: parts.length ? parts.join(" · ") : "All listings", parts };
}

/** Project the current page's listings to slim map pins — the results map is PAGE-COUPLED
 * (owner's ask): it plots exactly these homes as price chips, swapping when the page does. */
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
  // The pager's bound: photos_servable, carried on the card as photoCount — the same number
  // the card counter and the listing page print, so a popup can never promise a photo the
  // proxy cannot serve.
  photoCount: l.photoCount ?? Math.max(l.photosMirrored ?? 0, l.photos.length ? 1 : 0),
});

/* Live filter bar: slim uppercase text dropdowns (BED ▾ BATH ▾ PRICE ▾ …), no boxes. */
const selectCls =
  // rlt-compact-control: keep the slim 12px size on a phone. The global mobile 16px floor
  // (globals.css, iOS focus-zoom) would turn this scrolling strip into a wall.
  "rlt-compact-control cursor-pointer border-0 bg-transparent py-2 text-xs font-bold uppercase tracking-[0.12em] text-stone transition-colors hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-river";

/* MORE-panel dropdowns are boxed (like live's) so min/max pairs read clearly. */
const panelSelectCls =
  "min-w-0 flex-1 cursor-pointer rounded-xl border border-line-strong bg-white px-2.5 py-2 text-sm text-ink-soft transition-colors hover:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-river";

export function SearchClient({ initial = null }: { initial?: SearchPayload | null }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => fromParams(new URLSearchParams(searchParams)));
  // `initial` is the server's answer to THIS url (app/search/page.tsx parsed the same query
  // through lib/idx/query#parseSearchRequest), so the first paint already has homes in it.
  const [result, setResult] = useState<ApiResult | null>(initial);
  const [state, setState] = useState<"loading" | "ready" | "error">(initial ? "ready" : "loading");
  const [saveOpen, setSaveOpen] = useState(false);
  const { saveSearch, signedIn, favorites, toggleFavorite } = useSaved();
  const { openSignIn, enabled: accountsEnabled } = useAuth();
  // Chip ↔ card highlight: clicking a map price chip scrolls to and highlights its card;
  // hovering/focusing a card highlights its chip. Shared so panel and map stay in sync.
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());
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
  const moreCount = MORE_KEYS.filter((k) => filters[k] !== "").length + (filters.withPhotos ? 1 : 0);
  // Any filter that narrows the default six-county set — so the count line reads "N found"
  // instead of "across the Hudson Valley" the moment a real filter is on (honest count).
  const hasActiveFilters =
    !!filters.q || !!filters.county || filters.quick === "new" || !!filters.priceMin || !!filters.priceMax ||
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
  // be a second identical round trip and would repaint the same 36 cards. Every later filter
  // change falls through to the fetch below.
  const serverPage = useRef(initial != null);
  useEffect(() => {
    if (serverPage.current) {
      serverPage.current = false;
      return;
    }
    let cancelled = false;
    setState("loading");
    // Search page shows a fuller 36-per-page grid (live parity); the "New Listings" quick
    // filter maps to a server-side listed-within-N-days filter.
    const api = new URLSearchParams(toQuery(filters, true));
    api.set("pageSize", String(SEARCH_PAGE_SIZE));
    if (filters.quick === "new") api.set("newDays", String(NEW_LISTING_DAYS));
    fetch(`/api/idx/search?${api.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<ApiResult>;
      })
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [filters]);

  // Respect reduced-motion for programmatic scrolls (design rule).
  const scrollBehavior = (): ScrollBehavior =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  // Chip → card: flag it active, MOVE KEYBOARD FOCUS into the matching card (so a keyboard user
  // who activates a chip lands on that listing), then scroll it into view honoring reduced
  // motion. Focusing the card's link also scrolls it (preventScroll lets our own scroll win).
  const focusCard = useCallback((id: string) => {
    setActiveId(id);
    const li = cardRefs.current.get(id);
    li?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    li?.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
  }, []);

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
  // Page-coupled map pins — exactly this page's located listings (owner's core ask).
  // favorites in deps: hearting a card must restyle its map chip live, not on the next
  // listings change.
  const mapPins = useMemo(() => listings.map((l) => ({ ...toPin(l), saved: favorites.includes(l.id) })).filter((p) => p.lat && p.lng), [listings, favorites]);

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
          ? "[&_article]:[translate:0_-4px] [&_article]:shadow-[0_18px_40px_-18px_rgb(16_24_32/0.35)]"
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
          className={`rounded-xl px-3.5 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
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
      yearMin: "", yearMax: "", taxMax: "", withPhotos: false,
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
        className={`mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border border-line bg-white px-4 py-2 ${
          moreOpen ? "rounded-t-2xl" : "rounded-2xl"
        }`}
      >
        {/* For Sale / For Rent — the two are separate universes (rentals never mix into for-sale
            counts). Switching clears the price + sale-type filters since their ladders differ. */}
        <div role="group" aria-label="Sale or rent" className="flex shrink-0 overflow-hidden rounded-xl border border-line">
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
                    : apply({ rental: isRent, priceMin: "", priceMax: "", propertyType: "" })
                }
                className={`min-h-6 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-river ${
                  active ? "bg-ink text-white" : "bg-white text-stone hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex min-w-40 grow basis-44 items-center gap-2">
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
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink-soft transition-colors placeholder:text-stone hover:border-ink focus:border-ink focus:outline-none"
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
        <div className="flex w-full flex-wrap items-center gap-3 sm:ml-auto sm:w-auto sm:flex-nowrap">
        {/* MORE — advanced filters (garage / sqft / lot / year / tax + photos). Live parity. */}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls="more-panel"
          onClick={() => setMoreOpen((o) => !o)}
          className={`inline-flex items-center gap-1.5 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
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
          className="grow rounded-xl border-2 border-ink bg-ink px-4 py-2 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:border-ink-soft hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river sm:grow-0"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setSaveOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-white px-4 py-2 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
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
                className="text-xs font-bold uppercase tracking-[0.12em] text-stone underline underline-offset-4 transition-colors hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
              >
                Reset advanced
              </button>
            )}
          </div>

          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {rangeRow("Garage", "garageMin", "garageMax", GARAGE_OPTS, (n) => `${n}`)}
            {rangeRow("Square footage", "sqftMin", "sqftMax", SQFT_OPTS, (n) => n.toLocaleString())}
            {rangeRow("Lot size", "lotMin", "lotMax", LOT_OPTS, fmtLot)}
            {rangeRow("Year built", "yearMin", "yearMax", YEAR_OPTS, (n) => `${n}`)}
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone">Max annual tax</p>
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

          <div className="mt-6 flex justify-end border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
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
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
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
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-mist px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm text-stone" role="status">
            {state === "loading" ? "Searching…" : state === "error" ? "" : (
              <strong className="font-bold text-ink">
                {(result?.total ?? 0).toLocaleString()} listings
                {hasActiveFilters ? " found" : " across the Hudson Valley"}
              </strong>
            )}
          </p>
          {/* Quick filter (live: "All Listings ˅"). Open Houses + Price Reduced are omitted —
              our OneKey feed doesn't replicate the OpenHouse resource or a price-drop field. */}
          <div role="group" aria-label="Quick filter" className="flex items-center gap-1">
            {([["all", "All Listings"], ["new", "New Listings"]] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                aria-pressed={filters.quick === val}
                onClick={() => apply({ quick: val })}
                className={`px-2 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
                  filters.quick === val
                    ? "text-ink underline decoration-2 underline-offset-4"
                    : "text-stone hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
          <div role="group" aria-label="View" className="flex overflow-hidden rounded-xl border border-line-strong">
            {(["grid", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={filters.view === v}
                onClick={() => apply({ view: v, page: filters.page })}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
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
      {state === "error" ? (
        // role=alert so the failure is announced; the status strip above stays blank rather
        // than repeating the message to screen readers twice.
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
            <li key={i} className="animate-pulse overflow-hidden rounded-2xl border border-line">
              <div className="aspect-[3/2] bg-mist" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-28 rounded-full bg-mist" />
                <div className="h-4 w-40 rounded-full bg-mist" />
                <div className="h-3 w-32 rounded-full bg-mist" />
              </div>
            </li>
          ))}
        </ul>
      ) : listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-strong p-12 text-center">
          <p className="text-xl font-light text-ink">No homes match those filters.</p>
          <p className="mt-2 text-sm text-stone">Try widening a range or clearing a filter.</p>
          <button
            type="button"
            onClick={() =>
              apply({
                q: "", city: "", county: "", priceMin: "", priceMax: "", bedsMin: "", bathsMin: "", sqftMin: "", propertyType: "",
                sqftMax: "", garageMin: "", garageMax: "", lotMin: "", lotMax: "", yearMin: "", yearMax: "", taxMax: "", withPhotos: false,
              })
            }
            className="mt-5 rounded-xl border-2 border-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Clear All Filters
          </button>
        </div>
      ) : filters.view === "map" ? (
        // Owner round 13d sized the map up; 13e trimmed it back ~15% each way ("listing
        // boxes little bigger, map little smaller") — an even split at xl, the map barely
        // ahead on very wide screens. Cards stay 2:1/compact so three rows keep landing.
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-2 2xl:grid-cols-[1fr_1.1fr]">
          <ul
            ref={panelRef}
            aria-label="Search results"
            aria-busy={state === "loading"}
            // pl/pt-1: the panel scroll-clips at its own edge, and the active card's 2px ring was
            // losing its left side and top line (owner-reported) — 4px of breathing room keeps
            // the ring whole. gap-y-4: denser rows, more listings in the first viewport.
            className={`grid content-start gap-5 sm:grid-cols-2 lg:max-h-[84vh] lg:gap-x-2.5 lg:gap-y-3 lg:overflow-y-auto lg:pb-1 lg:pl-1 lg:pr-2 lg:pt-1 ${state === "loading" ? "opacity-60" : ""}`}
          >
            {listings.map(renderCard)}
          </ul>
          {/* Phone order matches live: the LISTINGS lead and the map follows them (live puts its
              map below the results too), so the first thing a phone visitor sees is homes rather
              than a field of pins. The view toggle is the map-first route. Desktop is unchanged:
              the map sticks beside the results column. */}
          <div className="relative h-[55vh] overflow-hidden rounded-2xl border border-line lg:sticky lg:top-4 lg:h-[84vh]">
            <MapView pins={mapPins} selectedId={activeId} onSelect={focusCard} onToggleSave={toggleFavorite} />
          </div>
        </div>
      ) : (
        <ul
          aria-label="Search results"
          aria-busy={state === "loading"}
          className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${state === "loading" ? "opacity-60" : ""}`}
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
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-stone transition-colors hover:border-ink hover:bg-ink/10 hover:text-ink active:bg-ink/20 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
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
              className={`min-w-9 rounded-lg border px-2.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river sm:px-3.5 ${
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
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-stone transition-colors hover:border-ink hover:bg-ink/10 hover:text-ink active:bg-ink/20 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
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
