"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/idx/ListingCard";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { saveSearch } from "@/lib/saved";
import { COUNTIES, type CountySlug } from "@/lib/site";
import type { Listing } from "@/lib/idx/types";

const MapView = dynamic(() => import("@/components/idx/MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-96 w-full place-items-center bg-mist text-sm text-stone">
      Loading map…
    </div>
  ),
});

/** Chip order matches the live site (Orange first). */
const CHIP_ORDER: CountySlug[] = ["orange", "dutchess", "westchester", "putnam", "rockland", "ulster"];

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
    view: sp.get("view") === "map" ? "map" : "grid",
  };
}

function toQuery(f: Filters, forApi: boolean): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (k === "view" && forApi) continue;
    if (v === "" || v == null || (k === "page" && v === 1) || (k === "sort" && v === "newest" && forApi === false))
      continue;
    sp.set(k, String(v));
  }
  return sp.toString();
}

const selectCls =
  "rounded-[2px] border border-ink/20 bg-white px-3 py-2.5 text-sm text-ink focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-river/60";

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => fromParams(new URLSearchParams(searchParams)));
  const [result, setResult] = useState<ApiResult | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [savedNote, setSavedNote] = useState("");
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

  function onSaveSearch() {
    const parts = [
      filters.q && `“${filters.q}”`,
      filters.county && COUNTIES.find((c) => c.slug === filters.county)?.name,
      filters.priceMin && `${fmtK(+filters.priceMin)}+`,
      filters.priceMax && `under ${fmtK(+filters.priceMax)}`,
      filters.bedsMin && `${filters.bedsMin}+ bd`,
      filters.propertyType,
    ].filter(Boolean);
    const label = parts.length ? parts.join(" · ") : "All Hudson Valley listings";
    saveSearch(label, toQuery(filters, false));
    setSavedNote(`Saved “${label}” to this device.`);
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
        className="flex flex-wrap items-end gap-3 border-b border-ink/10 py-5"
      >
        <div className="min-w-52 grow basis-64">
          <label htmlFor="search-q" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-stone">
            Location
          </label>
          <input
            id="search-q"
            ref={qInput}
            type="search"
            defaultValue={filters.q}
            placeholder="Town, ZIP, or address"
            className="w-full rounded-[2px] border border-ink/20 bg-white px-3.5 py-2.5 text-sm focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-river/60"
          />
        </div>

        <div>
          <label htmlFor="f-priceMin" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-stone">
            Min price
          </label>
          <select id="f-priceMin" value={filters.priceMin} onChange={(e) => apply({ priceMin: e.target.value })} className={selectCls}>
            <option value="">No min</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>{fmtK(p)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-priceMax" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-stone">
            Max price
          </label>
          <select id="f-priceMax" value={filters.priceMax} onChange={(e) => apply({ priceMax: e.target.value })} className={selectCls}>
            <option value="">No max</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>{fmtK(p)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-beds" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-stone">
            Beds
          </label>
          <select id="f-beds" value={filters.bedsMin} onChange={(e) => apply({ bedsMin: e.target.value })} className={selectCls}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-baths" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-stone">
            Baths
          </label>
          <select id="f-baths" value={filters.bathsMin} onChange={(e) => apply({ bathsMin: e.target.value })} className={selectCls}>
            <option value="">Any</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}+</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-sqft" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-stone">
            Sqft
          </label>
          <select id="f-sqft" value={filters.sqftMin} onChange={(e) => apply({ sqftMin: e.target.value })} className={selectCls}>
            <option value="">Any</option>
            {[1000, 1500, 2000, 2500, 3000].map((n) => (
              <option key={n} value={n}>{n.toLocaleString()}+</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-type" className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-stone">
            Type
          </label>
          <select id="f-type" value={filters.propertyType} onChange={(e) => apply({ propertyType: e.target.value })} className={selectCls}>
            <option value="">Any</option>
            <option value="Residential">Residential</option>
            <option value="Multi-Family">Multi-Family</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-[2px] bg-ink px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          Search
        </button>
        <button
          type="button"
          onClick={onSaveSearch}
          className="rounded-[2px] border border-porchlight-deep px-5 py-2.5 text-sm font-bold text-porchlight-deep transition-colors hover:bg-porchlight hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          ♥ Save search
        </button>
      </form>
      {savedNote && (
        <p role="status" className="mt-3 rounded-[2px] bg-porchlight/15 px-3 py-2 text-sm text-ink">
          {savedNote} <a href="/saved" className="font-bold text-river underline underline-offset-2">View saved →</a>
        </p>
      )}

      {/* ── County chips */}
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Filter by county">
        {CHIP_ORDER.map((slug) => {
          const county = COUNTIES.find((c) => c.slug === slug)!;
          const active = filters.county === slug;
          return (
            <li key={slug}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => apply({ county: active ? "" : slug })}
                className={`rounded-[2px] border px-3.5 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? "border-ink bg-ink text-porchlight"
                    : "border-ink/15 bg-white text-ink hover:border-porchlight-deep hover:text-porchlight-deep"
                }`}
              >
                {county.name}, NY
              </button>
            </li>
          );
        })}
      </ul>

      {/* ── Result meta row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-stone" role="status">
          {state === "loading" ? "Searching…" : state === "error" ? "" : (
            <>
              <strong className="font-mono text-ink">{result?.total ?? 0}</strong> listings found
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor="f-sort" className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone">
            Sort
          </label>
          <select id="f-sort" value={filters.sort} onChange={(e) => apply({ sort: e.target.value })} className={selectCls}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
          </select>
          <div role="group" aria-label="View" className="flex overflow-hidden rounded-[2px] border border-ink/20">
            {(["grid", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={filters.view === v}
                onClick={() => apply({ view: v, page: filters.page })}
                className={`px-4 py-2 text-sm font-bold capitalize transition-colors ${
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
        <div className="mt-10 rounded-[2px] border border-red-500/40 bg-red-500/5 p-10 text-center">
          <p className="font-display text-xl text-ink">Search is temporarily unavailable.</p>
          <p className="mt-2 text-sm text-stone">
            Try again in a moment, or call us at{" "}
            <a href="tel:+19179057923" className="font-bold text-river">(917) 905-7923</a> — we&rsquo;ll run it for you.
          </p>
        </div>
      ) : state === "loading" && !result ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="animate-pulse rounded-[2px] border border-ink/10">
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
        <div className="mt-10 rounded-[2px] border border-dashed border-ink/20 p-12 text-center">
          <p className="font-display text-xl text-ink">No homes match those filters.</p>
          <p className="mt-2 text-sm text-stone">Try widening the price range or clearing a county.</p>
          <button
            type="button"
            onClick={() =>
              apply({ q: "", county: "", priceMin: "", priceMax: "", bedsMin: "", bathsMin: "", sqftMin: "", propertyType: "" })
            }
            className="mt-5 rounded-[2px] border border-ink px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Clear all filters
          </button>
        </div>
      ) : filters.view === "map" ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <ul className={`grid content-start gap-5 sm:grid-cols-2 lg:max-h-[75vh] lg:overflow-y-auto lg:pr-2 ${state === "loading" ? "opacity-60" : ""}`}>
            {listings.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} />
              </li>
            ))}
          </ul>
          <div className="overflow-hidden rounded-[2px] border border-ink/10 lg:sticky lg:top-24 lg:h-[75vh]">
            <MapView listings={listings} />
          </div>
        </div>
      ) : (
        <ul className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${state === "loading" ? "opacity-60" : ""}`}>
          {listings.map((l) => (
            <li key={l.id}>
              <ListingCard listing={l} />
            </li>
          ))}
        </ul>
      )}

      {/* ── Pagination */}
      {result && result.totalPages > 1 && (
        <nav aria-label="Results pages" className="mt-10 flex items-center justify-center gap-1.5">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => apply({ page: filters.page - 1 })}
            className="rounded-[2px] border border-ink/20 px-3 py-2 text-sm disabled:opacity-30"
            aria-label="Previous page"
          >
            ←
          </button>
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              aria-current={p === result.page ? "page" : undefined}
              onClick={() => apply({ page: p })}
              className={`rounded-[2px] px-3.5 py-2 font-mono text-sm transition-colors ${
                p === result.page ? "bg-ink text-porchlight" : "border border-ink/20 text-ink hover:border-ink"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={filters.page >= result.totalPages}
            onClick={() => apply({ page: filters.page + 1 })}
            className="rounded-[2px] border border-ink/20 px-3 py-2 text-sm disabled:opacity-30"
            aria-label="Next page"
          >
            →
          </button>
        </nav>
      )}

      {result && (
        <MlsAttribution
          dataLastUpdated={result.dataLastUpdated}
          fixtureMode={result.fixtureMode}
          className="mt-10 border-t border-ink/10 pt-6"
        />
      )}
    </div>
  );
}
