import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { COUNTY_CONTENT } from "@/content/counties";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who We Are — Levan Tsiklauri | United Real Estate",
  description:
    "Meet RealtyLT: Levan Tsiklauri, investor and Realtor with United Real Estate, serving six Hudson Valley counties from Lagrangeville, NY.",
};

const VALUES = [
  {
    title: "Straight answers",
    body: "You'll always hear the honest number and the honest trade-off — even when it's not what sells easiest.",
  },
  {
    title: "Investor's eye",
    body: "We buy and hold property ourselves. That lens — cash flow, condition, resale — comes free with every showing.",
  },
  {
    title: "Seven-day service",
    body: "Real estate doesn't keep office hours, and neither do we. Evenings and weekends are when deals happen.",
  },
];

export default function WhoWeArePage() {
  return (
    <>
      {/* ── Hero + bio */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="wwa-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <Reveal>
            <div className="mx-auto grid aspect-[4/5] w-full max-w-sm place-items-center rounded-[2px] border border-paper/15 bg-ink-soft">
              <div className="text-center">
                <span className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-paper/10 font-display text-5xl text-porchlight">
                  LT
                </span>
                <p className="mt-5 font-display text-2xl">Levan Tsiklauri</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
                  Investor &amp; Realtor
                </p>
                <p className="mt-4 px-6 font-mono text-[10px] uppercase tracking-[0.14em] text-porchlight/70">
                  Photo placeholder — owner&rsquo;s portrait to be added
                </p>
              </div>
            </div>
          </Reveal>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">Who we are</p>
            <h1 id="wwa-hero" className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
              One agent, six counties, <span className="text-porchlight">zero scripts</span>
            </h1>
            <div className="mt-6 max-w-xl space-y-4 leading-relaxed text-paper/75">
              <p>
                <span className="rounded-[2px] bg-porchlight/15 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-porchlight">
                  Placeholder copy
                </span>{" "}
                — the owner&rsquo;s final bio (from Drive) replaces this section.
              </p>
              <p>
                RealtyLT is Levan Tsiklauri — an investor and Realtor with United Real Estate,
                working the mid-Hudson region from Lagrangeville. Levan came to real estate the
                practical way: buying, renovating, and managing property himself before ever
                representing a client. That experience shapes how RealtyLT works today — numbers
                first, honest advice always, and no pressure at any step.
              </p>
              <p>
                United Real Estate backs that work with the reach of a national brokerage — MLS
                syndication, marketing tools, and a referral network — while every client still
                talks to the same person from first call to closing. {SITE.disclaimer}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={SITE.phoneHref} size="lg">Call {SITE.phone}</Button>
              <Button href="/connect" variant="outline-light" size="lg">Contact</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="values-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="How we work" align="center" as="h2">
              <span id="values-heading">What you can hold us to</span>
            </SectionHeading>
          </Reveal>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} as="li" delay={i * 110}>
                <div className="h-full rounded-[2px] border border-ink/10 bg-white p-7">
                  <h3 className="font-display text-xl text-ink">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Where we work */}
      <section className="bg-mist py-14" aria-labelledby="serve-heading">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 id="serve-heading" className="font-display text-2xl text-ink">
            Where we work
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {COUNTY_CONTENT.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/top-areas/${c.slug}`}
                  className="inline-block rounded-[2px] border border-ink/15 bg-white px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-porchlight-deep hover:text-porchlight-deep"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-stone">
            Based at {SITE.address.street}, {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
          </p>
        </div>
      </section>
    </>
  );
}
