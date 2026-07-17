import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HomeValueForm } from "@/components/leads/HomeValueForm";

export const metadata: Metadata = {
  title: "Home Value | How Much Is Your Home Really Worth?",
  description:
    "Get an accurate, human-prepared valuation of your Hudson Valley home: a 15-comp market analysis plus your cash-offer number, free and with no obligation.",
};

const STEPS = [
  {
    title: "Tell us about your home",
    body: "Address, condition, and anything a drive-by can't see: a new roof, a finished basement, the things that change the number.",
  },
  {
    title: "We run the comps",
    body: "Fifteen comparable properties (five active, five pending, five sold) analyzed against current market conditions. Not an algorithm's guess.",
  },
  {
    title: "You get both numbers",
    body: "Your market list price and a guaranteed cash offer, side by side, usually within a day. What you do with them is up to you.",
  },
];

export default async function HomeValuePage({
  searchParams,
}: {
  searchParams: Promise<{ address?: string }>;
}) {
  // The /selling qualifying wizard's "My Home Value" branch lands here with ?address=…
  const { address } = await searchParams;
  return (
    <>
      {/* ── Hero + form — live: near-full-viewport BRIGHT dusk photo (luminance ~88, no dark
          wash), bold sans headline 64px w700 (live loads Montserrat; the "serif" in earlier
          captures was a headless font-fallback artifact — we use brand Lato bold). */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="hv-hero">
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/selling.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-black/15" />
        </div>
        <div className="relative mx-auto flex min-h-[520px] max-w-[1250px] flex-col justify-center px-4 py-20 text-center md:min-h-[850px] lg:px-8">
          <h1
            id="hv-hero"
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-paper [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] md:text-[64px]"
          >
            How Much Is Your Home Really Worth?
          </h1>
          <div className="mt-8">
            <HomeValueForm defaultAddress={address} />
          </div>
          <p className="mx-auto mt-6 max-w-xl text-[21px] text-paper [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
            Join the homeowners across the Hudson Valley and NYC in finding your home&rsquo;s value
          </p>
        </div>
      </section>

      {/* ── How it works */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="hv-how">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="hv-how">A Valuation You Can Actually Act On</span>
            </SectionHeading>
          </Reveal>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 120}>
                <div className="h-full border border-[#dddddd] bg-white p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Step {i + 1} of 3</p>
                  <h3 className="mt-2 text-xl font-bold text-ink">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-12">
            <aside className="bg-mist px-6 py-8 text-center md:px-12">
              <p className="text-xl font-light text-ink">
                Thinking cash offer instead?{" "}
                <a href="/selling" className="font-bold underline underline-offset-4 hover:text-stone">
                  Compare both paths on the selling page
                </a>
              </p>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
