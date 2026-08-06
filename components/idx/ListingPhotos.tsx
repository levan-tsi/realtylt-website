"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { bandShape, heroAt, sideSources, survivingPhotos, viewAllLabel } from "@/lib/idx/photo-band";
import { FavoriteButton } from "./FavoriteButton";
import { isLiveMlsPhoto, NoPhoto } from "./ListingCard";
import { ListingGallery } from "./ListingGallery";
import { MlsImage } from "./MlsImage";

/** The listing-detail photo band, and the CLIENT OWNER of which photos actually exist.
 *
 * No server can answer that question. For a listing whose storage mirror holds two of its
 * forty-eight claimed photos, index 0 may fail while 1..N stream fine, or the reverse, and it
 * changes hour to hour as signed URLs expire. Truth only arrives when the browser tries. So this
 * component holds the surviving set: a tile whose media never arrives tells us, we drop it, and the
 * page re-derives from what is left. Consequences, all owner-dictated:
 *   • a dead cover promotes the next real photo into the hero instead of painting "coming soon"
 *     in the biggest tile while the thumbnails show the house;
 *   • the branded placeholder appears ONLY when nothing survives;
 *   • the band re-shapes (1 / 2 / 3 / 4+) rather than leaving holes in a fixed 3-tile column;
 *   • the band's height is pinned, so tiles dropping after first paint re-flow inside it and never
 *     shove the page under the reader.
 *
 * It is also deliberately CHEAP. Side slots are positional in the claimed array (see sideSources),
 * so a dead tile empties its slot instead of dragging another photo in behind it, and the band
 * costs at most four photo loads however broken the listing is. Every other surviving photo stays
 * mounted in the collapsed <details> grid — that is what makes the pill's count a fact rather than
 * a claim, and it is the no-JS gallery — but held behind `display:none`, so it fetches nothing
 * until the disclosure opens and then only six at a time through the media queue. */
export function ListingPhotos({
  photos,
  guaranteed = 0,
  address,
  addressShort,
  city,
  mapQuery,
  status,
  favoriteId,
}: {
  /** Claimed photo paths, in feed order. */
  photos: string[];
  /** How many of them are permanently mirrored to our own Storage, and therefore servable without
   * touching the rate-limited MLS media host. When every claimed photo is mirrored the count is a
   * fact the pill may print without first loading all of them. */
  guaranteed?: number;
  /** Full "street, city, state zip" — lightbox label. */
  address: string;
  /** Street line only, for tile alt text. */
  addressShort: string;
  city: string;
  /** Enables the Street View / Map View overlay buttons. */
  mapQuery?: string;
  status: string;
  favoriteId: string;
}) {
  const [dead, setDead] = useState<string[]>([]);
  const [proven, setProven] = useState<string[]>([]);
  const [attempted, setAttempted] = useState<string[]>([]);
  /** Claimed-array position the band is parked at; only the arrows move it. */
  const [anchor, setAnchor] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  useEffect(() => setHydrated(true), []);

  const drop = useCallback((src: string) => {
    setDead((d) => (d.includes(src) ? d : [...d, src]));
  }, []);
  const keep = useCallback((src: string) => {
    setProven((p) => (p.includes(src) ? p : [...p, src]));
  }, []);

  const available = useMemo(() => survivingPhotos(photos, dead), [photos, dead]);
  const count = available.length;

  // GIVE-UP BUDGET. The hero must promote past a dead cover — that is the headline bug — but on a
  // listing whose mirror has expired entirely, an unbounded promotion walks all 48 claimed photos
  // at three requests each and re-creates the burst we just eliminated. After this many dead
  // photos the band stops reaching for new ones and shows only what it already started; if that is
  // nothing, the listing genuinely cannot serve a photo right now and the branded placeholder is
  // the honest answer. One full wave of the four-tile band.
  const GIVE_UP_AFTER = 4;
  const exhausted = dead.length >= GIVE_UP_AFTER;
  const pool = useMemo(
    () => (exhausted ? available.filter((p) => attempted.includes(p)) : available),
    [exhausted, available, attempted],
  );

  // The band is ANCHORED at a claimed-array position that only the carousel arrows move. The hero
  // is the first surviving photo at or after that anchor, so a dead cover promotes without
  // disturbing anything else. Anchoring matters: if the side slots followed the promoting hero,
  // every dead cover would drag three fresh photos into the band and multiply the request cost on
  // exactly the listings that are already failing.
  // THE HERO IS THE PHOTO AT THE ANCHOR (heroAt promotes past dead ones), AND THE COLUMN FOLLOWS
  // IT — so an arrow press moves the whole band as one.
  //
  // It used to pick the hero as "the first surviving photo NOT in the side column", which is only
  // the same thing while the anchor is 0. Press Next once and the column advanced to photos 2-4,
  // photo 0 stopped being "in the column", and the hero snapped straight back to it; press again
  // and the arrow computed the identical anchor, so the band froze. The owner reported exactly
  // that — "it only moves once and does not do anything, or going back" — and it measured as
  // hero 0 → 0 → 0 → 0 on a 31-photo listing, with Back oscillating between two states.
  // lib/idx/photo-band.test.ts now walks the arrows so this cannot come back silently.
  //
  // Hero and side slots still PARTITION the photos (sideSources starts AFTER the hero), so no
  // photo is loaded twice — a side pulled into the hero would restart its retry ladder and double
  // the request cost of a broken gallery.
  const { heroSrc, sides } = useMemo(() => {
    const hero = heroAt(photos, anchor, pool);
    if (!hero) return { heroSrc: undefined as string | undefined, sides: [] as string[] };
    const next = sideSources(photos, hero, dead);
    return { heroSrc: hero, sides: (exhausted ? next.filter((s) => attempted.includes(s)) : next).filter((s) => s !== hero) };
  }, [photos, anchor, pool, dead, exhausted, attempted]);
  const hero = Math.max(0, available.indexOf(heroSrc ?? ""));

  // The band's chrome — arrows, view-mode buttons, the "view all" pill, the whole-tile lightbox
  // trigger — are controls for a photo. Until one has actually ARRIVED they are controls for
  // nothing. Measured 2026-07-26 on a listing whose photos had all expired: for ~20s at 390 (and
  // 5-8s at 1440) the band showed an empty frame carrying 11 live controls, because a merely
  // CANDIDATE hero is enough to render them. That reads more broken than the placeholder does.
  // So the chrome waits for the hero to load; a still-loading band shows MlsImage's quiet skeleton
  // and nothing else, and if nothing ever arrives it settles into the branded placeholder.
  // Non-MLS photos (fixtures, local paths) never report through onLoaded, so they count as ready.
  const heroReady = !!heroSrc && (!isLiveMlsPhoto(heroSrc) || proven.includes(heroSrc));

  // Remember every photo the band has put on screen, so the give-up budget can freeze the band on
  // tiles already in flight instead of cancelling them.
  useEffect(() => {
    const shown = [heroSrc, ...sides].filter(Boolean) as string[];
    setAttempted((a) => {
      const add = shown.filter((s) => !a.includes(s));
      return add.length ? [...a, ...add] : a;
    });
  }, [heroSrc, sides]);
  const shape = bandShape(count);
  // A number may be printed on two grounds: every claimed photo is mirrored into our own Storage
  // (so it is servable by construction), or the gallery has actually accounted for every one of
  // them. Anything else is the feed's claim, and 72% of active listings over-claim.
  // …and the mirror guarantee is VOID the moment one of those photos actually fails: if a
  // "guaranteed" photo can 503, the rest of the guarantee is worth nothing and a figure derived
  // from it would be the same lie in a new costume.
  const accountedFor =
    (guaranteed >= photos.length && photos.length > 0 && dead.length === 0) ||
    photos.length === proven.length + dead.length;
  const label = viewAllLabel(count, accountedFor);
  // The arrows move the whole band: the anchor walks the claimed array, so hero AND column advance
  // together like live's carousel.
  const go = useCallback(
    (delta: number) => {
      if (available.length === 0) return;
      const cur = available.indexOf(heroSrc ?? available[0]);
      const next = available[(cur + delta + available.length) % available.length];
      setAnchor(Math.max(0, photos.indexOf(next)));
    },
    [available, heroSrc, photos],
  );

  // WHILE ONE OF THESE ARROWS HAS FOCUS, ← / → BELONG TO THE PHOTOS. The listing page also has a
  // previous/next LISTING pager listening on the window for those keys, and after clicking a photo
  // arrow the focus is sitting right here — so pressing → would have jumped to another home while
  // the visitor was plainly looking at pictures. preventDefault is what the pager's own guard
  // reads (it bails on an already-defaulted event), so the ownership rule lives with the control
  // that owns the arrows rather than as a special case over in the pager.
  const arrowKeys = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      go(e.key === "ArrowLeft" ? -1 : 1);
    },
    [go],
  );

  // key={src} is load-bearing: when the hero promotes past a dead photo React would otherwise reuse
  // the same MlsImage instance, and its `failed` state would keep the new photo rendering nothing.
  const tile = (
    src: string,
    alt: string,
    sizes: string,
    opts: { priority?: boolean; throttle?: boolean; paused?: boolean } = {},
  ) =>
    isLiveMlsPhoto(src) ? (
      <MlsImage
        key={src}
        src={src}
        alt={alt}
        sizes={sizes}
        priority={opts.priority}
        throttle={opts.throttle}
        paused={opts.paused}
        maxRetries={dead.length === 0 ? 2 : 1}
        onLoaded={() => keep(src)}
        onUnavailable={() => drop(src)}
      />
    ) : (
      <Image key={src} src={src} alt={alt} fill sizes={sizes} priority={opts.priority} className="object-cover" />
    );

  const overlayBtn =
    "grid h-9 min-w-10 place-items-center rounded-xl bg-ink/70 px-2.5 text-paper backdrop-blur transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper";
  const arrowBtn =
    "absolute top-1/2 z-[7] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/60 text-paper backdrop-blur transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper";

  return (
    <ListingGallery photos={available} address={address} mapQuery={mapQuery} onUnavailable={drop}>
      <div
        className={`mx-auto grid max-w-7xl gap-1 px-0 md:gap-4 lg:px-8 lg:py-6 ${
          sides.length > 0 ? "md:grid-cols-[2fr_1fr]" : ""
        }`}
      >
        {/* Hero. Height is pinned so the price and facts stay in the first viewport (live parity)
            and so a tile dropping later re-flows inside the band instead of moving the page. */}
        <div
          className={`photo-zoom relative overflow-hidden md:rounded-2xl ${
            sides.length > 0
              ? "aspect-[3/2] lg:aspect-auto lg:h-[400px]"
              : // A listing with ONE photo had no considered state. `aspect-[21/9]` with
                // `max-h-[400px]` looks like it caps the height, but aspect-ratio works both
                // ways: once the height is clamped to 400 the WIDTH collapses to 400 x 21/9 =
                // 933, and the box stops filling its column. Measured on production at 1440:
                // a 933x400 photo sitting at x=112 with 112px of black to its left and 395px
                // to its right, visibly off-centre inside a full-bleed black band.
                // Pin the height instead and let the width fill, which also makes the band the
                // same 400px tall whether a listing carries one photo or twelve.
                "aspect-[3/2] md:aspect-auto md:h-[400px] md:w-full"
          }`}
        >
          {heroSrc ? (
            tile(heroSrc, `${addressShort}, ${city}, photo ${hero + 1}`, "(max-width: 768px) 100vw, 60vw", { priority: true })
          ) : (
            <NoPhoto />
          )}

          <FavoriteButton id={favoriteId} className="absolute right-4 top-4 z-[8]" />
          {status !== "Active" && (
            <span className="absolute left-4 top-4 z-[6] rounded-lg bg-ink/85 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-paper backdrop-blur">
              {status}
            </span>
          )}

          {/* Whole-tile trigger: mouse + keyboard open the lightbox at the hero (delegated). */}
          {heroReady && (
            <button
              type="button"
              data-lightbox-index={hero}
              aria-label={`Open the photo viewer for ${addressShort}`}
              className="absolute inset-0 z-[5] cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-paper"
            />
          )}

          {/* Carousel arrows — page the band in place, like live. Never over the placeholder:
              there is nothing to page to. */}
          {heroReady && count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} onKeyDown={arrowKeys} aria-label="Previous photo" className={`${arrowBtn} left-4`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
              <button type="button" onClick={() => go(1)} onKeyDown={arrowKeys} aria-label="Next photo" className={`${arrowBtn} right-4`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </>
          )}

          {/* Bottom-left view modes; bottom-right the single "show all photos" control. */}
          {heroReady && (
            <>
              <div className="absolute bottom-3 left-3 z-[7] flex items-center gap-1.5">
                <button type="button" data-lightbox-index={hero} data-lightbox-tab="photos" aria-label="Open the photo viewer" title="Photos" className={overlayBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" />
                    <circle cx="12" cy="13" r="3.2" />
                  </svg>
                </button>
                {mapQuery && (
                  <>
                    <button type="button" data-lightbox-index={hero} data-lightbox-tab="street" aria-label="Open street view" title="Street View" className={overlayBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
                        <circle cx="12" cy="10" r="2.6" />
                      </svg>
                    </button>
                    <button type="button" data-lightbox-index={hero} data-lightbox-tab="map" aria-label="Open map view" title="Map View" className={overlayBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m9 4-6 2.4v13.2L9 17.2l6 2.4 6-2.4V4l-6 2.4Z" />
                        <path d="M9 4v13.2M15 6.4v13.2" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                data-lightbox-index={hero}
                className="absolute bottom-3 right-3 z-[7] inline-flex h-9 items-center gap-2 rounded-xl bg-ink/70 px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-paper backdrop-blur transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                </svg>
                {label}
              </button>
            </>
          )}
        </div>

        {/* Side column — live's 1 wide + 2 half at 4+, shrinking cleanly at 3 and 2. */}
        {sides.length > 0 && (
          <div className="hidden h-full grid-cols-2 grid-rows-2 gap-4 md:grid">
            {sides.map((src, slot) => (
              <button
                key={src}
                type="button"
                data-lightbox-index={available.indexOf(src)}
                aria-label={`View photo ${available.indexOf(src) + 1} full screen`}
                className={`photo-zoom relative cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper ${
                  shape === "one-side" || sides.length === 1
                    ? "col-span-2 row-span-2"
                    : sides.length === 2
                      ? "col-span-2"
                      : slot === 0
                        ? "col-span-2"
                        : ""
                }`}
              >
                {tile(src, `${addressShort}, photo ${available.indexOf(src) + 1}`, "30vw")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Every surviving photo, always in the DOM. That is what makes the page's photo count
          honest — the figure on the pill is the number of photos actually here, not a claim from
          the feed — and it is the no-JS route to photos 2..N. It costs nothing while collapsed: a
          closed <details> is display:none, so lazy tiles never fetch (measured: 4 requests on a
          15-photo listing). The moment it opens they switch to the media queue and load six at a
          time, which is what stopped the 48-request burst that used to 429 the media host. With JS
          the in-photo pill is the ONE "show all photos" control, so the summary hides. */}
      {count > 1 && (
        <details
          className="group mx-auto max-w-7xl px-0 pb-3 lg:px-8 lg:pb-6"
          onToggle={(e) => setGridOpen((e.currentTarget as HTMLDetailsElement).open)}
        >
          <summary
            hidden={hydrated}
            className="mx-4 my-2 inline-flex min-h-6 cursor-pointer list-none items-center gap-2 rounded-xl border border-paper/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-paper transition-colors hover:border-paper/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper lg:mx-0 [&::-webkit-details-marker]:hidden"
          >
            <span className="group-open:hidden">{label}</span>
            <span className="hidden group-open:inline">Hide photos</span>
          </summary>
          <div className="grid grid-cols-2 gap-1.5 pt-1.5 md:grid-cols-3">
            {available.slice(1).map((p, i) => (
              <div
                key={p}
                data-lightbox-index={i + 1}
                role="button"
                tabIndex={0}
                aria-label={`View photo ${i + 2} of ${count} full screen`}
                className="photo-zoom relative aspect-[3/2] cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper md:rounded-xl"
              >
                {tile(p, `${addressShort}, photo ${i + 2}`, "(max-width: 768px) 50vw, 33vw", { throttle: hydrated, paused: hydrated && !gridOpen })}
              </div>
            ))}
          </div>
        </details>
      )}
    </ListingGallery>
  );
}
