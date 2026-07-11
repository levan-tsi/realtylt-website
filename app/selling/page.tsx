import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { LeadForm } from "@/components/leads/LeadForm";
import { GOOGLE_REVIEWS_URL, TESTIMONIALS } from "@/content/testimonials";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sell Your Home — Cash Offer in 24 Hours or Full-Service Listing",
  description:
    "See your home's cash value vs market list price. Get a guaranteed fair cash offer in 24 hours, or list with RealtyLT for maximum profit. You compare, you decide.",
};

const CASH_POINTS = [
  "Sell AS-IS — zero repairs",
  "No agent fees",
  "Choose your closing date",
  "Guaranteed closing",
  "No showings",
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
  "Top market value",
  "Pro photos & 3D tours",
  "MLS + 100+ sites",
  "Expert pricing",
  "Staging consult",
  "Full marketing",
];
const LIST_FITS = [
  "Move-in-ready home",
  "No rush to sell",
  "Maximum exposure",
  "Professional service",
  "Every dollar possible",
];

const LOOP_STEPS = [
  { label: "Showing booked", note: "You see it the moment it's scheduled" },
  { label: "Buyer feedback", note: "Honest notes after every showing" },
  { label: "Offer received", note: "Full terms, side by side" },
  { label: "Sale progress", note: "Inspection to closing, tracked 24/7" },
];

export default function SellingPage() {
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
            className="hero-zoom object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/40" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:px-8">
          <div className="self-center">
            <h1 id="selling-hero" className="text-4xl font-light leading-[1.15] text-paper md:text-5xl">
              See Your Home&rsquo;s <strong className="font-bold">Cash Value</strong> vs{" "}
              <strong className="font-bold">Market List Price</strong>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-paper/85">
              Get a guaranteed fair Cash Offer in 24 hours OR list with us for maximum profit. You
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
              • No obligation • Zero pressure • Honest advice
            </p>
            <a
              href={SITE.phoneHref}
              className="mt-6 inline-block border border-paper/40 px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              {SITE.phone}
            </a>
          </div>

          <Reveal className="lg:justify-self-end lg:w-full lg:max-w-md" delay={150}>
            <div id="offer-form" className="scroll-mt-28 border border-paper/20 bg-black/50 p-6 shadow-2xl backdrop-blur md:p-8">
              <h2 className="text-xl font-bold text-paper">Get Your Cash Offer &amp; Home Value</h2>
              <p className="mb-5 mt-1 text-xs tracking-wide text-paper/60">
                Takes less than 60 seconds
              </p>
              <LeadForm
                dark
                compact
                withAddress
                defaultReason="I'm interested in selling a home"
                submitLabel="Get My Free Offer & Analysis →"
                successTitle="Request received."
                successBody="We'll get to work on your numbers and reach out within the day — usually much sooner."
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

          <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
            {/* Path 1 — cash */}
            <Reveal>
              <article className="flex h-full flex-col border border-[#dddddd] bg-white p-7 text-center md:p-8">
                <span aria-hidden className="mx-auto grid h-9 w-9 place-items-center rounded-full border-2 border-ink text-sm font-bold text-ink">
                  1
                </span>
                <h3 className="mt-4 text-xl font-bold uppercase tracking-wide text-ink">Fast Cash Offer</h3>
                <p className="mt-2 text-sm text-stone">
                  Get cash in 15–30 days — perfect for homes that need work or sellers who need
                  speed.
                </p>
                <p className="-mx-7 mt-5 bg-ink px-4 py-2.5 text-sm font-bold text-paper md:-mx-8">
                  Free Cash offer in 24–48 hours
                </p>
                <ul className="mx-auto mt-6 grid gap-2.5 text-left sm:grid-cols-2">
                  {CASH_POINTS.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-ink-soft">
                      <span aria-hidden className="mt-0.5 font-bold">✓</span> {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-[#dddddd] pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Perfect if you have:</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone">{CASH_FITS.join(" • ")}</p>
                </div>
                <div className="mt-auto pt-7">
                  <Button href="#offer-form" variant="outline">Get Your Free Cash Offer →</Button>
                </div>
              </article>
            </Reveal>

            {/* Path 2 — listing */}
            <Reveal delay={120}>
              <article className="flex h-full flex-col border border-[#dddddd] bg-white p-7 text-center md:p-8">
                <span aria-hidden className="mx-auto grid h-9 w-9 place-items-center rounded-full border-2 border-ink text-sm font-bold text-ink">
                  2
                </span>
                <h3 className="mt-4 text-xl font-bold uppercase tracking-wide text-ink">Traditional Listing</h3>
                <p className="mt-2 text-sm text-stone">
                  Get maximum value — perfect for move-in-ready homes and sellers who have time.
                </p>
                <p className="-mx-7 mt-5 bg-ink px-4 py-2.5 text-sm font-bold text-paper md:-mx-8">
                  Get top market value
                </p>
                <ul className="mx-auto mt-6 grid gap-2.5 text-left sm:grid-cols-2">
                  {LIST_POINTS.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-ink-soft">
                      <span aria-hidden className="mt-0.5 font-bold">✓</span> {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-[#dddddd] pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Perfect if you want:</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone">{LIST_FITS.join(" • ")}</p>
                </div>
                <div className="mt-auto pt-7">
                  <Button href="#offer-form" variant="outline">Get Free Consultation →</Button>
                </div>
              </article>
            </Reveal>
          </div>

          {/* No-pressure banner — live: black band */}
          <Reveal className="mt-12">
            <aside className="bg-ink px-6 py-8 text-center text-paper md:px-12">
              <p className="text-lg font-bold uppercase tracking-wide">
                Not sure which option is best? We&rsquo;ll show you both — no pressure.
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
              See all our Google reviews →
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
              analyze <strong className="text-paper">15 comparable properties</strong> — five
              active, five pending, five sold — so your home hits the market at the number that
              sells, and you get the price you deserve.
            </p>
            <p className="mt-4 max-w-lg text-sm font-bold uppercase tracking-[0.12em] text-paper">
              Want to know what your home is worth?
            </p>
            <div className="mt-7">
              <Button href="#offer-form" variant="light">Get My Home Value &amp; Cash Offer ↑</Button>
            </div>
          </Reveal>

          {/* The 5/5/5 comp board — built, not stock */}
          <Reveal delay={150}>
            <figure className="rounded-[2px] border border-paper/15 bg-ink-soft p-6 md:p-8" aria-label="Comparable property analysis: 5 active, 5 pending, 5 sold">
              <figcaption className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-paper/60">Comparable analysis</span>
                <span className="font-mono text-xs text-porchlight">15 comps</span>
              </figcaption>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {(
                  [
                    ["Active", "what buyers see now"],
                    ["Pending", "what buyers just chose"],
                    ["Sold", "what banks appraised"],
                  ] as const
                ).map(([label, note], col) => (
                  <div key={label}>
                    <p className="font-mono text-2xl font-semibold text-porchlight">5</p>
                    <p className="mt-1 text-sm font-bold text-paper">{label}</p>
                    <p className="mt-1 text-xs leading-snug text-paper/55">{note}</p>
                    <div className="mt-4 space-y-2" aria-hidden>
                      {[92, 78, 85, 70, 88].map((w, i) => (
                        <div key={i} className="h-1.5 rounded-full bg-paper/10">
                          <div
                            className="h-full rounded-full bg-porchlight/70"
                            style={{ width: `${w - col * 6}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t border-paper/10 pt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">
                → Suggested list price: where the three columns agree
              </p>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── Making your listing shine */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="shine-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="photo-zoom relative aspect-[4/5] overflow-hidden rounded-[2px]">
                <Image src="/images/listings/house-05.jpg" alt="Professionally photographed Victorian home exterior" fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
              </div>
              <div className="photo-zoom relative mt-8 aspect-[4/5] overflow-hidden rounded-[2px]">
                <Image src="/images/listings/house-14.jpg" alt="Bright living room interior with fireplace" fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <SectionHeading as="h2">
              <span id="shine-heading">Making Your Listing <strong className="font-bold">Shine</strong></span>
            </SectionHeading>
            <p className="mt-4 max-w-lg text-sm font-bold uppercase tracking-[0.12em] text-ink-soft">
              Photographs, virtual tours, 3D walkthroughs and videos
            </p>
            <p className="mt-5 max-w-lg leading-relaxed text-stone">
              Today&rsquo;s buyers are armed with more information than ever. They tell their agents
              which homes they want to see — and skip listings with too few or poor-quality photos.
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
        </div>
      </section>

      {/* ── Internet marketing */}
      <section className="bg-paper pb-16 pt-10 md:pb-24" aria-labelledby="marketing-heading">
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
              right now. The more places your property is marketed, the more buyers see it — and the
              faster it sells. Your listing goes out with high-converting content across our
              website, home-search portals, search engines, and social media.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <figure className="rounded-[2px] border border-ink/10 bg-white p-7 md:p-9" aria-label="92 percent of buyers search online">
              <p className="font-mono text-6xl font-semibold tracking-tight text-ink md:text-7xl">
                92<span className="text-porchlight-deep">%</span>
              </p>
              <figcaption className="mt-2 text-sm text-stone">
                of buyers start their home search online
              </figcaption>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-ink/10 pt-5 text-sm text-ink sm:grid-cols-3">
                {["MLS", "100+ portals", "realtylt.com", "Google", "Social media", "Email alerts"].map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-porchlight" /> {c}
                  </li>
                ))}
              </ul>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── Stay in the loop */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="loop-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading dark as="h2">
              <span id="loop-heading">Stay in the Loop — <strong className="font-bold">Every Step of the Way</strong></span>
            </SectionHeading>
            <p className="mt-4 max-w-lg text-sm font-bold uppercase tracking-[0.12em] text-paper">
              Real-time updates until your home is sold
            </p>
            <p className="mt-5 max-w-lg leading-relaxed text-paper/75">
              Most agents leave you in the dark. We believe in complete transparency: instant
              updates on showings, offers, and buyer feedback through our online portal — you know
              exactly what&rsquo;s happening with your sale, 24/7. No more wondering
              &ldquo;what&rsquo;s going on?&rdquo;
            </p>
            <div className="mt-7">
              <Button href="#offer-form" variant="light">Get Your Free Cash Offer &amp; Analysis ↑</Button>
            </div>
            <p className="mt-3 text-xs tracking-wide text-paper/60">
              Takes less than 60 seconds · No obligation
            </p>
          </Reveal>
          <Reveal delay={150}>
            <ol className="relative space-y-6 border-l border-paper/15 pl-6" aria-label="What you see while your home is on the market">
              {LOOP_STEPS.map((s, i) => (
                <li key={s.label} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-porchlight" : "bg-paper/30"}`}
                  />
                  <p className="font-bold text-paper">{s.label}</p>
                  <p className="text-sm text-paper/60">{s.note}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>
    </>
  );
}
