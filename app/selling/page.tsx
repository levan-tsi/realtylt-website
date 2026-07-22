import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { LeadForm } from "@/components/leads/LeadForm";
import { MlsImage } from "@/components/idx/MlsImage";
import { isLiveMlsPhoto, formatPrice } from "@/components/idx/ListingCard";
import { getIdxClient } from "@/lib/idx";
import type { Listing } from "@/lib/idx/types";
import { specParts } from "@/lib/format";
import { GOOGLE_REVIEWS_URL, TESTIMONIALS } from "@/content/testimonials";
import { SITE } from "@/lib/site";

// Keep the marketing-collage listing tiles fresh in live mode.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Sell Your Home | Cash Offer in 24 Hours or Full-Service Listing",
  description:
    "See your home's cash value vs market list price. Get a guaranteed fair cash offer in 24 hours, or list with RealtyLT for maximum profit. You compare, you decide.",
};

// Live's exact 6-item checklists, in live's order.
const CASH_POINTS = [
  "Sell as-is, zero repairs",
  "Guaranteed closing",
  "No agent fees",
  "No showings",
  "Choose your closing date",
  "Skip the hassle",
];
const CASH_FITS = [
  "Inherited property",
  "Major repairs needed",
  "Behind on payments",
  "Facing foreclosure",
  "Divorce",
  "Quick relocation",
  "Tired of landlording",
];
const LIST_POINTS = [
  "Pro photos & tours",
  "Staging consult",
  "MLS + 100+ sites",
  "Full marketing",
  "Expert pricing",
  "Max exposure",
];
const LIST_FITS = [
  "Move-in-ready home",
  "No rush to sell",
  "Maximum exposure",
  "Professional service",
  "Every dollar possible",
];

const COMP_ROWS = [
  { label: "Active", note: "what buyers see now", widths: [88, 72, 95, 64] },
  { label: "Pending", note: "what buyers just chose", widths: [78, 90, 68, 82] },
  { label: "Sold", note: "what banks appraised", widths: [70, 84, 76, 66] },
];

const LOOP_STEPS = [
  { label: "Showing booked", note: "You see it the moment it's scheduled" },
  { label: "Buyer feedback", note: "Honest notes after every showing" },
  { label: "Offer received", note: "Full terms, side by side" },
  { label: "Sale progress", note: "Inspection to closing, tracked 24/7" },
];

export default async function SellingPage() {
  // Real listings power the "Innovative Internet Marketing" mockup (photos + prices),
  // so it reads like our actual search portal rather than empty device screens.
  const marketingListings = await getIdxClient().getFeatured(6);
  return (
    <>
      {/* ── Hero: headline + 60-second form card */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="selling-hero">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero/hudson-twilight.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-zoom object-cover opacity-95"
          />
          {/* Scrim: dark under the headline (left), clearing toward the twilight sky/mansion
              (right) so the house reads while the white headline still clears contrast. */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/25" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:py-28 lg:min-h-[780px] lg:grid-cols-[1.15fr_1fr] lg:px-8">
          <div className="self-center">
            <h1 id="selling-hero" className="text-4xl font-light leading-[1.12] text-paper md:text-[52px]">
              See Your Home&rsquo;s <strong className="font-bold">Cash Value</strong> vs{" "}
              <strong className="font-bold">Market List Price</strong>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-paper/85">
              Get a guaranteed fair cash offer in 24 hours, or list with us for maximum profit. You
              compare, you decide.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-paper/85">
              <span className="flex items-center gap-2">
                Google <Stars /> <strong className="text-paper">5.0</strong>
              </span>
              <span className="border-l border-paper/25 pl-8">Fast Response</span>
              <span className="border-l border-paper/25 pl-8">Free Consultation</span>
            </div>
            <p className="mt-4 text-xs tracking-wide text-paper/60">
              No obligation • Zero pressure • Honest advice
            </p>
            <a
              href={SITE.phoneHref}
              className="mt-6 inline-block border border-paper/40 px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              {SITE.phone}
            </a>
          </div>

          <Reveal className="lg:justify-self-end lg:w-full lg:max-w-md" delay={150}>
            <div id="offer-form" className="scroll-mt-28 border border-paper/20 bg-black/55 p-6 shadow-2xl backdrop-blur md:p-8">
              <h2 className="text-xl font-bold text-paper">Get Your Cash Offer &amp; Home Value</h2>
              <p className="mb-5 mt-1 text-sm text-paper/70">
                Four quick details and we&rsquo;ll get to work on your numbers.
              </p>
              <LeadForm
                dark
                compact
                stack
                withAddress
                requirePhone
                hideReason
                defaultReason="I'm interested in selling a home"
                namePlaceholder="Full Name"
                addressPlaceholder="Full Property Address"
                submitLabel="Get My Free Offer & Analysis"
                footnote="Takes less than 60 seconds"
                successTitle="Request received."
                successBody="We'll get to work on your numbers and reach out within the day, usually much sooner."
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Two paths */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="paths-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="paths-heading">Choose the Path That&rsquo;s Right for You</span>
            </SectionHeading>
            <p className="mx-auto mt-4 max-w-xl text-center text-stone">
              Every home and situation is different. We offer two solutions so you get the outcome
              that matters most to you.
            </p>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
            <Reveal>
              <PathCard
                number={1}
                title="Fast Cash Offer"
                subtitle="Get cash in 15-30 days. Perfect for homes that need work or sellers who need speed."
                banner="Free cash offer in 24-48 hours"
                points={CASH_POINTS}
                fitsLabel="Perfect if you have:"
                fits={CASH_FITS}
                cta="Get Your Free Cash Offer"
              />
            </Reveal>
            <Reveal delay={120}>
              <PathCard
                number={2}
                title="Traditional Listing"
                subtitle="Get maximum value. Perfect for move-in-ready homes and sellers who have time."
                banner="Get top market value"
                points={LIST_POINTS}
                fitsLabel="Perfect if you want:"
                fits={LIST_FITS}
                cta="Get Free Consultation"
              />
            </Reveal>
          </div>

          {/* No-pressure banner — live: black band */}
          <Reveal className="mt-12">
            <aside className="bg-ink px-6 py-8 text-center text-paper md:px-12">
              <p className="text-lg font-bold uppercase tracking-wide">
                Not sure which option is best? We&rsquo;ll show you both, no pressure.
              </p>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-paper/70">
                Tell us about your property and we&rsquo;ll give you honest advice on which path
                works best for your situation.
              </p>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonials — live: white, small bold uppercase heading */}
      <section className="bg-paper py-16 md:py-20" aria-labelledby="clients-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <h2 id="clients-heading" className="text-center text-xl font-bold uppercase tracking-[0.14em] text-ink">
              What Our Clients Say
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} as="li" delay={i * 120}>
                <TestimonialCard t={t} />
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 text-center">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-ink-soft underline-offset-4 hover:underline"
            >
              See all our Google reviews
            </a>
          </p>
        </div>
      </section>

      {/* ── Pricing strategy (15 comps) */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="pricing-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading dark as="h2">
              <span id="pricing-heading">Our <strong className="font-bold">Pricing Strategy</strong></span>
            </SectionHeading>
            <p className="mt-4 max-w-lg text-sm font-bold uppercase tracking-[0.12em] text-paper">
              We use the most accurate method to price your home
            </p>
            <p className="mt-5 max-w-lg leading-relaxed text-paper/75">
              The right price for your property is determined by current market conditions. We
              analyze <strong className="text-paper">15 comparable properties</strong> (five
              active, five pending, five sold) so your home hits the market at the number that
              sells, and you get the price you deserve.
            </p>
            <p className="mt-4 max-w-lg text-sm font-bold uppercase tracking-[0.12em] text-paper">
              Want to know what your home is worth?
            </p>
            <div className="mt-7">
              <Button href="#offer-form" variant="light">Get My Home Value &amp; Cash Offer</Button>
            </div>
          </Reveal>

          {/* Comparable Property Statistics — live: WHITE card w/ blue bars + suggested range */}
          <Reveal delay={150}>
            <figure
              className="rounded-[4px] bg-white p-6 text-ink shadow-2xl md:p-8"
              aria-label="Comparable property statistics: 5 active, 5 pending, 5 sold, with a suggested list-price range"
            >
              <figcaption className="flex items-baseline justify-between border-b border-[#e5e7eb] pb-4">
                <span className="text-sm font-bold uppercase tracking-[0.12em] text-ink">
                  Comparable Property Statistics
                </span>
                <span className="text-xs font-bold text-porchlight-deep">15 comps</span>
              </figcaption>

              <div className="mt-6 space-y-6">
                {COMP_ROWS.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-bold text-ink">{row.label}</p>
                      <p className="text-xs text-stone">{row.note}</p>
                    </div>
                    <div className="mt-2.5 space-y-1.5" aria-hidden>
                      {row.widths.map((w, i) => (
                        <div key={i} className="h-2 rounded-full bg-mist">
                          <div className="h-full rounded-full bg-porchlight" style={{ width: `${w}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 border-t border-[#e5e7eb] pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Suggested list price</p>
                <p className="mt-1 text-2xl font-bold text-ink md:text-[28px]">$465,000 - $510,000</p>
                <p className="mt-1 text-xs text-stone">Illustrative range from a 15-comparable analysis of your home.</p>
              </div>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── Making your listing shine — text left, laptop tour right */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="shine-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading as="h2">
              <span id="shine-heading">Making Your Listing <strong className="font-bold">Shine</strong></span>
            </SectionHeading>
            <p className="mt-4 max-w-lg text-sm font-bold uppercase tracking-[0.12em] text-ink-soft">
              Photographs, virtual tours, 3D walkthroughs and videos
            </p>
            <p className="mt-5 max-w-lg leading-relaxed text-stone">
              Today&rsquo;s buyers are armed with more information than ever. They tell their agents
              which homes they want to see, and skip listings with too few or poor-quality photos.
              High-impact photography makes a lasting first impression and creates a desire to see
              more.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["Pro photography", "3D walkthrough", "Cinematic video", "Drone aerials", "Staging consult"].map((c) => (
                <li key={c} className="rounded-[2px] border border-ink/15 px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-ink">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={140}>
            <LaptopFrame tone="dark">
              <div className="relative h-full w-full">
                <Image
                  src="/images/listings/house-08.jpg"
                  alt="Virtual tour preview of a professionally photographed listing"
                  fill
                  sizes="(max-width:1024px) 90vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-ink/20" />
                <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper/90 shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 text-ink" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="absolute bottom-3 left-3 rounded bg-ink/70 px-2.5 py-1 text-xs font-medium text-paper">
                  3D Walkthrough
                </span>
              </div>
            </LaptopFrame>
          </Reveal>
        </div>
      </section>

      {/* ── Internet marketing — text left, device collage right */}
      <section className="bg-mist py-16 md:py-24" aria-labelledby="marketing-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading as="h2">
              <span id="marketing-heading">Innovative <strong className="font-bold">Internet Marketing</strong></span>
            </SectionHeading>
            <p className="mt-4 max-w-lg text-sm font-bold uppercase tracking-[0.12em] text-ink-soft">
              We know how to reach the 92% of buyers who search online
            </p>
            <p className="mt-5 max-w-lg leading-relaxed text-stone">
              We target our marketing strategy and resources to match where buyers are finding homes
              right now. The more places your property is marketed, the more buyers see it, and the
              faster it sells. Your listing goes out with high-converting content across our
              website, home-search portals, search engines, and social media.
            </p>
            <ul className="mt-6 grid max-w-md grid-cols-2 gap-x-4 gap-y-2 text-sm text-ink sm:grid-cols-3">
              {["MLS", "100+ portals", "realtylt.com", "Google", "Social media", "Email alerts"].map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-porchlight" /> {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={140}>
            <DeviceCollage listings={marketingListings} />
          </Reveal>
        </div>
      </section>

      {/* ── Stay in the loop — text left, seller-portal laptop right */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="loop-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading dark as="h2">
              <span id="loop-heading">Stay in the Loop, <strong className="font-bold">Every Step of the Way</strong></span>
            </SectionHeading>
            <p className="mt-4 max-w-lg text-sm font-bold uppercase tracking-[0.12em] text-paper">
              Real-time updates until your home is sold
            </p>
            <p className="mt-5 max-w-lg leading-relaxed text-paper/75">
              Most agents leave you in the dark. We believe in complete transparency: instant
              updates on showings, offers, and buyer feedback through our online portal, so you know
              exactly what&rsquo;s happening with your sale, 24/7. No more wondering
              &ldquo;what&rsquo;s going on?&rdquo;
            </p>
            <div className="mt-7">
              <Button href="#offer-form" variant="light">Get Your Free Cash Offer &amp; Analysis</Button>
            </div>
            <p className="mt-3 text-xs tracking-wide text-paper/60">
              Takes less than 60 seconds · No obligation
            </p>
          </Reveal>
          <Reveal delay={150}>
            <LaptopFrame tone="dark">
              <div className="flex h-full w-full flex-col bg-[#0d1319] text-paper">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <span className="text-xs font-bold tracking-wide">Your Seller Portal</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-porchlight">
                    <span className="h-1.5 w-1.5 rounded-full bg-porchlight" /> Live
                  </span>
                </div>
                <ul className="flex-1 space-y-2 p-3 sm:p-4">
                  {LOOP_STEPS.map((s, i) => (
                    <li key={s.label} className="flex items-center gap-3 rounded-[4px] bg-white/[0.06] px-3 py-2">
                      <span
                        aria-hidden
                        className={`h-2 w-2 shrink-0 rounded-full ${i === 0 ? "bg-porchlight" : "bg-paper/30"}`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-paper">{s.label}</p>
                        <p className="truncate text-xs text-paper/55">{s.note}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0 text-porchlight" aria-hidden>
                        <path d="m5 12.5 4.5 4.5L19 7" />
                      </svg>
                    </li>
                  ))}
                </ul>
              </div>
            </LaptopFrame>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/** One "path" card — floating number, black header block, highlight banner, checklist,
 * qualifier list, CTA. Matches the live realtylt.com selling-page cards. */
function PathCard({
  number,
  title,
  subtitle,
  banner,
  points,
  fitsLabel,
  fits,
  cta,
}: {
  number: number;
  title: string;
  subtitle: string;
  banner: string;
  points: string[];
  fitsLabel: string;
  fits: string[];
  cta: string;
}) {
  return (
    <article className="relative mt-5 flex h-full flex-col border border-[#dddddd] bg-white">
      {/* floating number */}
      <span
        aria-hidden
        className="absolute -top-5 left-1/2 z-10 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full border-2 border-porchlight bg-white text-sm font-bold text-ink shadow-sm"
      >
        {number}
      </span>
      {/* black header block — live: title, subtitle, divider, then the banner all on black */}
      <div className="rounded-t-[2px] bg-ink px-6 pb-6 pt-9 text-center">
        <h3 className="text-xl font-bold uppercase tracking-wide text-paper">{title}</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-paper/70">{subtitle}</p>
        <p className="mt-5 border-t border-white/15 pt-4 text-sm font-bold uppercase tracking-wide text-paper">
          {banner}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-7 md:p-8">
        <ul className="mx-auto grid w-full gap-2.5 text-left sm:grid-cols-2">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-ink-soft">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-porchlight-deep" aria-hidden>
                <path d="m5 12.5 4.5 4.5L19 7" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-[#dddddd] pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">{fitsLabel}</p>
          <p className="mt-2 text-sm leading-relaxed text-stone">{fits.join(" • ")}</p>
        </div>
        <div className="mt-auto pt-7">
          <Button href="#offer-form" variant="outline">{cta}</Button>
        </div>
      </div>
    </article>
  );
}

/** A CSS laptop mockup. `tone="dark"` gives a graphite bezel (for photo/portal content). */
function LaptopFrame({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  const bezel = tone === "dark" ? "border-[#20262e]" : "border-[#d8dce1]";
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className={`rounded-[14px] border-[10px] ${bezel} shadow-[0_30px_60px_-28px_rgba(0,0,0,0.55)]`}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-black">{children}</div>
      </div>
      {/* hinge / base */}
      <div className="mx-auto h-3 w-[94%] rounded-b-[10px] bg-gradient-to-b from-[#cfd3d9] to-[#a7adb6]" />
      <div className="mx-auto h-1.5 w-[22%] rounded-b-[8px] bg-[#9aa1ab]" />
    </div>
  );
}

/** One small photo cell — MLS photo (self-healing) or fixture image. */
function CollageImg({ listing, sizes }: { listing: Listing; sizes: string }) {
  const src = listing.photos[0];
  if (!src) return null;
  return isLiveMlsPhoto(src) ? (
    <MlsImage src={src} alt="" sizes={sizes} />
  ) : (
    <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
  );
}

/** Laptop browser mockup (a mini /search results grid) with a phone overlapping it —
 * "your listing marketed across every device and portal". Built from our real listings so
 * it reads like the actual RealtyLT search portal. */
function DeviceCollage({ listings }: { listings: Listing[] }) {
  const tiles = listings.slice(0, 6);
  const phone = listings[0] ?? null;
  const phoneStats = phone
    ? specParts(phone, { bed: "bd", bath: "ba", sqft: "sqft" }).slice(0, 2).join(" · ")
    : "";
  return (
    <figure className="relative mx-auto max-w-xl pb-10 pr-6 sm:pb-6 sm:pr-10" aria-label="Your listing marketed across every device and portal">
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
              <div key={l.id} className="overflow-hidden rounded-[3px] border border-[#eceff2] bg-mist">
                <div className="relative aspect-[4/3]">
                  <CollageImg listing={l} sizes="120px" />
                  <span className="absolute bottom-1 left-1 rounded-sm bg-ink/75 px-1.5 py-0.5 text-[8px] font-bold text-paper">
                    {formatPrice(l.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LaptopFrame>
      {/* phone */}
      {phone && (
        <div className="absolute bottom-0 right-0 w-[116px] rounded-[20px] border-[6px] border-[#20262e] bg-[#20262e] shadow-2xl sm:w-[132px]">
          <div className="overflow-hidden rounded-[14px] bg-white">
            <div className="relative aspect-[3/4] bg-mist">
              <CollageImg listing={phone} sizes="132px" />
            </div>
            <div className="p-2">
              <p className="text-[10px] font-bold text-ink">{formatPrice(phone.price)}</p>
              <p className="text-[8px] text-stone">
                {phoneStats}
                {phoneStats && " · "}
                {phone.city}
              </p>
              <p className="mt-1.5 rounded-sm bg-ink py-1 text-center text-[8px] font-bold uppercase tracking-wide text-paper">
                View listing
              </p>
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}
