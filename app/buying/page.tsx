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
      {/* ── Hero — live: dark interior photo, centered white copy, phone + white CTA */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="buying-hero">
        <div className="absolute inset-0">
          {/* Live shows the interior clearly — keep the photo readable under a light scrim */}
          <Image
            src="/images/lifestyle/buying.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-28 text-center md:py-36 lg:px-8">
          <h1 id="buying-hero" className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-paper md:text-4xl">
            Ready to Find Your Dream Home?
          </h1>
          <p className="mt-4 text-base font-bold uppercase tracking-[0.12em] text-paper md:text-lg">
            Get a free consultation with our buyer specialists
          </p>
          <p className="mx-auto mt-4 max-w-xl text-paper/85">
            We&rsquo;ll help you navigate the market, find homes that match your criteria, and
            negotiate the best deal. No pressure, no obligation — just expert guidance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={SITE.phoneHref} variant="outline-light">☎ {SITE.phone}</Button>
            <Button href="/connect" variant="light">Book Free Consultation</Button>
          </div>
          <p className="mt-5 text-xs tracking-wide text-paper/60">
            Available 7 days a week • Fast response • No obligation
          </p>
        </div>
      </section>

      {/* ── The process intro */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="process-heading">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
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
        <div className="mx-auto max-w-6xl space-y-20 px-4 lg:px-8">
          <h2 id="steps-heading" className="sr-only">
            From search to keys
          </h2>

          {/* 1 — Search */}
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
              <div className="grid grid-cols-2 gap-3">
                {["house-01", "house-04", "house-08", "house-13"].map((h, i) => (
                  <div key={h} className={`photo-zoom relative aspect-[4/3] overflow-hidden ${i % 2 ? "mt-6" : ""}`}>
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
                <figure className="mx-auto max-w-sm border border-paper/20 bg-white/5 p-6" aria-label="Example listing alert">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-paper/50">Listing alert · just now</p>
                  <p className="mt-3 text-lg font-bold text-paper">New match: 3 bd in Beacon under $600K</p>
                  <p className="mt-1 text-sm text-paper/85">$585,000 · 24 Verplanck Ave</p>
                  <p className="mt-3 text-sm text-paper/60">
                    Sent the moment it hit the market — before the portals surface it.
                  </p>
                </figure>
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

      {/* ── Step 3 — live: white section */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="save-heading">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <h3 id="save-heading" className="text-3xl font-light text-ink md:text-4xl">
              Save and <strong className="font-bold">See Listings</strong>
            </h3>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-ink-soft">
              Favorite properties and tour homes
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-stone">
              Click the ♡ icon when you find a house you love to save it in your favorites section,
              and let us know you like it. Reach out to your agent directly to schedule an
              in-person showing — we&rsquo;ll walk you through the home and answer any questions,
              so you can make an informed decision.
            </p>
            <div className="mt-6">
              <Button href="/saved" variant="outline">Your Saved Homes</Button>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <figure className="mx-auto w-full max-w-sm border border-[#dddddd] bg-white p-5" aria-label="Example saved home card">
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image src="/images/listings/house-05.jpg" alt="" fill sizes="24rem" className="object-cover" />
                <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-red-500 stroke-red-500" strokeWidth="1.8" aria-hidden>
                    <path d="M12 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.5.5.5-.5a4.8 4.8 0 0 1 6.8 6.8L12 20.3z" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-lg font-bold text-ink">Saved · tour Saturday 11:00</p>
              <p className="text-sm text-stone">We&rsquo;ll meet you at the door.</p>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── Step 4 — live: black section */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="close-heading">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
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
