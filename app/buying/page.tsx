import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Buying — Ready to Find Your Dream Home?",
  description:
    "Free buyer consultation with our Hudson Valley specialists — home search, listing alerts, favorites and tours, offers and closing. Buyers pay no cost; we're compensated by sellers.",
};

export default function BuyingPage() {
  return (
    <>
      {/* ── Hero */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="buying-hero">
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/buying.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-zoom object-cover opacity-30 sepia-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/55" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center md:py-28 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">Buying</p>
          <h1 id="buying-hero" className="mx-auto mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-paper md:text-6xl">
            Ready to find your <span className="text-porchlight">dream home</span>?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-paper/80">
            Get a free consultation with our buyer specialists. We&rsquo;ll help you navigate the
            market, find homes that match your criteria, and negotiate the best deal. No pressure,
            no obligation — just expert guidance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={SITE.phoneHref} size="lg">{SITE.phone}</Button>
            <Button href="/connect" variant="outline-light" size="lg">Book a free consultation</Button>
          </div>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
            Available 7 days a week · Fast response · No obligation
          </p>
        </div>
      </section>

      {/* ── The process intro */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="process-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="How we work" align="center" as="h2">
              <span id="process-heading">The home buying process</span>
            </SectionHeading>
            <div className="mx-auto mt-6 max-w-2xl space-y-4 text-center leading-relaxed text-stone">
              <p>
                Buying a home is a big step — whether it&rsquo;s your first home, your dream home,
                or your tenth investment property, it&rsquo;s a big investment. We know how
                important this is to you, and we have an army of experts to make sure we find the
                perfect property for your unique circumstances.
              </p>
              <p>
                We know the market and love real estate, and we&rsquo;ll educate you throughout the
                buying experience — with ongoing access to experts in every related field, from
                lending to relocation.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Step sections */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="steps-heading">
        <div className="mx-auto max-w-7xl space-y-16 px-4 lg:px-8">
          <h2 id="steps-heading" className="sr-only">
            Four steps from search to keys
          </h2>

          {/* 1 — Search */}
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-porchlight">Step 01 · Search</p>
                <h3 className="mt-2 font-display text-3xl">Start your home search</h3>
                <p className="mt-4 max-w-lg leading-relaxed text-paper/75">
                  Start by making a wish list and setting a budget. We&rsquo;ll help you choose a
                  lender so you can be pre-approved for a loan — then search for homes from any
                  device, wherever you are.
                </p>
                <div className="mt-6">
                  <Button href="/search">Start searching</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["house-01", "house-04", "house-08", "house-13"].map((h, i) => (
                  <div key={h} className={`photo-zoom relative aspect-[4/3] overflow-hidden rounded-[2px] ${i % 2 ? "mt-6" : ""}`}>
                    <Image src={`/images/listings/${h}.jpg`} alt="" fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* 2 — Alerts */}
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <figure className="mx-auto max-w-sm rounded-[2px] border border-paper/15 bg-ink-soft p-6" aria-label="Example listing alert">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">Listing alert · just now</p>
                  <p className="mt-3 font-display text-lg text-paper">New match: 3 bd in Beacon under $600K</p>
                  <p className="mt-1 font-mono text-sm text-porchlight">$585,000 · 24 Verplanck Ave</p>
                  <p className="mt-3 text-sm text-paper/60">
                    Sent the moment it hit the market — before the portals surface it.
                  </p>
                </figure>
              </div>
              <div className="order-1 lg:order-2">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-porchlight">Step 02 · Watch</p>
                <h3 className="mt-2 font-display text-3xl">Get listing alerts</h3>
                <p className="mt-4 max-w-lg leading-relaxed text-paper/75">
                  Save a search and any new home matching your wish-list criteria lands in your
                  inbox the moment it goes up for sale. Be first to know — first to tour, first to
                  offer.
                </p>
                <div className="mt-6">
                  <Button href="/search" variant="outline-light">Save a search</Button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 3 — Save & tour */}
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-porchlight">Step 03 · Shortlist</p>
                <h3 className="mt-2 font-display text-3xl">Save and see listings</h3>
                <p className="mt-4 max-w-lg leading-relaxed text-paper/75">
                  Tap the heart on any home you love to keep it in your favorites, then reach out
                  to schedule an in-person showing. We&rsquo;ll walk you through the home and
                  answer every question, so you can make an informed decision.
                </p>
                <div className="mt-6">
                  <Button href="/saved" variant="outline-light">Your saved homes</Button>
                </div>
              </div>
              <figure className="mx-auto w-full max-w-sm rounded-[2px] border border-paper/15 bg-ink-soft p-5" aria-label="Example saved home card">
                <div className="relative aspect-[3/2] overflow-hidden rounded-[2px]">
                  <Image src="/images/listings/house-05.jpg" alt="" fill sizes="24rem" className="object-cover" />
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ink/60">
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-porchlight stroke-porchlight" strokeWidth="1.8" aria-hidden>
                      <path d="M12 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.5.5.5-.5a4.8 4.8 0 0 1 6.8 6.8L12 20.3z" />
                    </svg>
                  </span>
                </div>
                <p className="mt-4 font-mono text-lg text-paper">Saved · tour Saturday 11:00</p>
                <p className="text-sm text-paper/60">We&rsquo;ll meet you at the door.</p>
              </figure>
            </div>
          </Reveal>

          {/* 4 — Offer & closing */}
          <Reveal>
            <div className="rounded-[2px] border border-paper/15 bg-ink-soft p-8 md:p-12">
              <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-porchlight">Step 04 · Close</p>
                  <h3 className="mt-2 font-display text-3xl">Making an offer and closing</h3>
                  <p className="mt-4 max-w-xl leading-relaxed text-paper/75">
                    When you find the home you love, our team helps you submit an offer. We&rsquo;re
                    skilled negotiators who know how to get you the best price and value possible.
                    Once accepted, we navigate inspections, appraisals, and closing in a
                    stress-free way — <strong className="text-paper">we&rsquo;re with you till the end</strong>.
                  </p>
                  <p className="mt-4 max-w-xl leading-relaxed text-paper/75">
                    And all of this comes at no cost to you as the buyer — we&rsquo;re compensated
                    by sellers. Then it&rsquo;s time to get the keys and throw a housewarming party.
                  </p>
                </div>
                <div className="text-center lg:text-right">
                  <Button href="/connect" size="lg">Book your free consultation</Button>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
                    No cost to buyers · Ever
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
