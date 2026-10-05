import type { Metadata } from "next";
import { preconnect, preload, preloadModule } from "react-dom";
import Link from "next/link";
import { Button, PRESS } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialBand } from "@/components/ui/TestimonialBand";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { DriftRail } from "@/components/idx/DriftRail";
import { RailPager } from "@/components/idx/RailPager";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { LocationSuggest } from "@/components/search/LocationSuggest";
import { MlGround } from "@/components/home/ml/MlGround";
import { MlAreaChapter } from "@/components/home/ml/MlAreaChapter";
import { MAPLIBRE_URL } from "@/components/home/ml/style";
import { PLATES } from "@/components/home/plates/plates.gen";
import { TALL_MEDIA, WIDE_MEDIA, plateSrc, plateSrcSet } from "@/components/home/plates/plate-frame";
import { COVERS, homeMap } from "@/lib/home-map";
import { listingPath } from "@/lib/idx/listing-url";
import { forCard } from "@/lib/idx/card-listing";
import { AREA_ROWS } from "@/components/home/night/areas";
import { AREA_FLIGHT } from "@/components/home/night/shots";
import { HomeIntake } from "@/components/home/HomeIntake";
import { WhyCarousel } from "@/components/home/WhyCarousel";
import { TESTIMONIALS } from "@/content/testimonials";
import { getDataLastUpdated, getIdxClient, isSampleData } from "@/lib/idx";
import { getActiveSaleCount, isDbConfigured } from "@/lib/idx/db";
import { OG_DEFAULTS, SITE } from "@/lib/site";
import type { ReactNode } from "react";
import { EARLY_LIGHTS_SCRIPT } from "@/lib/idx/lights-client";
import { PLATE_REVEAL_SCRIPT } from "@/components/home/plates/plate-reveal";

/** THE LIGHTS' EARLY FETCH (round 59): one line of script at the top of the page starts the fetch
 * of /api/lights while the document is still parsing, ahead of the page's own bundle, and leaves
 * the promise on the window for lib/idx/lights-client.ts to take (its `takeEarly`); since round 61
 * the promise is of the parsed answer, so the JSON is read before hydration. The trailing catch
 * keeps a failed early fetch from logging as unhandled; the client sees the failure itself and
 * fetches again. With JavaScript off nothing runs and the plate stands as before. */
const EARLY_LIGHTS = EARLY_LIGHTS_SCRIPT;

// Re-render hourly in live mode so the listing rails + "Data last updated" stay honest.
export const revalidate = 600; // keep listing rails + "Data last updated" fresh in live mode

export const metadata: Metadata = {
  title: "RealtyLT | Hudson Valley & NYC Homes for Sale",
  description:
    "Let's find home. Search homes for sale across the Hudson Valley and all five NYC boroughs, or get your home's value and a cash offer in 24 hours.",
  // EXPLICIT, because the self-canonical idiom inherited from app/layout.tsx resolves to `/index`
  // HERE and nowhere else. In a production build the root page is prerendered to index.html, so a
  // relative canonical resolves against the pathname `/index`, and `/index` 308-redirects to `/`.
  // Production was telling Google that the canonical version of its most important page is a
  // redirect, while the sitemap listed `/`. Dev cannot see it: dev does not prerender, and the same
  // page on :3100 renders clean. Verified against `next build` output. Guarded by app/canonical.test.ts.
  alternates: { canonical: "/" },
  // og:url gets the same explicit value for the same reason: the layout's `url: "./"` would
  // resolve to /index here exactly as the canonical did. A page-level openGraph REPLACES the
  // layout's block, so the shared card fields ride along. Guarded by app/canonical.test.ts.
  openGraph: { ...OG_DEFAULTS, images: [...OG_DEFAULTS.images], url: "/" },
};

export default async function HomePage() {
  const idx = getIdxClient();
  // Pull a 24-deep pool per rail (exactly 3 pages of 8) so the rails page like live's.
  const [featured, fresh] = await Promise.all([idx.getFeatured(24), idx.getNew(24)]);
  const fixture = isSampleData(); // after the awaits — reflects what was actually served
  // The feed's refresh time, NOT the newest edit among whatever happens to be in these two rails.
  // "Data last updated" is a claim about how current the SITE is, so deriving it from a handful of
  // rail listings understates it: home read 5:01 AM while /search and the listing pages read
  // 12:08 PM off the same feed. Same accessor every other surface uses.
  const dataLastUpdated = await getDataLastUpdated(new Date().toISOString());
  // The hero's number. Null when there is no database or it does not answer: the sentence then
  // simply says "Homes for sale", rather than print a number nobody measured.
  const activeCount = isDbConfigured() ? await getActiveSaleCount().catch(() => null) : null;
  // THE GROUND (lib/home-map.ts): since round 57.13 the MapLibre night map with our homes lit on it
  // (components/home/ml/, keyless); since round 58 the plates of that map. One page, one set of
  // sections.
  const ground = homeMap({ NEXT_PUBLIC_HOME_MAP: process.env.NEXT_PUBLIC_HOME_MAP });
  // Round 57.2: on the real map the hero's small words carry their own soft shadow, so the scrim
  // under them can be lighter and read as shade rather than a panel.
  const halo = "[text-shadow:0_0_2px_rgba(0,0,0,0.6),0_0_14px_rgba(0,0,0,0.65)]";
  // On the live map our cover is the load cover: fetched with the document, not when the CSS asks,
  // the tall still for a phone and the wide one for a laptop (round 57.2); the map's own first frame
  // from its own camera (lib/home-map.ts; round 57.13).
  const cover = COVERS.night;
  if (ground === "plates") {
    // Round 58: the territory plate IS the first screen (components/home/plates/), asked for with the
    // document at the density the screen needs (the srcset's widths, 100vw); AVIF, which every
    // browser of the last three years decodes, and a browser without it skips the typed preload and
    // takes the picture's WebP source.
    for (const a of ["tall", "wide"] as const) {
      const p = PLATES.hero[a];
      preload(plateSrc("hero", a, p.widths[0], "avif"), { as: "image", type: "image/avif", fetchPriority: "high", media: a === "tall" ? TALL_MEDIA : WIDE_MEDIA, imageSrcSet: plateSrcSet("hero", a, p, "avif"), imageSizes: "100vw" });
    }
    // The lights (134 KB, cached an hour) are asked for with the document too, not after hydration:
    // measured cold at 1440 (round 58), a fetch that began at 678 ms drew the lights at 1.0 s. Round
    // 58 preloaded them here (`preload("/api/lights", { as: "fetch", crossOrigin: "anonymous" })`);
    // round 59 measured that Chrome never matched the page's fetch to that preload (two full
    // downloads on every cold visit, the second at ~550 ms), so the request is now started by the
    // inline script at the top of the page (EARLY_LIGHTS) and taken by lib/idx/lights-client.ts.
  } else {
    preload(cover.tall, { as: "image", fetchPriority: "high", media: "(max-width: 1023px)" });
    preload(cover.wide, { as: "image", fetchPriority: "high", media: "(min-width: 1024px)" });
  }
  if (ground === "ml") {
    // The map's code and first bytes asked for with the document, not after hydration (round 57.12,
    // measured: the import started 0.5 to 0.8 s after DOMContentLoaded without these): the library's
    // two modules (the worker imports the same shared file from the cache), the vector tiles'
    // TileJSON, and a connection to each tile host.
    preloadModule(MAPLIBRE_URL, { as: "script" });
    preloadModule(MAPLIBRE_URL.replace("maplibre-gl.mjs", "maplibre-gl-shared.mjs"), { as: "script" });
    preload("https://tiles.openfreemap.org/planet", { as: "fetch", crossOrigin: "anonymous" });
    preconnect("https://tiles.openfreemap.org", { crossOrigin: "anonymous" });
    preconnect("https://s3.amazonaws.com", { crossOrigin: "anonymous" });
  }
  const featuredHomes = featured
    .filter((l) => l.lat && l.lng)
    .slice(0, 8)
    .map((l) => ({ id: l.id, lat: l.lat, lng: l.lng, title: `$${l.price.toLocaleString("en-US")}, ${l.address}, ${l.city}`, href: listingPath(l), price: l.price, beds: l.beds, baths: l.baths, address: l.address, city: l.city }));
  const Ground = ({ children }: { children: ReactNode }) => (
    <MlGround engine={ground} poster={cover} tail={{ shot: "region", veil: 0.86, veilPhone: 0.93 }} featured={featuredHomes}>
      {children}
    </MlGround>
  );

  return (
    // ── THE FLIGHT (round 54; the night flight's shots, which the map's cameras derive from). The page is one aerial scene and scrolling is the camera
    // flying through it: the harbour, up the river to Dutchess, the Highlands, the Tappan Zee,
    // the eleven areas one at a time, back over the harbour and out to the whole region. The
    // scene is a fixed layer BEHIND everything (components/home/ml/MlGround.tsx); every
    // section below says which shot it holds the camera on and how far it dims the scene so its
    // own words can be read. Nothing here needs the scene: the headline, the count, the search
    // box, the listings and every link are server-rendered and work with no JavaScript at all.
    //
    // `isolate` makes this element the stacking context, so the fixed canvas (z-0) sits above
    // the ground colour and below the content (z-10) without escaping into the footer.
    // `.nocturne` re-points the site's tokens to the night (app/globals.css).
    <div className="nocturne isolate relative">
      <script dangerouslySetInnerHTML={{ __html: EARLY_LIGHTS }} />
      {/* Round 65: the first plate eases in from the moment its bytes land (components/home/plates/plate-reveal.ts). */}
      {ground === "plates" ? <script dangerouslySetInnerHTML={{ __html: PLATE_REVEAL_SCRIPT }} /> : null}
      {/* `tail`: the flight does not stop where the page's sections do. Everything below them is
          the footer, and without a last leg the scene simply ended at the footer's top edge —
          a straight line straight through the middle of the region shot. The camera holds the
          region there, veiled hard, so the territory fades out behind the footer instead. */}
      <Ground>
        {/* ── Hero. The establishing shot: high over the harbour looking north up the valley,
            the whole territory one shape of light. The words sit bottom left, over New Jersey,
            where the scene has no lights; on a phone the headline is high and the search box is
            low, with the region burning between them. */}
        <section
          data-shot="hero"
          data-veil="0"
          className="relative min-h-[100svh]"
          aria-labelledby="home-hero"
        >
          {/* The lantern's field. The canvas is behind the page and takes no pointer events, so
              this empty layer forwards them: near the cursor the land brightens, the nearest
              town is named with its real count, and a click opens that town's search. It sits
              UNDER the words and the form, which are the only things here worth clicking. */}
          <div data-lantern aria-hidden className="absolute inset-0 z-0" />
          {/* rlt-hero-pad: without JavaScript the header carries one more row (the folded link
              list), so the words start one row lower there (app/globals.css). */}
          {/* pointer-events-none on the column, auto on the two blocks of words: the lantern's field
              lies under this and would otherwise never see the pointer, because a full-width
              column covers the whole first screen whether or not it has words at that point. */}
          {/* On the real map the phone's words stop 96 px above the bottom so the two links sit
              above Google's logo corner, which nothing of ours may cover (round 56 phase 1b). */}
          {/* Round 62 (the owner on his phone: "it lost all the effect"): on a phone the first screen
              is the headline at the top, the lit city in the open middle and a short count with the
              search and its two boxed links at the foot, over the ocean where the territory has no
              lights. The foot stops 44 px up: the map credit is only its 24 px (i) on a phone now. */}
          <div className="rlt-hero-pad pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1250px] flex-col justify-between px-4 pb-11 pt-32 lg:justify-end lg:px-8 lg:pb-24 lg:pt-40">
            {/* Round 57.2: the eyebrow and the headline are each their own quiet block, so the map's
                shadow can be lighter under the large, bold headline ("soft", MlGround SOFT_SHARE, at
                lg) and full under the small grey eyebrow (measured with the contrast kit). */}
            <div className="pointer-events-auto max-w-[36rem]">
              <p data-quiet className={`t-eyebrow phone-halo w-fit text-stone ${halo}`}>Hudson Valley and New York City</p>
              {/* w-fit: the headline's box hugs its words (round 57). On a phone the map's names for
                  the valley stand to the right of "home.", and a column-wide box made them read as
                  sitting on the headline to the contrast kit, which photographs a text's box. The
                  break is explicit (round 57.2): with the words wrapping on their own, w-fit's
                  max-content was the one-line width and the box took the whole column again. */}
              <h1 id="home-hero" data-quiet="soft" className="t-display phone-halo rise mt-4 w-fit text-ink">
                Let&rsquo;s find{" "}
                <br />
                home.
              </h1>
            </div>

            <div data-quiet="lead" className="pointer-events-auto mt-10 max-w-[36rem] max-[359px]:mt-6 lg:mt-9">
              {/* On a phone the count is a two-line caption over the search (17 px, the reach of
                  the towns is already the eyebrow's), so the city above it stays open. */}
              <p className={`t-lead phone-halo rise rise-2 max-w-[30rem] text-ink-soft max-lg:text-[17px] max-lg:[text-wrap:pretty] ${halo}`}>
                {activeCount ? (
                  <>
                    <span className="font-semibold tabular-nums text-ink">{activeCount.toLocaleString("en-US")}</span> homes for sale{" "}
                    <span className="max-lg:hidden">right now, from Poughkeepsie to the five boroughs.</span>
                    <span className="lg:hidden">right now.</span> <span data-lights-claim className="max-[359px]:hidden">Every light on the map is one of them.</span>
                  </>
                ) : (
                  <>
                    Homes for sale <span className="max-lg:hidden">right now, from Poughkeepsie to the five boroughs.</span>
                    <span className="lg:hidden">right now.</span> <span data-lights-claim className="max-[359px]:hidden">Every light on the map is one of them.</span></>
                )}
              </p>
              {/* One instrument (components/search-instrument.test.ts pins the geometry: 16px
                  body, 8px inset, 8px gap, so the action never touches the field, the owner's
                  standing note). Glass over the night rather than a black shelf. */}
              <form
                action="/search"
                role="search"
                className="search-instrument phone-glass rise rise-3 relative mt-7 max-[359px]:mt-5 flex w-full max-w-[34rem] items-center gap-2 rounded-2xl border border-line-strong bg-night/70 p-2 backdrop-blur-md transition-colors focus-within:border-stone hover:border-stone/70 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-porchlight"
              >
                <label htmlFor="home-search" className="sr-only">
                  Search for homes by town, zip, or address
                </label>
                <LocationSuggest
                  id="home-search"
                  anchor="form"
                  placeholder="Town, zip or address"
                  // max-[359px]: at 320 the placeholder read "Town, zip or ac": 152px of words in
                  // 108px, because the empty field also reserved the clear button's 23px. The night
                  // rule in globals.css drops that reserve while the placeholder shows, and 8px off
                  // the field's inset and 16px off the action's bring the room to 155px.
                  className="phone-halo w-full bg-transparent px-4 py-3 text-[17px] text-ink placeholder:text-stone focus:outline-none max-[359px]:px-3"
                />
                <button
                  type="submit"
                  className={`shrink-0 rounded-lg bg-ink px-6 py-3 text-[15px] font-semibold text-paper ${PRESS} hover:bg-ink-soft max-[359px]:px-4`}
                >
                  Search
                </button>
              </form>
              {/* The two boxed links (HeroLinks below), right under the search at every width (the
                  owner on his phone, 2026-09-26: below the first screen they were not seen). */}
              <p className="rise rise-4 mt-5 flex flex-wrap gap-x-3 gap-y-3 max-lg:mt-3">
                <HeroLinks />
              </p>
              {/* What the lights are, said once and small, with the data's source: this is
                  listing data drawn on the land, so it carries the MLS credit the rails below
                  carry. In the text column, never over the city. */}
              <p data-quiet className={`mt-10 hidden w-fit max-w-[26rem] text-[13px] leading-snug text-stone lg:block ${halo}`}>
                {/* The claims follow the runtime (round 57.2, components/home/g3d/claims.ts): the
                    pointing is said only while the live map with its lights stands behind, so JS
                    off or a failed map says nothing untrue. Round 57.5: it comes LAST and is hidden
                    by visibility, its room kept, so showing it at the reveal moves nothing (CLS). */}
                <span data-lights-claim>Every light is a home listed on OneKey&reg; MLS, standing where it stands. </span>
                <span data-point-claim className="invisible">
                  Point at one to see its town and price.{" "}
                </span>
              </p>
            </div>
          </div>
          {/* From lg only. On a phone the search box ends the first screen. */}
          <div data-g3d-avoid className="absolute inset-x-0 bottom-3 z-10 hidden justify-center lg:flex">
            <ScrollCue targetId="value" label="Scroll to the next section" />
          </div>
        </section>

        {/* ── The intake (round 50, owner-directed). One question (buy, sell, or both), then the
            two or three that matter, then a name. The camera has climbed the river to Dutchess,
            where our office is; the scene dims a third so the panel reads over it. */}
        <section id="value" data-shot="dutchess" data-veil="0.5" data-veil-phone="0.68" className="sec" aria-labelledby="value-heading">
          <HomeIntake />
        </section>

        {/* ── Featured listings, over the Highlands: the gorge looking south, with Storm King and
            Bear Mountain dark against the light beyond them. Cards need to be read, so the scene
            is veiled here (dimmed in the shader, not covered by a band) and keeps moving behind. */}
        <section data-shot="highlands" data-veil="0.74" data-veil-phone="0.85" className="sec" aria-labelledby="featured-heading">
          {/* data-quiet on the COLUMN, not just the heading. The veil dims the whole scene evenly,
              which is right for a card (it has a body of its own) and not enough for a heading or
              a credit line standing straight on the lights: measured, "Featured listings" ran at
              1.1:1 and the MLS credit under the rail at 2.2:1. The scene settles under the column
              the words live in, and stays open in the page's gutters and between the sections. */}
          <div data-quiet className="mx-auto max-w-[1250px] px-4 lg:px-8">
            <Reveal>
              <SectionHeading align="center" as="h2">
                <span id="featured-heading" className="mask-line">
                  <span>Featured listings</span>
                </span>
              </SectionHeading>
            </Reveal>
            {/* FEATURED DRIFTS, NEW LISTINGS DOES NOT, and that asymmetry is the point (round 31):
                two sections that differ in WEIGHT read as two sections. */}
            {/* forCard (round 61): the cards' listings without the fields no card reads (the
                descriptions, schools and the rest were ~110 KB of the page's payload). */}
            <DriftRail listings={featured.map(forCard)} ariaLabel="Featured listings" />
            <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6 night:text-moon/55" />
            <div className="mt-10 text-center">
              <Button href="/search" variant="outline">See more listings</Button>
            </div>
          </div>
        </section>

        {/* ── Testimonial: the one held shot on the page. No veil, so the Highlands stand at full
            strength behind a single quote, and the camera only drifts. */}
        <div data-shot="highlands" data-veil="0" data-veil-phone="0.3">
          <TestimonialBand items={TESTIMONIALS} />
        </div>

        {/* ── New listings, over the Tappan Zee: the river cut diagonally through the frame with
            Westchester near and Rockland beyond. Deliberately NOT Featured again — heading left,
            its link inline beside it, no second pill. */}
        <section data-shot="westchester" data-veil="0.74" data-veil-phone="0.85" className="sec" aria-labelledby="new-heading">
          <div data-quiet className="mx-auto max-w-[1250px] px-4 lg:px-8">
            <Reveal>
              {/* Last baselines, not box bottoms (round 53 polish). */}
              <div className="flex flex-wrap items-baseline-last justify-between gap-x-8 gap-y-3">
                <SectionHeading as="h2">
                  <span id="new-heading" className="mask-line">
                    <span>New listings</span>
                  </span>
                </SectionHeading>
                <Button href="/search?sort=newest" variant="ghost">
                  See all new listings
                </Button>
              </div>
            </Reveal>
            <div className="mt-10">
              <RailPager listings={fresh.map(forCard)} ariaLabel="New listings" />
            </div>
            <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6 night:text-moon/55" />
          </div>
        </section>

        {/* ── Where we work: THE chapter where the scene is the content. The camera arrives over
            each area in turn as the list scrolls (this section holds eleven shots, one per row),
            that area's homes burn and the rest of the map falls to near black. Hovering a row or
            reaching it with the keyboard flies there at once. On a phone it is a plain tappable
            list; the scene frames whichever row was last touched.
            The tall block and the sticky list give the flight room to breathe on a laptop. Round 62:
            on a phone with JavaScript the stage is pinned too (app/globals.css .rlt-areas), the map
            fills the screen above a short panel (the area under the camera and a row of chips) and
            the scroll is the flight; without JavaScript it is the plain list at its natural height. */}
        <section
          data-shot={AREA_FLIGHT.join(",")}
          data-veil="0.2"
          data-veil-phone="0.72"
          data-pin="phone"
          className="rlt-areas sec lg:min-h-[240vh]"
          aria-labelledby="areas-heading"
        >
          <div data-pin-stage className="rlt-areas-stage mx-auto max-w-[1250px] px-4 lg:sticky lg:top-24 lg:px-8">
            {/* The index keeps to the left half from lg and the scene owns the right, where the
                county the page is on is burning on its own. `data-quiet` hands the scene that
                box so the words never have a contour through them. */}
            <div data-quiet className="lg:max-w-[38rem]">
              <Reveal>
                <SectionHeading as="h2">
                  <span id="areas-heading" className="mask-line">
                    <span>Where we work</span>
                  </span>
                </SectionHeading>
                <p className="rlt-areas-lede mt-5 max-w-md text-stone">
                  Six counties of the Hudson Valley and all five boroughs.{" "}
                  {/* Round 66 (the owner: "if it adds up" on the zoom): the county counts beside
                      this list are every home for sale there; a county stop draws as many lights
                      as the gap allows, 19 to 62% of that count on a laptop, and each light's glow
                      is weighted by the homes within reach of it (../components/home/g3d/
                      light-plan.ts). The second sentence says so. The phone hides this paragraph. */}
                  <span data-lights-claim>
                    Every light is a home for sale there right now. Where homes crowd, one light stands for several.
                  </span>
                </p>
              </Reveal>
              <MlAreaChapter rows={AREA_ROWS} />
            </div>
          </div>
        </section>

        {/* ── Why work with us: arriving over the harbour, the densest light on the map. The pull
            back to the whole region is the ground's `tail` now, so it happens as the footer
            arrives rather than half a section early. */}
        <section data-shot="harbour" data-veil="0.7" data-veil-phone="0.9" className="sec" aria-labelledby="why-heading">
          {/* The harbour is the densest light on the map and this section is nearly all words, so
              the column asks the scene to settle under it. No veil can do this on its own: at the
              measured brightness here even a veil of 1.0 leaves the ledger's grey under 3:1. */}
          <div data-quiet className="mx-auto max-w-[1250px] px-4 lg:px-8">
            <Reveal>
              <SectionHeading align="center" as="h2">
                <span id="why-heading" className="mask-line">
                  <span>Why work with us?</span>
                </span>
              </SectionHeading>
            </Reveal>
            {/* Our own product screenshots in a laptop carousel. */}
            <Reveal>
              <div className="mt-12">
                <WhyCarousel />
              </div>
            </Reveal>
            {/* A LEDGER, not four big numbers: each fact is a hairline-ruled row — the number in
                the display face, the claim as a sentence, and the thing a visitor can DO about
                it. Rendered on the SERVER with no count-up and no interim state. */}
            <Reveal>
              <p className="mx-auto mt-10 max-w-xl text-center leading-[1.75] text-stone max-lg:text-ink-soft">
                Every screen above is our own product, running on live MLS data. The rest of the
                case is three numbers.
              </p>
            </Reveal>
            <Reveal>
              <ul className="mt-16 border-t border-line">
                {[
                  {
                    n: "24h",
                    claim: "A written cash offer on your home, inside twenty-four hours.",
                    act: "See your number",
                    href: "/home-value",
                  },
                  {
                    n: "100+",
                    claim: "Search sites your listing reaches when we take it to market.",
                    act: "How we sell",
                    href: "/selling",
                  },
                  {
                    n: "7",
                    claim: "Days a week a person answers the phone.",
                    act: `Call ${SITE.phone}`,
                    href: SITE.phoneHref,
                  },
                ].map((f) => (
                  <li
                    key={f.n}
                    className="flex flex-col gap-2 border-b border-line py-8 md:grid md:grid-cols-[11rem_1fr_auto] md:items-baseline md:gap-x-8"
                  >
                    {/* The figure in the display face at section size: on the night page the
                        ledger is the one place numbers lead. */}
                    <span className="t-h2 tabular-nums text-ink">{f.n}</span>
                    <p className="leading-[1.7] text-stone">{f.claim}</p>
                    {/* self-start: in the stacked phone row the Button would stretch and centre
                        its text against an otherwise left-aligned ledger. */}
                    <Button href={f.href} variant="ghost" className="self-start md:self-baseline">
                      {f.act}
                    </Button>
                  </li>
                ))}
              </ul>
            </Reveal>
            <div className="mt-12 text-center">
              <Button href="/connect">Talk to us</Button>
            </div>
          </div>
        </section>
      </Ground>
    </div>
  );
}

/** Round 58 (the owner's fifth verdict): the two links under the search "should be a small box or
 * something to differentiate, so people know it's a clickable CTA". Two small boxed controls in the
 * search box's own glass: 12 px radius (the buttons' step of the scale), a hairline, the night
 * buttons' 15 px semibold, no arrow, 40 px tall (the tap floor and more), the border and the fill
 * answering a hover, the porchlight ring answering the keyboard. */
function HeroLinks() {
  return (
    <>
      {/* Round 65 (E): under 375 px the two boxes wrapped onto two rows and the words covered the
          map (320 x 568: a 40 px window, one county named); the nav's own short label keeps them
          on one row there. */}
      {[
        { href: "/home-value", label: "What is my home worth?", short: "Home value" },
        { href: "/selling", label: "Sell with us", short: null },
      ].map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className={`phone-glass phone-halo inline-flex min-h-[40px] items-center rounded-xl border border-line-strong bg-night/45 px-4 text-[15px] font-semibold tracking-[-0.005em] text-ink backdrop-blur-md hover:border-stone hover:bg-night/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-porchlight ${PRESS}`}
        >
          {c.short ? (
            <>
              <span className="max-[374px]:hidden">{c.label}</span>
              <span className="min-[375px]:hidden">{c.short}</span>
            </>
          ) : (
            c.label
          )}
        </Link>
      ))}
    </>
  );
}
