"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/idx/ListingCard";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { LocationSuggest } from "@/components/search/LocationSuggest";
import { SaveSearchDialog } from "@/components/search/SaveSearchDialog";
import { useSaved } from "@/components/auth/SavedProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { pageWindow } from "@/lib/pagination";
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

interface Filters {
  q: string;
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
  /** Count-line quick filter (live realtylt.com): "all" or "new" (listed ≤7 days). */
  quick: "all" | "new";
  sort: string;
  page: number;
  view: "grid" | "map";
}

/** Keys that live in the MORE panel — used for the active-count badge and the panel reset. */
const MORE_KEYS = ["sqftMin", "sqftMax", "garageMin", "garageMax", "lotMin", "lotMax", "yearMin", "yearMax", "taxMax"] as const;

/** "New Listings" quick filter window — matches the card's "New" badge (≤7 days). */
const NEW_LISTING_DAYS = 7;

const PRICE_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 3000].map(
  (k) => k * 1000,
);
const fmtK = (n: number) => (n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1000}K`);

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
    quick: sp.get("quick") === "new" ? "new" : "all",
    sort: sp.get("sort") ?? "newest",
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
    if (v === "" || v == null || (k === "page" && v === 1) || (k === "sort" && v === "newest" && forApi === false))
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
});

/* Live filter bar: slim uppercase text dropdowns (BED ▾ BATH ▾ PRICE ▾ …), no boxes. */
const selectCls =
  "cursor-pointer border-0 bg-transparent py-2 text-xs font-bold uppercase tracking-[0.12em] text-stone transition-colors hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-river";

/* MORE-panel dropdowns are boxed (like live's) so min/max pairs read clearly. */
const panelSelectCls =
  "min-w-0 flex-1 cursor-pointer rounded-[3px] border border-[#cccccc] bg-white px-2.5 py-2 text-sm text-ink-soft transition-colors hover:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-river";

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => fromParams(new URLSearchParams(searchParams)));
  const [result, setResult] = useState<ApiResult | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [saveOpen, setSaveOpen] = useState(false);
  const { saveSearch, signedIn } = useSaved();
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
  // Serialized comparison keeps our own router.replace() calls from looping.
  useEffect(() => {
    const next = fromParams(new URLSearchParams(searchParams));
    setFilters((prev) => (toQuery(prev, false) === toQuery(next, false) ? prev : next));
  }, [searchParams]);

  // Reflect the committed filters into the URL — a post-commit effect (never updates the
  // Router mid-render) keyed on the serialized query, so it writes exactly once per real
  // change and can't loop with the re-sync effect above. Reads window.location directly to
  // avoid comparing against a stale searchParams closure.
  const filtersQs = toQuery(filters, false);
  useEffect(() => {
    const urlQs = toQuery(fromParams(new URLSearchParams(window.location.search)), false);
    if (filtersQs !== urlQs) router.replace(`/search${filtersQs ? `?${filtersQs}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersQs]);

  useEffect(() => {
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
  useEffect(() => {
    if (!result) return;
    if (panelRef.current) panelRef.current.scrollTop = 0;
    resultsTopRef.current?.scrollIntoView({ block: "start", behavior: scrollBehavior() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.page]);

  const listings = result?.listings ?? [];
  // Page-coupled map pins — exactly this page's located listings (owner's core ask).
  const mapPins = useMemo(() => listings.map(toPin).filter((p) => p.lat && p.lng), [listings]);

  // One card renderer for both branches — carries the ref (chip→card scroll) and the
  // hover/focus↔chip highlight. In grid view the highlight is harmless (no map).
  const renderCard = (l: Listing) => (
    <li
      key={l.id}
      ref={(el) => {
        cardRefs.current.set(l.id, el);
      }}
      onMouseEnter={() => setActiveId(l.id)}
      onMouseLeave={() => setActiveId((cur) => (cur === l.id ? null : cur))}
      onFocus={() => setActiveId(l.id)}
      className={`scroll-mt-4 rounded-[2px] transition-shadow ${
        activeId === l.id ? "ring-2 ring-porchlight-deep ring-offset-2" : ""
      }`}
    >
      <ListingCard listing={l} variant="plain" />
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
          className={`px-3.5 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
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

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 lg:px-8">
      {/* ── Filter bar */}
      <form
        role="search"
        aria-label="Listing filters"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          apply({ q: String(fd.get("q") ?? "") });
        }}
        className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border border-[#dddddd] bg-white px-4 py-2"
      >
        <div className="min-w-40 grow basis-44">
          <label htmlFor="search-q" className="sr-only">
            Location: town, ZIP, or address
          </label>
          <LocationSuggest
            id="search-q"
            key={filters.q}
            defaultValue={filters.q}
            placeholder="Find a Place"
            className="w-full border-0 bg-transparent px-1 py-2.5 text-sm text-ink-soft placeholder:text-stone focus:outline-none"
            onPick={(s) =>
              s.kind === "county" && s.county
                ? apply({ county: s.county, q: "" })
                : apply({ q: s.q })
            }
          />
        </div>

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
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>{fmtK(p)}+</option>
          ))}
        </select>
        <label htmlFor="f-priceMax" className="sr-only">Maximum price</label>
        <select id="f-priceMax" value={filters.priceMax} onChange={(e) => apply({ priceMax: e.target.value })} className={selectCls}>
          <option value="">Max Price</option>
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>Under {fmtK(p)}</option>
          ))}
        </select>
        <label htmlFor="f-sqft" className="sr-only">Minimum square feet</label>
        <select id="f-sqft" value={filters.sqftMin} onChange={(e) => apply({ sqftMin: e.target.value })} className={selectCls}>
          <option value="">Sqft</option>
          {[1000, 1500, 2000, 2500, 3000].map((n) => (
            <option key={n} value={n}>{n.toLocaleString()}+ sqft</option>
          ))}
        </select>
        <label htmlFor="f-type" className="sr-only">Property type</label>
        <select id="f-type" value={filters.propertyType} onChange={(e) => apply({ propertyType: e.target.value })} className={selectCls}>
          <option value="">Type</option>
          <option value="Residential">Residential</option>
          <option value="Multi-Family">Multi-Family</option>
        </select>

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

        <button
          type="submit"
          className="rounded-[4px] bg-ink px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setSaveOpen(true)}
          className="rounded-[4px] bg-ink px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          ♥ Save Search
        </button>
      </form>

      {/* ── MORE panel: advanced filters. In-flow (pushes results down) so it stays keyboard-
          friendly and overflow-safe at every width — cleaner than live's overlay; filters
          apply live (no "apply" step), a divergence noted in the parity file. */}
      {moreOpen && (
        <div id="more-panel" className="border border-t-0 border-[#dddddd] bg-white px-4 py-5 sm:px-6">
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

          <div className="mt-6 flex justify-end border-t border-[#eeeeee] pt-4">
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="rounded-[4px] bg-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
                boroughActive
                  ? "bg-ink text-paper"
                  : "border border-[#cccccc] bg-white text-stone hover:border-ink hover:text-ink"
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
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-mist px-4 py-2.5">
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
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <div role="group" aria-label="View" className="flex overflow-hidden border border-[#cccccc]">
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

      {/* ── Results */}
      {state === "error" ? (
        <div className="mt-10 border border-red-500/40 bg-red-500/5 p-10 text-center">
          <p className="text-xl font-light text-ink">Search is temporarily unavailable.</p>
          <p className="mt-2 text-sm text-stone">
            Try again in a moment, or call us at{" "}
            <a href={SITE.phoneHref} className="font-bold text-ink">{SITE.phone}</a> and we&rsquo;ll run it for you.
          </p>
        </div>
      ) : state === "loading" && !result ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="animate-pulse border border-[#dddddd]">
              <div className="aspect-[3/2] bg-mist" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-28 bg-mist" />
                <div className="h-4 w-40 bg-mist" />
                <div className="h-3 w-32 bg-mist" />
              </div>
            </li>
          ))}
        </ul>
      ) : listings.length === 0 ? (
        <div className="mt-10 border border-dashed border-[#cccccc] p-12 text-center">
          <p className="text-xl font-light text-ink">No homes match those filters.</p>
          <p className="mt-2 text-sm text-stone">Try widening a range or clearing a filter.</p>
          <button
            type="button"
            onClick={() =>
              apply({
                q: "", county: "", priceMin: "", priceMax: "", bedsMin: "", bathsMin: "", sqftMin: "", propertyType: "",
                sqftMax: "", garageMin: "", garageMax: "", lotMin: "", lotMax: "", yearMin: "", yearMax: "", taxMax: "", withPhotos: false,
              })
            }
            className="mt-5 border-2 border-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Clear All Filters
          </button>
        </div>
      ) : filters.view === "map" ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <ul
            ref={panelRef}
            className={`grid content-start gap-5 sm:grid-cols-2 lg:max-h-[75vh] lg:overflow-y-auto lg:pr-2 ${state === "loading" ? "opacity-60" : ""}`}
          >
            {listings.map(renderCard)}
          </ul>
          {/* On mobile the map leads (order-first) so it's visible without scrolling past a
              long 36-card list; on desktop it sticks beside the results column. */}
          <div className="relative order-first h-[55vh] overflow-hidden border border-[#dddddd] lg:order-none lg:sticky lg:top-4 lg:h-[75vh]">
            <MapView pins={mapPins} selectedId={activeId} onSelect={focusCard} />
          </div>
        </div>
      ) : (
        <ul className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${state === "loading" ? "opacity-60" : ""}`}>
          {listings.map(renderCard)}
        </ul>
      )}

      {/* ── Pagination */}
      {result && result.totalPages > 1 && (
        <nav
          aria-label="Results pages"
          className="mt-10 flex flex-wrap items-center justify-center gap-1.5 bg-mist px-4 py-3"
        >
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => apply({ page: filters.page - 1 })}
            className="px-3 py-2 text-sm text-stone hover:text-ink disabled:opacity-30"
            aria-label="Previous page"
          >
            «
          </button>
          {/* Live realtylt.com pages in a run of six consecutive numbers with chevrons on
              either side — no "1 … 150" ellipsis. pageWindow() clamps the run inside the
              set; the row wraps rather than overflowing a 390px viewport on 3-digit pages. */}
          {pageWindow(result.page, result.totalPages).map((p) => (
            <button
              key={p}
              type="button"
              aria-current={p === result.page ? "page" : undefined}
              aria-label={`Page ${p}`}
              onClick={() => apply({ page: p })}
              className={`min-w-9 px-2.5 py-2 text-sm transition-colors sm:px-3.5 ${
                p === result.page ? "bg-ink font-bold text-paper" : "text-ink-soft hover:bg-white"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={filters.page >= result.totalPages}
            onClick={() => apply({ page: filters.page + 1 })}
            className="px-3 py-2 text-sm text-stone hover:text-ink disabled:opacity-30"
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
          className="mt-10 border-t border-[#dddddd] pt-6"
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
