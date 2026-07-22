import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MlsImage } from "@/components/idx/MlsImage";
import { isLiveMlsPhoto, formatPrice } from "@/components/idx/ListingCard";
import { getIdxClient } from "@/lib/idx";
import type { Listing } from "@/lib/idx/types";
import { SITE } from "@/lib/site";

// Keep the real listing tiles in the mockups fresh in live mode.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Buying | Ready to Find Your Dream Home?",
  description:
    "Free buyer consultation with our Hudson Valley specialists: home search, listing alerts, favorites and tours, offers and closing. Buyers pay no cost; we're compensated by sellers.",
};

export default async function BuyingPage() {
  const idx = getIdxClient();
  // Prefer featured (owner-office) listings — they already have mirrored photos, so the
  // mockups render real imagery rather than "photo coming soon" placeholders; top up with
  // new listings only if there aren't six.
  const [featuredListings, freshListings] = await Promise.all([idx.getFeatured(6), idx.getNew(6)]);
  const listings = (
    featuredListings.length >= 6 ? featuredListings : [...featuredListings, ...freshListings]
  ).slice(0, 6);
  const cardListing = listings[0] ?? null;
  // Three upcoming dates for the (decorative) tour-scheduler strip.
  const now = new Date();
  const tourDates = [1, 2, 3].map((d) => {
    const dt = new Date(now);
    dt.setDate(now.getDate() + d);
    return { dow: dt.toLocaleDateString("en-US", { weekday: "short" }), day: dt.getDate() };
  });

  return (
    <>
      {/* ── Hero — live: interior-with-staircase photo (bg5.jpg), centered white copy */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="buying-hero">
        <div className="absolute inset-0">
          {/* Live realtylt.com's OWN hero asset (images.brivityidx.com/assets/images/bg5.jpg),
              mirrored to /public/images/hero/. Kept readable under a dark scrim. */}
          <Image
            src="/images/hero/buying-bg5.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative mx-auto max-w-[1250px] px-4 py-28 text-center md:py-[154px] lg:px-8">
          <h1 id="buying-hero" className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-paper md:text-[45px]">
            Ready to Find Your Dream Home?
          </h1>
          <p className="mt-4 text-base font-bold uppercase tracking-[0.12em] text-paper md:text-lg">
            Get a free consultation with our buyer specialists
          </p>
          <p className="mx-auto mt-4 max-w-xl text-paper/85">
            We&rsquo;ll help you navigate the market, find homes that match your criteria, and
            negotiate the best deal. No pressure, no obligation, just expert guidance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={SITE.phoneHref} variant="outline-light">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
              </svg>
              {SITE.phone}
            </Button>
            <Button href="/connect" variant="light">Book Free Consultation</Button>
          </div>
          <p className="mt-5 text-xs tracking-wide text-paper/60">
            Available 7 days a week • Fast response • No obligation
          </p>
        </div>
      </section>

      {/* ── The process intro */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="process-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="process-heading">The Home Buying Process</span>
            </SectionHeading>
            <div className="mx-auto mt-6 max-w-2xl space-y-4 text-center leading-relaxed text-stone">
              <p>
                Buying a home is a big step! Whether you&rsquo;re buying your first home, your
                dream home, or your tenth investment property, yours will be a big investment. We
                know how important this is to you, and we have an army of experts to make sure we
                find the perfect property for your unique circumstances.
              </p>
              <p>
                Finding the perfect property is just one way we can help you with your real estate
                purchase. As real estate agents, we have ongoing access to experts in every related
                field, from lending to relocation.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Steps 1–2 — live: black band, light+bold headings, white outline CTAs */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="steps-heading">
        <div className="mx-auto max-w-[1250px] space-y-20 px-4 lg:px-8">
          <h2 id="steps-heading" className="sr-only">
            From search to keys
          </h2>

          {/* 1 — Search: copy left, laptop with a live listings grid right */}
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h3 className="text-3xl font-light md:text-4xl">
                  Start Your <strong className="font-bold">Home Search</strong>
                </h3>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-paper">
                  Search for homes wherever you are
                </p>
                <p className="mt-4 max-w-lg leading-relaxed text-paper/75">
                  When buying a home, start by making a wish list and setting a budget. We can help
                  you choose a lender so you can be pre-approved for a loan, and then you&rsquo;re
                  ready to start searching for the perfect property. You can search for homes using
                  our website from any device including your computer, laptop, tablet, or
                  smartphone.
                </p>
                <div className="mt-6">
                  <Button href="/search" variant="outline-light">Start Searching</Button>
                </div>
              </div>
              <SearchLaptop listings={listings} />
            </div>
          </Reveal>

          {/* 2 — Alerts: phone + save-a-search mockup left, copy right */}
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <AlertsMock listings={listings} />
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-light md:text-4xl">
                  Get <strong className="font-bold">Listing Alerts</strong>
                </h3>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-paper">
                  Be the first to know when a property hits the market
                </p>
                <p className="mt-4 max-w-lg leading-relaxed text-paper/75">
                  When you save a search on our site, any new homes matching your wish list criteria
                  will be delivered straight to your inbox the moment they go up for sale.
                </p>
                <div className="mt-6">
                  <Button href="/search" variant="outline-light">Save a Search</Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Step 3 — live: white section, octagon ornament behind copy, tour-scheduler card */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="save-heading">
        <div className="mx-auto grid max-w-[1250px] items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div className="relative">
              {/* Thin-line octagon ornament, echoing live's compass motif behind the copy. */}
              <svg
                aria-hidden
                viewBox="0 0 100 100"
                className="pointer-events-none absolute -left-8 -top-14 -z-0 hidden h-72 w-72 text-ink/[0.07] lg:block"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <polygon points="31,3 69,3 97,31 97,69 69,97 31,97 3,69 3,31" />
                <polygon points="38,14 62,14 86,38 86,62 62,86 38,86 14,62 14,38" />
              </svg>
              <div className="relative">
                <h3 id="save-heading" className="text-3xl font-light text-ink md:text-4xl">
                  Save and <strong className="font-bold">See Listings</strong>
                </h3>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-ink-soft">
                  Favorite properties and tour homes
                </p>
                <p className="mt-4 max-w-lg leading-relaxed text-stone">
                  Click the ♡ icon when you find a house you love to save it in your favorites
                  section, and let us know you like it. Reach out to your agent directly to schedule
                  an in-person showing, and we&rsquo;ll walk you through the home and answer any
                  questions so you can make an informed decision.
                </p>
                <div className="mt-6">
                  <Button href="/saved" variant="outline">Your Saved Homes</Button>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <TourSchedulerCard listing={cardListing} dates={tourDates} />
          </Reveal>
        </div>
      </section>

      {/* ── Step 4 — live: black section */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="close-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h3 id="close-heading" className="text-3xl font-light md:text-4xl">
                  Making An <strong className="font-bold">Offer And Closing</strong>
                </h3>
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-paper">
                  We&rsquo;re with you till the end
                </p>
                <p className="mt-4 max-w-xl leading-relaxed text-paper/75">
                  When you find a home you love, our team will help you submit an offer. We are
                  skilled negotiators who know how to get you the best price and value possible.
                  Once an offer has been accepted we&rsquo;ll help you navigate through inspections,
                  appraisals, and closing in a stress-free way. We do all of these at no cost to
                  you, the buyer, as we are compensated by the sellers.
                </p>
                <p className="mt-4 max-w-xl leading-relaxed text-paper/75">
                  Then, it&rsquo;s time to get the keys, throw a housewarming party, and make
                  lasting memories in your new home. We&rsquo;re so happy that you trusted us to
                  help you through this exciting process.
                </p>
              </div>
              <div className="text-center lg:text-right">
                <Button href="/connect" variant="light">Book Your Free Consultation</Button>
                <p className="mt-3 text-xs tracking-wide text-paper/60">
                  No cost to buyers · Ever
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/** A CSS laptop mockup (graphite bezel) — same pattern as the /selling device frames. */
function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-[14px] border-[10px] border-[#20262e] shadow-[0_30px_60px_-28px_rgba(0,0,0,0.55)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-black">{children}</div>
      </div>
      <div className="mx-auto h-3 w-[94%] rounded-b-[10px] bg-gradient-to-b from-[#cfd3d9] to-[#a7adb6]" />
      <div className="mx-auto h-1.5 w-[22%] rounded-b-[8px] bg-[#9aa1ab]" />
    </div>
  );
}

/** Small real-listing thumbnail — MLS photo (self-healing) or fixture image, price chip. */
function Thumb({ listing }: { listing: Listing }) {
  const src = listing.photos[0];
  return (
    <div className="relative overflow-hidden rounded-[3px] border border-white/10 bg-mist">
      <div className="relative aspect-[4/3]">
        {src ? (
          isLiveMlsPhoto(src) ? (
            <MlsImage src={src} alt="" sizes="160px" />
          ) : (
            <Image src={src} alt="" fill sizes="160px" className="object-cover" />
          )
        ) : null}
        <span className="absolute bottom-1 left-1 rounded-sm bg-ink/80 px-1.5 py-0.5 text-[9px] font-bold text-paper">
          {formatPrice(listing.price)}
        </span>
      </div>
    </div>
  );
}

/** "Start Your Home Search" — a laptop whose screen is a live /search results grid. */
function SearchLaptop({ listings }: { listings: Listing[] }) {
  const tiles = listings.slice(0, 6);
  return (
    <figure className="mx-auto w-full max-w-xl" aria-label="Our home-search results on a laptop">
      <LaptopFrame>
        <div className="flex h-full w-full flex-col bg-white">
          {/* browser chrome */}
          <div className="flex items-center gap-2 border-b border-[#e5e7eb] bg-mist px-3 py-2">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-[#e0533d]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e8b13a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#4caf67]" />
            </span>
            <span className="ml-1 flex h-5 flex-1 items-center rounded bg-white px-2 text-[10px] text-stone">
              realtylt.com/search
            </span>
          </div>
          {/* results grid */}
          <div className="grid flex-1 grid-cols-3 gap-2 p-2.5">
            {tiles.map((l) => (
              <Thumb key={l.id} listing={l} />
            ))}
          </div>
        </div>
      </LaptopFrame>
    </figure>
  );
}

/** "Get Listing Alerts" — a phone mini-feed overlapped by a "Save a Search" panel. */
function AlertsMock({ listings }: { listings: Listing[] }) {
  const feed = listings.slice(0, 3);
  return (
    <figure
      className="relative mx-auto max-w-md pb-6 pl-2 pr-2 sm:pl-6"
      aria-label="Listing alerts on a phone with a Save-a-Search panel"
    >
      {/* Phone */}
      <div className="w-[200px] rounded-[30px] border-[9px] border-[#20262e] bg-[#20262e] shadow-[0_30px_60px_-28px_rgba(0,0,0,0.6)]">
        <div className="overflow-hidden rounded-[22px] bg-white">
          <div className="flex h-6 items-center justify-center bg-white">
            <span className="h-1.5 w-14 rounded-full bg-[#e5e7eb]" aria-hidden />
          </div>
          <div className="px-3 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone">Recent Listings</p>
            <ul className="mt-2 space-y-2">
              {feed.map((l) => (
                <li key={l.id} className="flex items-center gap-2">
                  <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-[3px] bg-mist">
                    {l.photos[0] ? (
                      isLiveMlsPhoto(l.photos[0]) ? (
                        <MlsImage src={l.photos[0]} alt="" sizes="48px" />
                      ) : (
                        <Image src={l.photos[0]} alt="" fill sizes="48px" className="object-cover" />
                      )
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-ink">{formatPrice(l.price)}</p>
                    <p className="truncate text-[10px] text-stone">{l.city}, {l.state}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Overlapping "Save a Search" panel (decorative) */}
      <div
        aria-hidden
        className="absolute bottom-0 right-0 w-[230px] rounded-[6px] border border-[#e5e7eb] bg-white p-4 text-ink shadow-[0_24px_50px_-20px_rgba(0,0,0,0.5)] sm:w-[260px]"
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Save a Search</p>
        <div className="mt-3 flex gap-1 border-b border-[#e5e7eb] pb-2 text-[10px] font-bold uppercase tracking-wide">
          <span className="border-b-2 border-porchlight pb-1 text-ink">Save the Search</span>
          <span className="pb-1 text-stone">References</span>
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-stone">Search name</p>
        <div className="mt-1 h-7 rounded-[3px] border border-[#dddddd] bg-mist px-2 text-[11px] leading-7 text-stone">
          Beacon · 3+ bd · under $600K
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <p className="uppercase tracking-[0.12em] text-stone">Price</p>
            <div className="mt-1 h-6 rounded-[3px] border border-[#dddddd] bg-mist" />
          </div>
          <div>
            <p className="uppercase tracking-[0.12em] text-stone">Beds</p>
            <div className="mt-1 h-6 rounded-[3px] border border-[#dddddd] bg-mist" />
          </div>
        </div>
        <div className="mt-4 rounded-[3px] bg-ink py-2 text-center text-[11px] font-bold uppercase tracking-wide text-paper">
          Save the Search
        </div>
      </div>
    </figure>
  );
}

/** "Save and See Listings" — a listing card with tour-scheduler tabs and a date strip.
 * Uses one of our real listings for the photo/price; entirely decorative (no handlers). */
function TourSchedulerCard({
  listing,
  dates,
}: {
  listing: Listing | null;
  dates: { dow: string; day: number }[];
}) {
  const price = listing ? formatPrice(listing.price) : "$850,000";
  const bedBathParts: string[] = [];
  if (listing && listing.beds > 0) bedBathParts.push(`${listing.beds} Bed`);
  if (listing && listing.baths > 0) bedBathParts.push(`${listing.baths} Bath`);
  const bedBath = bedBathParts.join(" | ") || "3 Bed | 2 Bath";
  const addr = listing ? `${listing.address}, ${listing.city}` : "89641 SW Sunny St.";
  const src = listing?.photos[0];

  return (
    <figure
      className="mx-auto w-full max-w-sm overflow-hidden rounded-[4px] border border-[#dddddd] bg-white shadow-2xl"
      aria-label="Example home with tour-scheduling options"
    >
      <div className="relative aspect-[3/2] bg-mist">
        {src ? (
          isLiveMlsPhoto(src) ? (
            <MlsImage src={src} alt="" sizes="384px" />
          ) : (
            <Image src={src} alt="" fill sizes="384px" className="object-cover" />
          )
        ) : null}
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-red-500 stroke-red-500" strokeWidth="1.8">
            <path d="M12 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.5.5.5-.5a4.8 4.8 0 0 1 6.8 6.8L12 20.3z" />
          </svg>
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xl font-bold text-ink">{price}</p>
          <p className="text-sm text-stone">{bedBath}</p>
        </div>
        <p className="mt-1 truncate text-sm italic text-ink-soft">{addr}</p>
        {/* Tabs (decorative) */}
        <div aria-hidden className="mt-4 grid grid-cols-2 text-center text-xs font-bold uppercase tracking-wide">
          <span className="border-b-2 border-ink pb-2 text-ink">Schedule a Tour</span>
          <span className="border-b border-[#dddddd] pb-2 text-stone">Request Info</span>
        </div>
        {/* Date strip (decorative) */}
        <div aria-hidden className="mt-4 grid grid-cols-3 gap-2">
          {dates.map((d, i) => (
            <div
              key={d.day}
              className={`rounded-[3px] border py-2 text-center ${
                i === 0 ? "border-ink bg-mist" : "border-[#e5e7eb]"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wide text-stone">{d.dow}</p>
              <p className="text-lg font-bold text-ink">{d.day}</p>
            </div>
          ))}
        </div>
        <div aria-hidden className="mt-4 rounded-[3px] bg-ink py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-paper">
          In Person Tour
        </div>
      </div>
    </figure>
  );
}
