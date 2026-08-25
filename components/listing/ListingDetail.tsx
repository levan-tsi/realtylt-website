import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackView } from "@/components/portal/TrackView";
import { ListingCard, priceLabel } from "@/components/idx/ListingCard";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { ListingPhotos } from "@/components/idx/ListingPhotos";
import { LeadForm } from "@/components/leads/LeadForm";
import { fullAddress, infoRequestQualifier } from "@/lib/leads/listing-intents";
import { ListingLeadCTAs } from "@/components/leads/ListingLeadCTAs";
import { ListingPager } from "@/components/listing/ListingPager";
import { ListingSubNav } from "@/components/listing/ListingSubNav";
import { MarketInsights } from "@/components/listing/MarketInsights";
import { ClampedDescription, SpecDisclosure } from "@/components/listing/SpecDisclosure";
import { MortgageCalculator } from "@/components/financing/MortgageCalculator";
import { getAreaInsights } from "@/lib/idx/db";
import { getDataLastUpdated, getIdxClient, isSampleData } from "@/lib/idx";
import type { Listing } from "@/lib/idx/types";
import { getProxiedPhotoPaths } from "@/lib/idx/media";
import { listingPath } from "@/lib/idx/listing-url";
import { calcMortgage } from "@/lib/mortgage";
import { SERVED_AREAS, SITE } from "@/lib/site";
import { breadcrumbsJsonLd, jsonLdScript } from "@/lib/jsonld";

// generateMetadata + the page both need the listing — cache() dedupes to one lookup per request.
// Exported so the /listing/[id] redirect stub and the /homes-for-sale slug route share it.
export const getListingCached = cache((id: string) => getIdxClient().getListing(id));

/** Shared listing metadata — canonical + OG point at the SEO slug URL for both routes. */
export async function listingMetadata(id: string): Promise<Metadata> {
  const l = await getListingCached(id);
  if (!l) return { title: "Listing not found" };
  const canonical = `${SITE.url}${listingPath(l)}`;
  const title = `${l.address}, ${l.city} NY ${l.zip} | ${priceLabel(l)}`;
  const description = l.description.slice(0, 160);
  // Share a house, show the house. Setting `openGraph` at all REPLACES the layout's object,
  // images included — so this page was emitting og:title/description/url/type and NO og:image,
  // and a listing pasted into Facebook, WhatsApp or iMessage previewed with no picture at all.
  // The cover goes through the same absolute /api/media proxy URL the page's JSON-LD already
  // publishes (never a raw MediaURL), and only when the listing has a photo the proxy can
  // actually serve — photoCount is idx_listings.photos_servable — else the brand card.
  const share =
    (l.photoCount ?? 0) > 0
      ? { url: `${SITE.url}/api/media/${l.id}/0`, alt: `${l.address}, ${l.city}, NY` }
      : { url: `${SITE.url}/og.png`, width: 1200, height: 630, alt: SITE.name };
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", images: [share] },
    twitter: { card: "summary_large_image", title, description, images: [share.url] },
  };
}

/** Rows stored before the 2026-07-15 structured-facts sync squashed these into the
 * `features` strings — recover them so the fallback path renders the same page. */
function factFromFeatures(l: Listing, re: RegExp): string | undefined {
  for (const f of l.features) {
    const m = re.exec(f);
    if (m) return m[1];
  }
  return undefined;
}

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export async function ListingDetail({ id }: { id: string }) {
  const l = await getListingCached(id);
  if (!l) notFound();
  // Rentals render as a "For Rent" listing: price is the monthly rent, and the sale-only
  // sections (mortgage/payment, price-per-sqft, for-sale market insights) are hidden.
  const isRental = l.propertyType === "Rental";
  // Snapshot listings carry only the primary /api/media proxy path — resolve the
  // FULL on-demand gallery (ONE short-TTL-cached MLS data lookup per detail view;
  // photos themselves stream through the CDN-cached proxy). Fixture/local listings
  // keep their own photo arrays.
  // `mirrored` = how many of these are permanently in our Storage bucket, so the page knows
  // whether the photo count is a FACT it may print or only the feed's claim (see GalleryPhotos).
  const gallery = l.photos[0]?.startsWith("/api/media/")
    ? await getProxiedPhotoPaths(l.id)
    : { paths: l.photos, mirrored: l.photos.length };
  const photos = gallery.paths;
  const county = SERVED_AREAS.find((c) => c.slug === l.county);

  // ── Facts (structured fields, with legacy-row fallbacks parsed from `features`)
  const yearBuilt = l.yearBuilt ?? (Number(factFromFeatures(l, /^Built (\d{4})$/)) || undefined);
  const lotAcres = l.lotAcres ?? (Number(factFromFeatures(l, /^([\d.]+) acres?$/)) || undefined);
  const subType = l.propertySubType ?? l.features.find((f) => !/^(Built \d{4}|[\d.]+ acres?|Listed by )/.test(f));
  const agentName = l.listAgentName ?? factFromFeatures(l, /^Listed by (.+)$/);
  const mlsNumber = l.id.replace(/^[A-Za-z]+/, "");
  const daysOnSite = Math.max(0, Math.floor((Date.now() - Date.parse(l.listedAt)) / 86_400_000));
  const listedOn = new Date(l.listedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Headline monthly estimate — same math + defaults the calculator section opens with.
  const mortgageSeed = {
    price: l.price,
    annualTax: Math.round(l.taxAnnual ?? l.price * 0.018),
    termYears: 30,
    downPct: 20,
    ratePct: 6.25,
    monthlyHoa: Math.round(l.hoaFee ?? 0),
    monthlyInsurance: 200,
  };
  const estMonthly = calcMortgage(mortgageSeed).monthlyTotal;

  // ── Similar active listings nearby (same county, ±30% price), excluding this one. A rental
  // matches other rentals (rental: true keeps the two universes apart and skips the sale floor).
  const similarSearch = await getIdxClient()
    .search({
      county: l.county,
      priceMin: Math.round(l.price * 0.7),
      priceMax: Math.round(l.price * 1.3),
      rental: isRental,
      sort: "newest",
      pageSize: 4,
    })
    .catch(() => null);
  const similar = (similarSearch?.listings ?? []).filter((s) => s.id !== l.id).slice(0, 3);
  const similarTotal = Math.max(0, (similarSearch?.total ?? 0) - 1);
  const similarHref = `/search?county=${l.county}${isRental ? "&rental=1" : ""}&priceMin=${Math.round(l.price * 0.7)}&priceMax=${Math.round(l.price * 1.3)}`;

  // Real market insights for this listing's city (DB aggregates; falls back to the county set
  // when the city has too few actives). Skipped for rentals — those numbers describe the local
  // for-SALE market and would misread on a rental page. null = section renders a soft note.
  const insights = isRental ? null : await getAreaInsights(l.city, l.county, county?.name ?? l.county).catch(() => null);

  const highlights: [string, string][] = (
    [
      ["Type", subType ?? l.propertyType],
      yearBuilt ? ["Year built", String(yearBuilt)] : null,
      lotAcres ? ["Lot size", `${lotAcres} acre${lotAcres === 1 ? "" : "s"}`] : null,
      l.garageSpaces ? ["Garage", `${l.garageSpaces} space${l.garageSpaces === 1 ? "" : "s"}`] : null,
      // Price-per-sqft is a for-SALE metric; on a rental it would read rent÷sqft as a sale $/sqft.
      !isRental && l.sqft > 0 ? ["Price / sqft", fmtMoney(l.price / l.sqft)] : null,
      l.taxAnnual ? ["Annual taxes", fmtMoney(l.taxAnnual)] : null,
      l.hoaFee ? ["HOA", `${fmtMoney(l.hoaFee)}/mo`] : null,
      county ? ["County", county.name] : null,
      l.schoolDistrict ? ["School district", l.schoolDistrict] : null,
      ["Listed", listedOn],
      ["MLS #", mlsNumber],
    ] as ([string, string] | null)[]
  ).filter((x): x is [string, string] => !!x);

  const interior: [string, string[]][] = (
    [
      l.interiorFeatures?.length ? ["Interior", l.interiorFeatures] : null,
      l.appliances?.length ? ["Appliances", l.appliances] : null,
      l.basement?.length ? ["Basement", l.basement] : null,
      l.heating?.length ? ["Heating", l.heating] : null,
      l.cooling?.length ? ["Cooling", l.cooling] : null,
    ] as ([string, string[]] | null)[]
  ).filter((x): x is [string, string[]] => !!x);

  const exterior: [string, string[]][] = (
    [
      l.exteriorFeatures?.length ? ["Exterior", l.exteriorFeatures] : null,
      l.lotFeatures?.length ? ["Lot", l.lotFeatures] : null,
      l.parkingFeatures?.length ? ["Parking", l.parkingFeatures] : null,
      l.sewer?.length ? ["Sewer", l.sewer] : null,
      l.waterSource?.length ? ["Water", l.waterSource] : null,
    ] as ([string, string[]] | null)[]
  ).filter((x): x is [string, string[]] => !!x);

  const schools: [string, string][] = (
    [
      l.elementarySchool ? ["Elementary", l.elementarySchool] : null,
      l.middleSchool ? ["Middle", l.middleSchool] : null,
      l.highSchool ? ["High school", l.highSchool] : null,
    ] as ([string, string] | null)[]
  ).filter((x): x is [string, string] => !!x);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: `${l.address}, ${l.city}, NY ${l.zip}`,
    url: `${SITE.url}${listingPath(l)}`,
    // Only claim images we can actually SERVE. `photos` deliberately keeps one speculative
    // path when nothing is mirrored yet, so the page asks and the route answers with the
    // branded coming-soon still — good for the visitor, but publishing that path here would
    // tell Google this house has a photograph when what it has is our logo. gallery.mirrored
    // is the servable count (idx_listings.photos_servable), so a listing waiting on the mirror
    // simply has no `image` until it does.
    ...(gallery.mirrored > 0
      ? { image: photos.map((p) => (p.startsWith("http") ? p : `${SITE.url}${p}`)) }
      : {}),
    description: l.description,
    datePosted: l.listedAt,
    about: {
      "@type": l.propertyType === "Multi-Family" ? "House" : "SingleFamilyResidence",
      numberOfRooms: l.beds,
      numberOfBathroomsTotal: l.baths,
      floorSize: { "@type": "QuantitativeValue", value: l.sqft, unitCode: "FTK" },
      ...(yearBuilt ? { yearBuilt } : {}),
      address: {
        "@type": "PostalAddress",
        streetAddress: l.address,
        addressLocality: l.city,
        addressRegion: "NY",
        postalCode: l.zip,
      },
      // Feed rows without coordinates (zip-centroid mode) must not claim geo 0,0.
      ...(l.lat && l.lng ? { geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng } } : {}),
    },
    offers: {
      "@type": "Offer",
      price: l.price,
      priceCurrency: "USD",
      availability: l.status === "Active" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
    },
  };

  // The schema twin of the visible "Search / County" trail below (round 39). Home first —
  // conventional for BreadcrumbList — and the listing itself last, name-only per Google's
  // guidance for the current page.
  const breadcrumbLd = breadcrumbsJsonLd(SITE.url, [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
    ...(county ? [{ name: county.name, path: `/top-areas/${county.slug}` }] : []),
    { name: `${l.address}, ${l.city}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <TrackView
        listingId={l.id}
        meta={{ address: l.address, city: l.city, price: l.price, beds: l.beds }}
      />

      {/* ── Sticky sub-nav (live parity): in-page anchors + Make an Offer / Share / Save. */}
      <ListingSubNav
        countySlug={l.county}
        hasSchools={schools.length > 0}
        hidePayment={isRental}
        shareTitle={`${l.address}, ${l.city} NY | ${priceLabel(l)}`}
        favoriteId={l.id}
      />

      {/* ── Gallery. ListingPhotos owns which photos actually exist (a tile whose media never
          arrives is dropped, never swapped for the "coming soon" artwork beside real photos) and
          keeps the no-JS <details> fallback for scripting-off visitors. */}
      <section className="bg-ink" aria-label="Photos">
        <ListingPhotos
          photos={photos}
          guaranteed={gallery.mirrored}
          address={`${l.address}, ${l.city}, ${l.state} ${l.zip}`}
          addressShort={l.address}
          city={l.city}
          mapQuery={`${l.address}, ${l.city}, ${l.state} ${l.zip}`}
          status={l.status}
          favoriteId={l.id}
        />
      </section>


      {/* ── Facts + contact */}
      <section id="overview" className="scroll-mt-16 bg-paper py-8 md:pb-16 md:pt-10">
        {/* grid-cols-1: the implicit `auto` track was sized by min-content, and two things in
            this column cannot shrink — the lead form's <select> (its widest option is 299px) and
            the tour day strip (313px, and it has overflow-x-auto precisely so it can scroll
            instead of pushing). At 320 that made the track 362px inside a 320px box. */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 lg:grid-cols-[1.5fr_1fr] lg:px-8">
          <div>
            {/* Share lives in the sticky sub-nav only — one Share control on the page, like live.
                The prev/next pager shares this row: the breadcrumb already says WHERE THIS CAME
                FROM, and moving within that set is the same thought. It also owns the only row on
                the page with spare width at 320 — the sticky sub-nav's action group is 281px of a
                320px screen, so a pager there overflowed the viewport by 88px (measured). */}
            {/* flex-wrap: the pager now names itself ("LISTING 3 OF 36") and that word costs
                width. On a 320px phone the breadcrumb alone is ~185px, so rather than shorten the
                label — the label IS the fix — the pager drops to its own line. */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <nav aria-label="Breadcrumb" className="min-w-0 text-xs uppercase tracking-[0.14em] text-stone">
                <Link href="/search" className="inline-flex min-h-6 items-center hover:text-ink">Search</Link>
                {county && (
                  <>
                    {" / "}
                    <Link href={`/top-areas/${county.slug}`} className="inline-flex min-h-6 items-center hover:text-ink">
                      {county.name}
                    </Link>
                  </>
                )}
              </nav>
              <ListingPager id={l.id} />
            </div>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
              {/* THE ADDRESS IS THE HEADLINE, AND IT WAS NOT LEADING. `text-3xl md:text-4xl`
                  put it at 36px beside a 30px price — a ratio of 1.20, which the rubric reads as
                  a flat hierarchy and the eye reads as two competing bold blocks. It was also
                  36px on a scale whose steps are 76/56/44/30/11, i.e. a size the design system
                  does not have. `.t-h2` is the committed step (30 -> 44 fluid): ratio 1.47.

                  font-normal is a deliberate half-step off the scale's own 300, and it was
                  rendered four ways before choosing (docs/r33/listing/h1-compare.png). At 300 a
                  fourteen-character address goes weedy next to a bold price and the price
                  becomes the headline; 600 is blunt at 44px. The scale's 300 is calibrated for
                  long marketing headlines, not for a three-word title. */}
              <h1 className="t-h2 font-normal text-ink">{l.address}</h1>
              <div className="text-right">
                <p className="font-mono text-3xl font-semibold tracking-tight text-ink">{priceLabel(l)}</p>
                {/* The "Est. $/mo" seed is a mortgage estimate — meaningless for a rental (whose
                    price already IS the monthly rent), so it's hidden alongside the payment section. */}
                {!isRental && Number.isFinite(estMonthly) && estMonthly > 0 && (
                  <a
                    href="#payment"
                    className="inline-flex min-h-6 items-center font-mono text-sm text-stone underline decoration-ink/20 underline-offset-4 hover:text-ink"
                  >
                    Est. {fmtMoney(estMonthly)}/mo
                  </a>
                )}
              </div>
            </div>
            <p className="mt-1 text-lg text-stone">
              {l.city}, {l.state} {l.zip} · {county?.name}
            </p>

            <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-y border-ink/10 py-5">
              {(
                [
                  // Drop beds/baths/sqft the feed left at 0 (multi-family / land rows).
                  ...(l.beds > 0 ? [["Beds", String(l.beds)]] : []),
                  ...(l.baths > 0 ? [["Baths", String(l.baths)]] : []),
                  ...(l.sqft > 0 ? [["Sqft", l.sqft.toLocaleString("en-US")]] : []),
                  ["Status", l.status + (l.openHouse ? " · Open house" : "")],
                  ["On site", daysOnSite === 0 ? "Today" : `${daysOnSite} day${daysOnSite === 1 ? "" : "s"}`],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone">{k}</dt>
                  <dd className="mt-1 font-mono text-lg text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Live pairs the status row with a financing link; ours points at the real page. */}
            {!isRental && (
              <p className="mt-4 text-sm text-stone">
                Know your budget before you tour.{" "}
                <Link
                  href="/financing"
                  className="inline-flex min-h-6 items-center font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
                >
                  Get pre-qualified
                </Link>
              </p>
            )}

            {/* Body sections collapse at 390 only (pure CSS, no JS) so a phone visitor reaches the
                payment calculator without scrolling thousands of pixels of spec lists. Desktop is
                unchanged: everything open, no controls. */}
            {/* All five body headings on this page were an ad-hoc 24px, a size the type scale
                does not contain. `.t-h3` is the step that exists (22 -> 30). */}
            <h2 className="mt-8 t-h3 text-ink">About this home</h2>
            <ClampedDescription text={l.description} />

            <SpecDisclosure title="Highlights">
              <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {highlights.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-2">
                    <dt className="text-sm text-stone">{k}</dt>
                    <dd className="text-right text-sm font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </SpecDisclosure>

            {interior.length > 0 && (
              <SpecDisclosure title="Inside">
                <dl className="mt-3 space-y-3">
                  {interior.map(([k, vals]) => (
                    <div key={k} className="grid gap-1 sm:grid-cols-[130px_1fr]">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone sm:pt-0.5">{k}</dt>
                      <dd className="text-sm leading-relaxed text-ink-soft">{vals.join(" · ")}</dd>
                    </div>
                  ))}
                </dl>
              </SpecDisclosure>
            )}

            {exterior.length > 0 && (
              <SpecDisclosure title="Outside & utilities">
                <dl className="mt-3 space-y-3">
                  {exterior.map(([k, vals]) => (
                    <div key={k} className="grid gap-1 sm:grid-cols-[130px_1fr]">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone sm:pt-0.5">{k}</dt>
                      <dd className="text-sm leading-relaxed text-ink-soft">{vals.join(" · ")}</dd>
                    </div>
                  ))}
                </dl>
              </SpecDisclosure>
            )}

            {schools.length > 0 && (
              <SpecDisclosure
                id="schools"
                title="Schools"
                note="As reported by the listing office; verify enrollment with the district."
              >
                <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {schools.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-2">
                      <dt className="text-sm text-stone">{k}</dt>
                      <dd className="text-right text-sm font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </SpecDisclosure>
            )}

            {/* Legacy rows (pre-structured sync) keep their flat feature list. */}
            {interior.length === 0 && exterior.length === 0 && l.features.length > 0 && (
              <SpecDisclosure title="Features">
                <ul className="mt-3 grid max-w-2xl gap-2 sm:grid-cols-2">
                  {l.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                      <span aria-hidden className="mt-0.5 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </SpecDisclosure>
            )}

            <p className="mt-10 rounded-2xl bg-mist px-4 py-3 text-sm text-stone">
              Listed with <strong className="text-ink">{l.listOfficeName}</strong>
              {agentName ? <> · {agentName}</> : null} · Source: {l.originatingSystem}
            </p>
            {/* Feed refresh time, NOT this listing's modificationTimestamp — the label says
                "Data last updated" and must mean the same thing it means on /search. */}
            <MlsAttribution
              dataLastUpdated={await getDataLastUpdated(l.modificationTimestamp)}
              fixtureMode={isSampleData()}
              logoSize="lg"
              className="mt-4"
            />
          </div>

          {/* Contact CTA.
              NOT scroll-revealed, deliberately. This column was wrapped in <Reveal delay={100}>,
              and on the photo-rich listing that left Request a Tour, Make an Offer, the agent
              card and the lead form at opacity 0 on first paint — an empty white column beside
              the facts (measured: wrapper `class="reveal"`, opacity 0, at 1440x900). Reveal's
              rule is fixed separately and correctly, but the deeper answer is that this is the
              wrong thing to gate on scroll: a reveal earns its place when something arrives, and
              this column is simply there, next to the facts, from the moment the page loads. The
              only thing the fade could add was a way for it to be missing. */}
            {/* self-start is load-bearing now that the Reveal wrapper is gone: this <aside> is
                the grid item itself, a grid item stretches to the row's height by default, and a
                `position: sticky` box that already spans its whole row has nothing to travel
                through — measured 836px tall inside the old wrapper, 1941px as a stretched cell,
                which silently turned the sticky contact card into an ordinary scrolling one. */}
            <aside className="self-start lg:sticky lg:top-24">
              <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-float md:p-7">
                {/* Primary conversion CTAs (live parity): tour + offer, each a bottom-sheet modal. */}
                <ListingLeadCTAs
                  infoTargetId="listing-info-form"
                  listing={{
                    id: l.id,
                    address: l.address,
                    city: l.city,
                    state: l.state,
                    zip: l.zip,
                    price: l.price,
                    mlsNumber,
                  }}
                />
                <div className="mt-6 flex items-center gap-4">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-ink/10">
                    <Image
                      src="/images/levan-portrait.jpg"
                      alt="Levan Tsiklauri"
                      fill
                      sizes="56px"
                      className="object-cover object-top grayscale"
                    />
                  </span>
                  <div>
                    <p className="font-display text-lg leading-tight text-ink">Levan Tsiklauri</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-stone">United Real Estate</p>
                    {/* Live pairs the agent card with a profile link; ours points at the real page. */}
                    <Link
                      href="/who-we-are"
                      className="mt-0.5 inline-flex min-h-6 items-center text-xs text-stone underline decoration-ink/20 underline-offset-4 hover:text-ink hover:decoration-ink"
                    >
                      View agent profile
                    </Link>
                  </div>
                </div>
                <p className="mb-5 mt-4 text-sm text-stone">
                  Tours, questions, offers: call{" "}
                  <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-6 items-center font-medium text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink">
                    {SITE.phone}
                  </a>{" "}
                  or send a note.
                </p>
                <div id="listing-info-form">
                  <LeadForm
                    compact
                    defaultReason="I'm interested in buying a home"
                    // Name the property, exactly like the tour and offer sheets on this page do.
                    // Without these the agent got a bare "interested in buying a home" and had to
                    // read the listing id out of the source URL.
                    addressValue={fullAddress({ address: l.address, city: l.city, state: l.state, zip: l.zip })}
                    qualifier={infoRequestQualifier({ mlsNumber, listPrice: l.price })}
                    submitLabel="Request Info / Tour"
                    successTitle="Request sent."
                    successBody={`We'll get back to you about ${l.address} shortly.`}
                  />
                </div>
              </div>
            </aside>
        </div>
      </section>

      {/* ── Payment (for-sale only — a rental has no mortgage; the section + its seed are hidden) */}
      {!isRental && (
        <section id="payment" aria-labelledby="calc-heading" className="scroll-mt-16 bg-paper pb-12 md:pb-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <MortgageCalculator initial={mortgageSeed} />
            {!l.taxAnnual && (
              <p className="mt-3 t-fine text-stone">
                Taxes are estimated; the listing office didn't report an annual tax figure.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Never miss a property (live parity): black band → the existing save-search flow,
          prefilled from this listing's county.
          THE ACTION IS NAMED FOR WHAT IT DOES. This said "Sign Up", which promised an account and
          delivered a dialog titled "Save this search" — and with accounts shut (accountsEnabled
          false) that dialog hides both of its sign-in affordances, so the one thing the label
          named was the one thing that could not happen. An action keeps a single name through the
          whole flow; the band's heading and the bell already carry the alerting promise. */}
      {/* THE VERTICAL RHYTHM IS A COMMITTED SCALE AND THIS PAGE WAS THE ONE IGNORING IT. Every
          other page picks sec-sm/sec/sec-lg (80/112/144 at desktop); the listing page's three
          marketing bands were an ad-hoc py-12 md:py-16 (48/64), which is why three consecutive
          full-width bands read cramped against the same bands on /buying and /financing. The
          facts section above deliberately keeps its tighter 40px top — it sits directly under
          the photo band and 80px there pushes the price out of the first viewport. */}
      <section className="sec-sm bg-ink text-paper" aria-labelledby="never-miss-heading">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 id="never-miss-heading" className="t-h2 text-paper">
              Never miss a property
            </h2>
            <p className="mt-2 text-paper/75">
              Be the first to know when a {county?.name ?? "local"} {isRental ? "rental" : "home"} hits the market.
            </p>
          </div>
          <Link
            href={`/search?county=${l.county}${isRental ? "&rental=1" : ""}&saveSearch=1`}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-paper px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-paper/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 8.2a4.5 4.5 0 0 1 9 0c0 3.2.9 4.6 1.5 5.3H4c.6-.7 1.5-2.1 1.5-5.3Z" />
              <path d="M8.4 16a1.8 1.8 0 0 0 3.2 0" />
            </svg>
            Save this search
          </Link>
        </div>
      </section>

      {/* ── Market insights (BEAT live's N/A): real DB aggregates for this city. Hidden for
          rentals — the figures describe the for-SALE market and would misread on a rental. */}
      {!isRental && (
        <MarketInsights insights={insights} city={l.city} countyName={county?.name ?? l.county} fixtureMode={isSampleData()} />
      )}

      {/* ── Similar homes */}
      {similar.length > 0 && (
        <section className="sec-sm border-t border-ink/10 bg-paper" aria-labelledby="similar-heading">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="similar-heading" className="t-h3 text-ink">
                Similar homes in {county?.name ?? "the area"}
              </h2>
              {similarTotal > similar.length && (
                <Link
                  href={similarHref}
                  className="inline-flex min-h-6 items-center text-xs font-bold uppercase tracking-[0.14em] text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink"
                >
                  See all {similarTotal.toLocaleString("en-US")}
                </Link>
              )}
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <ListingCard key={s.id} listing={s} variant="plain" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
