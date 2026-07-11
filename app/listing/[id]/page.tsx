import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/idx/FavoriteButton";
import { formatPrice, isLiveMlsPhoto, NoPhoto } from "@/components/idx/ListingCard";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { LeadForm } from "@/components/leads/LeadForm";
import { Reveal } from "@/components/ui/Reveal";
import { FIXTURE_LISTINGS } from "@/lib/idx/fixture-data";
import { getIdxClient, isFixtureMode, isSampleData } from "@/lib/idx";
import { COUNTIES, SITE } from "@/lib/site";
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
    title: `${l.address}, ${l.city} NY ${l.zip} — ${formatPrice(l.price)}`,
    description: l.description.slice(0, 160),
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await getListing(id);
  if (!l) notFound();
  const county = COUNTIES.find((c) => c.slug === l.county);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: `${l.address}, ${l.city}, NY ${l.zip}`,
    url: `${SITE.url}/listing/${l.id}`,
    image: l.photos.map((p) => (p.startsWith("http") ? p : `${SITE.url}${p}`)),
    description: l.description,
    datePosted: l.listedAt,
    about: {
      "@type": l.propertyType === "Multi-Family" ? "House" : "SingleFamilyResidence",
      numberOfRooms: l.beds,
      numberOfBathroomsTotal: l.baths,
      floorSize: { "@type": "QuantitativeValue", value: l.sqft, unitCode: "FTK" },
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

      {/* ── Gallery */}
      <section className="bg-ink" aria-label="Photos">
        <div className="mx-auto grid max-w-7xl gap-1.5 px-0 md:grid-cols-[2fr_1fr] lg:px-8 lg:py-6">
          <div className="photo-zoom relative aspect-[3/2] overflow-hidden md:rounded-[2px]">
            {l.photos.length > 0 ? (
              <Image
                src={l.photos[0]}
                alt={`${l.address}, ${l.city} — main photo`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                unoptimized={isLiveMlsPhoto(l.photos[0])}
                className="object-cover"
              />
            ) : (
              <NoPhoto />
            )}
            <FavoriteButton id={l.id} className="absolute right-4 top-4 z-10" />
            {l.status !== "Active" && (
              <span className="absolute left-4 top-4 bg-ink/85 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-paper backdrop-blur">
                {l.status}
              </span>
            )}
          </div>
          <div className="hidden grid-rows-3 gap-1.5 md:grid">
            {l.photos.slice(1, 4).map((p, i) => (
              <div key={p + i} className="photo-zoom relative overflow-hidden rounded-[2px]">
                <Image src={p} alt={`${l.address} — photo ${i + 2}`} fill sizes="30vw" unoptimized={isLiveMlsPhoto(p)} className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Facts + contact */}
      <section className="bg-paper py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1.5fr_1fr] lg:px-8">
          <div>
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
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                {l.address}
              </h1>
              <p className="font-mono text-3xl font-semibold tracking-tight text-ink">{formatPrice(l.price)}</p>
            </div>
            <p className="mt-1 text-lg text-stone">
              {l.city}, {l.state} {l.zip} · {county?.name}
            </p>

            <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-y border-ink/10 py-5">
              {(
                [
                  ["Beds", l.beds],
                  ["Baths", l.baths],
                  ["Sqft", l.sqft.toLocaleString("en-US")],
                  ["Type", l.propertyType],
                  ["Status", l.status + (l.openHouse ? " · Open house" : "")],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone">{k}</dt>
                  <dd className="mt-1 font-mono text-lg text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-8 font-display text-2xl text-ink">About this home</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-stone">{l.description}</p>

            <h2 className="mt-8 font-display text-2xl text-ink">Features</h2>
            <ul className="mt-3 grid max-w-2xl gap-2 sm:grid-cols-2">
              {l.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                  <span aria-hidden className="mt-0.5 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>

            <p className="mt-8 rounded-[2px] bg-mist px-4 py-3 text-sm text-stone">
              Listed with <strong className="text-ink">{l.listOfficeName}</strong> · Source: {l.originatingSystem}
            </p>
            <MlsAttribution dataLastUpdated={l.modificationTimestamp} fixtureMode={isSampleData()} className="mt-4" />
          </div>

          {/* Contact CTA */}
          <Reveal delay={100}>
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-[2px] border border-ink/10 bg-white p-6 shadow-[0_24px_60px_-30px_rgb(16_24_32/0.25)] md:p-7">
                <h2 className="font-display text-xl text-ink">Ask about this home</h2>
                <p className="mb-5 mt-1 text-sm text-stone">
                  Tours, questions, offers — {SITE.phone} or send a note.
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
    </>
  );
}
