import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LeadForm } from "@/components/leads/LeadForm";

export const metadata: Metadata = {
  title: "Home Value — How Much Is Your Home Really Worth?",
  description:
    "Get an accurate, human-prepared valuation of your Hudson Valley home — a 15-comp market analysis plus your cash-offer number, free and with no obligation.",
};

const STEPS = [
  {
    title: "Tell us about your home",
    body: "Address, condition, and anything a drive-by can't see — a new roof, a finished basement, the things that change the number.",
  },
  {
    title: "We run the comps",
    body: "Fifteen comparable properties — five active, five pending, five sold — analyzed against current market conditions. Not an algorithm's guess.",
  },
  {
    title: "You get both numbers",
    body: "Your market list price and a guaranteed cash offer, side by side, usually within a day. What you do with them is up to you.",
  },
];

export default function HomeValuePage() {
  return (
    <>
      {/* ── Hero + form */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="hv-hero">
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/selling.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-zoom object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/50" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          <div className="self-center">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">Home value</p>
            <h1 id="hv-hero" className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-paper md:text-6xl">
              How much is your home <span className="text-porchlight">really</span> worth?
            </h1>
            <p className="mt-5 max-w-xl text-lg text-paper/80">
              Online estimates miss the new kitchen, the wet basement, and everything in between.
              We prepare your valuation the accurate way — by hand, from real comparable sales in
              your town.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
              Free · No obligation · Usually ready within a day
            </p>
          </div>
          <Reveal delay={150} className="lg:w-full lg:max-w-md lg:justify-self-end">
            <div className="rounded-[2px] border border-paper/15 bg-ink-soft/90 p-6 shadow-2xl backdrop-blur md:p-8">
              <h2 className="font-display text-2xl text-paper">Tell us about your home</h2>
              <p className="mb-5 mt-1 text-sm text-paper/60">
                Join the homeowners across six counties who started here.
              </p>
              <LeadForm
                dark
                compact
                withAddress
                defaultReason="I'm interested in selling a home"
                submitLabel="Find Out What It's Worth"
                successTitle="Request received."
                successBody="We're pulling your comps now — expect to hear from us within the day."
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How it works */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="hv-how">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="How it works" align="center" as="h2">
              <span id="hv-how">A valuation you can actually act on</span>
            </SectionHeading>
          </Reveal>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 120}>
                <div className="h-full rounded-[2px] border border-ink/10 bg-white p-7">
                  <p className="font-mono text-sm text-porchlight-deep">Step {i + 1} of 3</p>
                  <h3 className="mt-2 font-display text-xl text-ink">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-12">
            <aside className="rounded-[2px] bg-mist px-6 py-8 text-center md:px-12">
              <p className="font-display text-xl text-ink">
                Thinking cash offer instead?{" "}
                <a href="/selling" className="text-river underline underline-offset-4 hover:text-ink">
                  Compare both paths on the selling page →
                </a>
              </p>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
