import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { TrackedButton } from "@/components/leads/TrackedButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrowserChrome, Laptop, MockCard, MockChip, Phone } from "@/components/ui/DeviceMock";
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
    "Free buyer consultation with our Hudson Valley specialists: home search, listing alerts, tours, offers, and closing. Buyers never pay a cent to work with us.",
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
      {/* ── Hero. A house among trees, under the same monochrome grade every other hero on
          the site now carries. The vendor's interior-with-staircase shot had no licence
          record. */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="buying-hero">
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/buying.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center grayscale"
          />
          {/* 50% flat measured 4.35:1 on the worst 2% of the composited background behind
              the headline — over the 3.0 large-text floor but under the 4.5 body one, with the
              sky through the trees sitting directly behind centred type. 56% clears both. */}
          <div className="absolute inset-0 bg-black/56" />
        </div>
        <div className="relative mx-auto max-w-[1250px] px-4 py-28 text-center md:py-[154px] lg:px-8">
          <h1 id="buying-hero" className="t-h1 mx-auto max-w-3xl text-paper">
            Ready to Find Your Dream Home?
          </h1>
          <p className="mt-4 text-base font-bold uppercase tracking-[0.12em] text-paper md:text-lg">
            Get a free consultation with our buyer specialists
          </p>
          <p className="mx-auto mt-4 max-w-xl text-paper/85">
            We&rsquo;ll help you navigate the market, find homes that match your criteria, and
            negotiate the best deal. No pressure, no obligation, just expert guidance.
          </p>
          {/* Live: phone icon in the owner's accent blue (#3b82f6); both CTAs fire a gtag
              click (categories Phone / Booking). Mobile: buttons stack full-width (max 350px)
              centered; ≥sm they sit inline. Book links internally to /connect (no _blank). */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <TrackedButton
              href={SITE.phoneHref}
              variant="outline-light"
              gaCategory="Phone"
              gaLabel="buying-hero"
              className="w-full max-w-[350px] sm:w-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
              </svg>
              {SITE.phone}
            </TrackedButton>
            <TrackedButton
              href="/connect"
              variant="light"
              gaCategory="Booking"
              gaLabel="buying-hero"
              className="w-full max-w-[350px] sm:w-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Book Free Consultation
            </TrackedButton>
          </div>
          <p className="mt-5 text-xs tracking-wide text-paper/60">
            Available 7 days a week • Fast response • No obligation
          </p>
        </div>
      </section>

      {/* ── The process intro. Heading left, passage right — matching the alternating bands
          below it, and un-centring two paragraphs of body copy. */}
      <section className="sec-sm bg-paper" aria-labelledby="process-heading">
        <div className="mx-auto grid max-w-[1250px] gap-8 px-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-16 lg:px-8">
          <Reveal>
            <SectionHeading as="h2">
              <span id="process-heading">The Home Buying Process</span>
            </SectionHeading>
          </Reveal>
          <Reveal delay={100}>
            <div className="max-w-[62ch] space-y-5 text-[17px] leading-[1.75] text-stone">
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

          {/* 2 — Alerts: copy LEFT, phone + save-a-search mockup RIGHT (matches live) */}
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
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
              <div>
                <AlertsMock listings={listings} />
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

/** Small real-listing thumbnail — MLS photo (self-healing) or fixture image, price chip. */
function Thumb({ listing }: { listing: Listing }) {
  const src = listing.photos[0];
  return (
    <MockCard className="relative">
      <div className="relative aspect-[4/3]">
        {src ? (
          isLiveMlsPhoto(src) ? (
            <MlsImage src={src} alt="" sizes="160px" />
          ) : (
            <Image src={src} alt="" fill sizes="160px" className="object-cover" />
          )
        ) : null}
        <MockChip className="bg-ink/80 text-[9px]">{formatPrice(listing.price)}</MockChip>
      </div>
    </MockCard>
  );
}

/** "Start Your Home Search" — a laptop whose screen is a live /search results grid. */
function SearchLaptop({ listings }: { listings: Listing[] }) {
  const tiles = listings.slice(0, 6);
  return (
    <figure className="mx-auto w-full max-w-xl" aria-label="Our home-search results on a laptop">
      <Laptop>
        <div className="flex h-full w-full flex-col bg-white">
          <BrowserChrome url="realtylt.com/search" />
          {/* results grid */}
          <div className="grid flex-1 grid-cols-3 gap-2 p-2.5">
            {tiles.map((l) => (
              <Thumb key={l.id} listing={l} />
            ))}
          </div>
        </div>
      </Laptop>
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
      <Phone width={218}>
        <div className="px-3 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone">Recent Listings</p>
          <ul className="mt-2 space-y-2">
            {feed.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <MockCard hairline={false} className="relative h-10 w-12 shrink-0">
                  {l.photos[0] ? (
                    isLiveMlsPhoto(l.photos[0]) ? (
                      <MlsImage src={l.photos[0]} alt="" sizes="48px" />
                    ) : (
                      <Image src={l.photos[0]} alt="" fill sizes="48px" className="object-cover" />
                    )
                  ) : null}
                </MockCard>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-ink">{formatPrice(l.price)}</p>
                  <p className="truncate text-[10px] text-stone">{l.city}, {l.state}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Phone>

      {/* Overlapping "Save a Search" panel (decorative) */}
      <div
        aria-hidden
        className="absolute bottom-0 right-0 w-[230px] rounded-2xl border border-line bg-white p-4 text-ink shadow-float sm:w-[260px]"
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Save a Search</p>
        <div className="mt-3 flex gap-1 border-b border-line pb-2 text-[10px] font-bold uppercase tracking-wide">
          <span className="border-b-2 border-porchlight pb-1 text-ink">Save the Search</span>
          <span className="pb-1 text-stone">References</span>
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-stone">Search name</p>
        <div className="mt-1 h-7 rounded-lg border border-line bg-mist px-2 text-[11px] leading-7 text-stone">
          Beacon · 3+ bd · under $600K
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <p className="uppercase tracking-[0.12em] text-stone">Price</p>
            <div className="mt-1 h-6 rounded-lg border border-line bg-mist" />
          </div>
          <div>
            <p className="uppercase tracking-[0.12em] text-stone">Beds</p>
            <div className="mt-1 h-6 rounded-lg border border-line bg-mist" />
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-ink py-2 text-center text-[11px] font-bold uppercase tracking-wide text-paper">
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
      className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-white shadow-float"
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
          <span className="border-b border-line pb-2 text-stone">Request Info</span>
        </div>
        {/* Date strip (decorative) */}
        <div aria-hidden className="mt-4 grid grid-cols-3 gap-2">
          {dates.map((d, i) => (
            <div
              key={d.day}
              className={`rounded-xl border py-2 text-center ${
                i === 0 ? "border-ink bg-mist" : "border-line"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wide text-stone">{d.dow}</p>
              <p className="text-lg font-bold text-ink">{d.day}</p>
            </div>
          ))}
        </div>
        <div aria-hidden className="mt-4 rounded-xl bg-ink py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-paper">
          In Person Tour
        </div>
      </div>
    </figure>
  );
}
