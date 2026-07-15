"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/idx/ListingCard";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { useSaved } from "@/components/auth/SavedProvider";
import { SERVED_AREAS, SITE, type CountySlug } from "@/lib/site";
import type { Listing, MapPin } from "@/lib/idx/types";

const MapView = dynamic(() => import("@/components/idx/MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-96 w-full place-items-center bg-mist text-sm text-stone">
      Loading map…
    </div>
  ),
});

/** Chip order matches the live site (Orange first); the five boroughs follow the Valley. */
const CHIP_ORDER: CountySlug[] = [
  "orange", "dutchess", "westchester", "putnam", "rockland", "ulster",
  "bronx", "brooklyn", "manhattan", "queens", "staten-island",
];

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
  sort: string;
  page: number;
  view: "grid" | "map";
}

const PRICE_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 3000].map(
  (k) => k * 1000,
);
const fmtK = (n: number) => (n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1000}K`);

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
    if (v === "" || v == null || (k === "page" && v === 1) || (k === "sort" && v === "newest" && forApi === false))
      continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

/** Filter fields only (no page/sort/view) — the /api/idx/pins query: the map shows the
 * ENTIRE filtered result set, independent of grid pagination. */
const FILTER_KEYS = ["q", "county", "priceMin", "priceMax", "bedsMin", "bathsMin", "sqftMin", "propertyType"] as const;
function filterQuery(f: Filters): string {
  const sp = new URLSearchParams();
  for (const k of FILTER_KEYS) if (f[k]) sp.set(k, f[k]);
  return sp.toString();
}

/** Current-page fallback pins while the full pin set loads. */
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

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => fromParams(new URLSearchParams(searchParams)));
  const [result, setResult] = useState<ApiResult | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [savedNote, setSavedNote] = useState("");
  const { saveSearch, signedIn } = useSaved();
  const [pins, setPins] = useState<MapPin[] | null>(null);
  const loadedPinsQuery = useRef<string | null>(null);
  const qInput = useRef<HTMLInputElement>(null);

  const apply = useCallback(
    (patch: Partial<Filters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch, page: patch.page ?? 1 };
        router.replace(`/search${toQuery(next, false) ? `?${toQuery(next, false)}` : ""}`, { scroll: false });
        return next;
      });
    },
    [router],
  );

  // Re-sync when the URL changes underneath us (header "Search Listings" click,
  // browser Back/Forward) — state only seeds from the URL once on mount otherwise.
  // Serialized comparison keeps our own router.replace() calls from looping.
  useEffect(() => {
    const next = fromParams(new URLSearchParams(searchParams));
    setFilters((prev) => (toQuery(prev, false) === toQuery(next, false) ? prev : next));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(`/api/idx/search?${toQuery(filters, true)}`)
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

  // Full pin set for the map (all matches, not just this grid page) — refetched only
  // when the FILTERS change; page/sort don't affect it. Until it arrives (or if it
  // fails) the map falls back to pins for the current page's cards.
  const pinsQuery = filterQuery(filters);
  useEffect(() => {
    if (filters.view !== "map") return;
    if (loadedPinsQuery.current === pinsQuery) return;
    let cancelled = false;
    fetch(`/api/idx/pins${pinsQuery ? `?${pinsQuery}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<{ pins: MapPin[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        loadedPinsQuery.current = pinsQuery;
        setPins(data.pins);
      })
      .catch(() => {}); // non-fatal — the map keeps its fallback pins
    return () => {
      cancelled = true;
    };
  }, [filters.view, pinsQuery]);

  function onSaveSearch() {
    const parts = [
      filters.q && `“${filters.q}”`,
      filters.county && SERVED_AREAS.find((c) => c.slug === filters.county)?.name,
      filters.priceMin && `${fmtK(+filters.priceMin)}+`,
      filters.priceMax && `under ${fmtK(+filters.priceMax)}`,
      filters.bedsMin && `${filters.bedsMin}+ bd`,
      filters.propertyType,
    ].filter(Boolean);
    // Coverage spans the Hudson Valley AND the five boroughs now — keep the label neutral.
    const label = parts.length ? parts.join(" · ") : "All listings";
    void saveSearch(label, toQuery(filters, false));
    setSavedNote(`Saved “${label}” to ${signedIn ? "your account" : "this device"}.`);
    window.setTimeout(() => setSavedNote(""), 4000);
  }

  const listings = result?.listings ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 lg:px-8">
      {/* ── Filter bar */}
      <form
        role="search"
        aria-label="Listing filters"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: qInput.current?.value ?? "" });
        }}
        className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border border-[#dddddd] bg-white px-4 py-2"
      >
        <div className="min-w-40 grow basis-44">
          <label htmlFor="search-q" className="sr-only">
            Location — town, ZIP, or address
          </label>
          <input
            id="search-q"
            ref={qInput}
            type="search"
            defaultValue={filters.q}
            placeholder="Find a Place"
            className="w-full border-0 bg-transparent px-1 py-2.5 text-sm text-ink-soft placeholder:text-stone focus:outline-none"
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

        <button
          type="submit"
          className="rounded-[4px] bg-ink px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          Search
        </button>
        <button
          type="button"
          onClick={onSaveSearch}
          className="rounded-[4px] bg-ink px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          ♥ Save Search
        </button>
      </form>
      {savedNote && (
        <p role="status" className="mt-3 bg-mist px-3 py-2 text-sm text-ink-soft">
          {savedNote} <a href="/saved" className="font-bold text-ink underline underline-offset-2">View saved →</a>
        </p>
      )}

      {/* ── County chips */}
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Filter by county">
        {CHIP_ORDER.map((slug) => {
          const county = SERVED_AREAS.find((c) => c.slug === slug)!;
          const active = filters.county === slug;
          return (
            <li key={slug}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => apply({ county: active ? "" : slug })}
                className={`px-3.5 py-2 text-[13px] transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : "bg-mist text-[#555555] hover:bg-[#e2e6ea] hover:text-ink"
                }`}
              >
                {county.name}, NY
              </button>
            </li>
          );
        })}
      </ul>

      {/* ── Result meta row — live: light gray strip, "N listings found" left, Sort By right */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-mist px-4 py-2.5">
        <p className="text-sm text-stone" role="status">
          {state === "loading" ? "Searching…" : state === "error" ? "" : (
            <>
              <strong className="font-bold text-ink">{result?.total ?? 0} listings found</strong>
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor="f-sort" className="text-xs font-bold uppercase tracking-[0.12em] text-stone">
            Sort By
          </label>
          <select id="f-sort" value={filters.sort} onChange={(e) => apply({ sort: e.target.value })} className={selectCls}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
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

      {/* ── Results */}
      {state === "error" ? (
        <div className="mt-10 border border-red-500/40 bg-red-500/5 p-10 text-center">
          <p className="text-xl font-light text-ink">Search is temporarily unavailable.</p>
          <p className="mt-2 text-sm text-stone">
            Try again in a moment, or call us at{" "}
            <a href={SITE.phoneHref} className="font-bold text-ink">{SITE.phone}</a> — we&rsquo;ll run it for you.
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
          <p className="mt-2 text-sm text-stone">Try widening the price range or clearing a county.</p>
          <button
            type="button"
            onClick={() =>
              apply({ q: "", county: "", priceMin: "", priceMax: "", bedsMin: "", bathsMin: "", sqftMin: "", propertyType: "" })
            }
            className="mt-5 border-2 border-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Clear All Filters
          </button>
        </div>
      ) : filters.view === "map" ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <ul className={`grid content-start gap-5 sm:grid-cols-2 lg:max-h-[75vh] lg:overflow-y-auto lg:pr-2 ${state === "loading" ? "opacity-60" : ""}`}>
            {listings.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} variant="plain" />
              </li>
            ))}
          </ul>
          <div className="h-[55vh] overflow-hidden border border-[#dddddd] lg:sticky lg:top-4 lg:h-[75vh]">
            <MapView pins={loadedPinsQuery.current === pinsQuery && pins ? pins : listings.map(toPin)} />
          </div>
        </div>
      ) : (
        <ul className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${state === "loading" ? "opacity-60" : ""}`}>
          {listings.map((l) => (
            <li key={l.id}>
              <ListingCard listing={l} variant="plain" />
            </li>
          ))}
        </ul>
      )}

      {/* ── Pagination */}
      {result && result.totalPages > 1 && (
        <nav aria-label="Results pages" className="mt-10 flex items-center justify-center gap-1.5 bg-mist px-4 py-3">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => apply({ page: filters.page - 1 })}
            className="px-3 py-2 text-sm text-stone hover:text-ink disabled:opacity-30"
            aria-label="Previous page"
          >
            «
          </button>
          {/* Windowed pages (1 … n-1 n n+1 … last) — real data yields 20+ pages, and a
              full flex row of buttons overflowed the 390px viewport. */}
          {Array.from({ length: result.totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 ||
                p === result.totalPages ||
                Math.abs(p - result.page) <= 2,
            )
            .map((p, i, shown) => (
              <span key={p} className="flex items-center">
                {i > 0 && p - shown[i - 1] > 1 && (
                  <span aria-hidden className="px-1 text-sm text-stone">
                    …
                  </span>
                )}
                <button
                  type="button"
                  aria-current={p === result.page ? "page" : undefined}
                  onClick={() => apply({ page: p })}
                  className={`px-3.5 py-2 text-sm transition-colors ${
                    p === result.page ? "bg-ink font-bold text-paper" : "text-ink-soft hover:bg-white"
                  }`}
                >
                  {p}
                </button>
              </span>
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
    </div>
  );
}
