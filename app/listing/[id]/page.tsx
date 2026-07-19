import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/idx/FavoriteButton";
import { TrackView } from "@/components/portal/TrackView";
import { formatPrice, isLiveMlsPhoto, ListingCard, NoPhoto } from "@/components/idx/ListingCard";
import { MlsImage } from "@/components/idx/MlsImage";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { ShareButton } from "@/components/idx/ShareButton";
import { ListingGallery } from "@/components/idx/ListingGallery";
import { LeadForm } from "@/components/leads/LeadForm";
import { ListingLeadCTAs } from "@/components/leads/ListingLeadCTAs";
import { MortgageCalculator } from "@/components/financing/MortgageCalculator";
import { Reveal } from "@/components/ui/Reveal";
import { FIXTURE_LISTINGS } from "@/lib/idx/fixture-data";
import { getIdxClient, isFixtureMode, isSampleData } from "@/lib/idx";
import type { Listing } from "@/lib/idx/types";
import { getProxiedPhotoPaths } from "@/lib/idx/media";
import { calcMortgage } from "@/lib/mortgage";
import { SERVED_AREAS, SITE } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonld";

export async function generateStaticParams() {
  // Fixture ids pre-render; live-feed ids resolve on demand (dynamicParams).
  return isFixtureMode() ? FIXTURE_LISTINGS.map((l) => ({ id: l.id })) : [];
}
export const dynamicParams = true;
export const revalidate = 600; // keep listing rails + "Data last updated" fresh in live mode

// generateMetadata + the page both need the listing — cache() dedupes to one lookup per request.
const getListing = cache((id: string) => getIdxClient().getListing(id));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const l = await getListing(id);
  if (!l) return { title: "Listing not found" };
  return {
    title: `${l.address}, ${l.city} NY ${l.zip} | ${formatPrice(l.price)}`,
    description: l.description.slice(0, 160),
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

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await getListing(id);
  if (!l) notFound();
  // Snapshot listings carry only the primary /api/media proxy path — resolve the
  // FULL on-demand gallery (ONE short-TTL-cached MLS data lookup per detail view;
  // photos themselves stream through the CDN-cached proxy). Fixture/local listings
  // keep their own photo arrays.
  const photos = l.photos[0]?.startsWith("/api/media/")
    ? await getProxiedPhotoPaths(l.id)
    : l.photos;
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

  // ── Similar active homes nearby (same county, ±30% price), excluding this one.
  const similarSearch = await getIdxClient()
    .search({
      county: l.county,
      priceMin: Math.round(l.price * 0.7),
      priceMax: Math.round(l.price * 1.3),
      sort: "newest",
      pageSize: 4,
    })
    .catch(() => null);
  const similar = (similarSearch?.listings ?? []).filter((s) => s.id !== l.id).slice(0, 3);
  const similarTotal = Math.max(0, (similarSearch?.total ?? 0) - 1);
  const similarHref = `/search?county=${l.county}&priceMin=${Math.round(l.price * 0.7)}&priceMax=${Math.round(l.price * 1.3)}`;

  const highlights: [string, string][] = (
    [
      ["Type", subType ?? l.propertyType],
      yearBuilt ? ["Year built", String(yearBuilt)] : null,
      lotAcres ? ["Lot size", `${lotAcres} acre${lotAcres === 1 ? "" : "s"}`] : null,
      l.garageSpaces ? ["Garage", `${l.garageSpaces} space${l.garageSpaces === 1 ? "" : "s"}`] : null,
      l.sqft > 0 ? ["Price / sqft", fmtMoney(l.price / l.sqft)] : null,
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
    url: `${SITE.url}/listing/${l.id}`,
    image: photos.map((p) => (p.startsWith("http") ? p : `${SITE.url}${p}`)),
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <TrackView
        listingId={l.id}
        meta={{ address: l.address, city: l.city, price: l.price, beds: l.beds }}
      />

      {/* ── Gallery (photos open a full-screen lightbox; the <details> below keeps the no-JS
          "show all photos" fallback working). */}
      <section className="bg-ink" aria-label="Photos">
        <ListingGallery photos={photos} address={`${l.address}, ${l.city}, ${l.state} ${l.zip}`}>
          {/* With ≤1 photo there are no thumbnails — let the main tile span the row instead
              of leaving a black void beside the placeholder. */}
          <div
            className={`mx-auto grid max-w-7xl gap-1.5 px-0 lg:px-8 lg:py-6 ${
              photos.length > 1 ? "md:grid-cols-[2fr_1fr]" : ""
            }`}
          >
            {/* Cap the band on desktop so price/facts sit inside the first viewport (live
                parity — "opening a listing" must show the home AND its numbers, not only pics). */}
            <div
              className={`photo-zoom relative overflow-hidden md:rounded-[2px] ${
                photos.length > 1 ? "aspect-[3/2] lg:aspect-auto lg:h-[400px]" : "aspect-[3/2] md:aspect-[21/9] md:max-h-[400px]"
              }`}
            >
              {photos.length > 0 ? (
                isLiveMlsPhoto(photos[0]) ? (
                  <MlsImage src={photos[0]} alt={`${l.address}, ${l.city}, main photo`} priority sizes="(max-width: 768px) 100vw, 60vw" />
                ) : (
                  <Image src={photos[0]} alt={`${l.address}, ${l.city}, main photo`} fill priority sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" />
                )
              ) : (
                <NoPhoto />
              )}
              <FavoriteButton id={l.id} className="absolute right-4 top-4 z-10" />
              {l.status !== "Active" && (
                <span className="absolute left-4 top-4 z-[6] bg-ink/85 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-paper backdrop-blur">
                  {l.status}
                </span>
              )}
              {/* Transparent trigger — keyboard + mouse open the lightbox (delegated). */}
              {photos.length > 0 && (
                <button
                  type="button"
                  data-lightbox-index={0}
                  aria-label={`View all ${photos.length} photo${photos.length === 1 ? "" : "s"} full screen`}
                  className="absolute inset-0 z-[5] cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-paper"
                />
              )}
            </div>
            {photos.length > 1 && (
              <div className="hidden grid-rows-3 gap-1.5 md:grid">
                {photos.slice(1, 4).map((p, i) => (
                  <div
                    key={p + i}
                    data-lightbox-index={i + 1}
                    role="button"
                    tabIndex={0}
                    aria-label={`View photo ${i + 2} full screen`}
                    className="photo-zoom relative cursor-zoom-in overflow-hidden rounded-[2px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper"
                  >
                    {isLiveMlsPhoto(p) ? (
                      <MlsImage src={p} alt={`${l.address}, photo ${i + 2}`} sizes="30vw" />
                    ) : (
                      <Image src={p} alt={`${l.address}, photo ${i + 2}`} fill sizes="30vw" className="object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Full gallery — native <details> so it works without JS. Desktop already shows
              photos 1–4 above, so its grid hides the first three tiles; mobile shows every
              photo from #2 on. Off-screen tiles lazy-load through the CDN-cached proxy. */}
          {photos.length > 1 && (
            <details className="group mx-auto max-w-7xl px-0 pb-3 lg:px-8 lg:pb-6">
              <summary className="mx-4 my-2 inline-flex min-h-6 cursor-pointer list-none items-center gap-2 border border-paper/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-paper transition-colors hover:border-paper/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper lg:mx-0 [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Show all {photos.length} photos</span>
                <span className="hidden group-open:inline">Hide photos</span>
              </summary>
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 md:grid-cols-3">
                {photos.slice(1).map((p, i) => (
                  <div
                    key={p + i}
                    data-lightbox-index={i + 1}
                    role="button"
                    tabIndex={0}
                    aria-label={`View photo ${i + 2} full screen`}
                    className={`photo-zoom relative aspect-[3/2] cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper md:rounded-[2px] ${i < 3 ? "md:hidden" : ""}`}
                  >
                    {isLiveMlsPhoto(p) ? (
                      <MlsImage src={p} alt={`${l.address}, photo ${i + 2}`} sizes="(max-width: 768px) 50vw, 33vw" />
                    ) : (
                      <Image src={p} alt={`${l.address}, photo ${i + 2}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </ListingGallery>
      </section>

      {/* ── Facts + contact */}
      <section className="bg-paper py-8 md:pb-16 md:pt-10">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1.5fr_1fr] lg:px-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.14em] text-stone">
                <Link href="/search" className="hover:text-ink">Search</Link>
                {county && (
                  <>
                    {" / "}
                    <Link href={`/top-areas/${county.slug}`} className="hover:text-ink">
                      {county.name}
                    </Link>
                  </>
                )}
              </nav>
              <ShareButton title={`${l.address}, ${l.city} NY | ${formatPrice(l.price)}`} />
            </div>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                {l.address}
              </h1>
              <div className="text-right">
                <p className="font-mono text-3xl font-semibold tracking-tight text-ink">{formatPrice(l.price)}</p>
                {Number.isFinite(estMonthly) && estMonthly > 0 && (
                  <a
                    href="#payment"
                    className="font-mono text-sm text-stone underline decoration-ink/20 underline-offset-4 hover:text-ink"
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

            <h2 className="mt-8 font-display text-2xl text-ink">About this home</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-stone">{l.description}</p>

            <h2 className="mt-10 font-display text-2xl text-ink">Highlights</h2>
            <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {highlights.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-2">
                  <dt className="text-sm text-stone">{k}</dt>
                  <dd className="text-right text-sm font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {interior.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-2xl text-ink">Inside</h2>
                <dl className="mt-3 space-y-3">
                  {interior.map(([k, vals]) => (
                    <div key={k} className="grid gap-1 sm:grid-cols-[130px_1fr]">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone sm:pt-0.5">{k}</dt>
                      <dd className="text-sm leading-relaxed text-ink-soft">{vals.join(" · ")}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {exterior.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-2xl text-ink">Outside & utilities</h2>
                <dl className="mt-3 space-y-3">
                  {exterior.map(([k, vals]) => (
                    <div key={k} className="grid gap-1 sm:grid-cols-[130px_1fr]">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone sm:pt-0.5">{k}</dt>
                      <dd className="text-sm leading-relaxed text-ink-soft">{vals.join(" · ")}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {schools.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-2xl text-ink">Schools</h2>
                <p className="mt-1 text-xs text-stone">As reported by the listing office; verify enrollment with the district.</p>
                <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {schools.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-2">
                      <dt className="text-sm text-stone">{k}</dt>
                      <dd className="text-right text-sm font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {/* Legacy rows (pre-structured sync) keep their flat feature list. */}
            {interior.length === 0 && exterior.length === 0 && l.features.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-2xl text-ink">Features</h2>
                <ul className="mt-3 grid max-w-2xl gap-2 sm:grid-cols-2">
                  {l.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                      <span aria-hidden className="mt-0.5 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="mt-10 rounded-[2px] bg-mist px-4 py-3 text-sm text-stone">
              Listed with <strong className="text-ink">{l.listOfficeName}</strong>
              {agentName ? <> · {agentName}</> : null} · Source: {l.originatingSystem}
            </p>
            <MlsAttribution dataLastUpdated={l.modificationTimestamp} fixtureMode={isSampleData()} className="mt-4" />
          </div>

          {/* Contact CTA */}
          <Reveal delay={100}>
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-[2px] border border-ink/10 bg-white p-6 shadow-[0_24px_60px_-30px_rgb(16_24_32/0.25)] md:p-7">
                {/* Primary conversion CTAs (live parity): tour + offer, each a bottom-sheet modal. */}
                <ListingLeadCTAs
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
                      className="object-cover object-top"
                    />
                  </span>
                  <div>
                    <p className="font-display text-lg leading-tight text-ink">Levan Tsiklauri</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-stone">United Real Estate</p>
                  </div>
                </div>
                <p className="mb-5 mt-4 text-sm text-stone">
                  Tours, questions, offers: call{" "}
                  <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink">
                    {SITE.phone}
                  </a>{" "}
                  or send a note.
                </p>
                <LeadForm
                  compact
                  defaultReason="I'm interested in buying a home"
                  submitLabel="Request Info / Tour"
                  successTitle="Request sent."
                  successBody={`We'll get back to you about ${l.address} shortly.`}
                />
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* ── Payment */}
      <section id="payment" aria-labelledby="calc-heading" className="bg-paper pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <MortgageCalculator initial={mortgageSeed} />
          {!l.taxAnnual && (
            <p className="mt-3 text-xs text-stone">
              Taxes are estimated; the listing office didn't report an annual tax figure.
            </p>
          )}
        </div>
      </section>

      {/* ── Similar homes */}
      {similar.length > 0 && (
        <section className="border-t border-ink/10 bg-paper py-12 md:py-16" aria-labelledby="similar-heading">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="similar-heading" className="font-display text-2xl text-ink md:text-3xl">
                Similar homes in {county?.name ?? "the area"}
              </h2>
              {similarTotal > similar.length && (
                <Link
                  href={similarHref}
                  className="text-xs font-bold uppercase tracking-[0.14em] text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink"
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
