import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { COUNTY_CONTENT } from "@/content/counties";
import { SERVED_AREAS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who We Are | Levan Tsiklauri, United Real Estate",
  description:
    "Meet RealtyLT: Levan Tsiklauri, investor and Realtor with United Real Estate, serving the Hudson Valley and New York City from Lagrangeville, NY.",
};

const VALUES = [
  {
    title: "Straight answers",
    body: "You'll always hear the honest number and the honest trade-off, even when it's not what sells easiest.",
  },
  {
    title: "Investor's eye",
    body: "We buy and hold property ourselves. That lens (cash flow, condition, resale) comes free with every showing.",
  },
  {
    title: "Seven-day service",
    body: "Real estate doesn't keep office hours, and neither do we. Evenings and weekends are when deals happen.",
  },
];

export default function WhoWeArePage() {
  return (
    <>
      {/* ── Hero — live: office/team photo band, centered "Who We Are" */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="wwa-hero">
        <div className="absolute inset-0">
          <Image
            src="/images/team-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative mx-auto max-w-[1250px] px-4 py-24 text-center md:py-32 lg:px-8">
          <h1 id="wwa-hero" className="text-3xl font-light text-paper md:text-4xl">
            Who <strong className="font-bold">We Are</strong>
          </h1>
        </div>
      </section>

      {/* ── Agent card — live: circular B/W portrait, name, CALL + CONTACT */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="agent-heading">
        <div className="mx-auto max-w-[1250px] px-4 text-center lg:px-8">
          <Reveal>
            <span className="mx-auto block h-56 w-56 overflow-hidden rounded-full">
              <Image
                src="/images/levan-portrait.jpg"
                alt="Levan Tsiklauri"
                width={224}
                height={224}
                className="h-full w-full object-cover grayscale"
              />
            </span>
            <h2 id="agent-heading" className="mt-6 text-2xl text-ink-soft">
              Levan Tsiklauri
            </h2>
            <p className="mt-1 text-stone">Investor &amp; Realtor</p>
            <div className="mx-auto mt-7 flex w-fit flex-wrap justify-center gap-3">
              <Button href={SITE.phoneHref}>Call</Button>
              <Button href="/connect">Contact</Button>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mx-auto mt-12 max-w-2xl space-y-4 text-left leading-relaxed text-stone">
              <p>
                RealtyLT is Levan Tsiklauri, an investor and Realtor with United Real Estate,
                working the mid-Hudson region from Lagrangeville. Levan came to real estate the
                practical way: buying, renovating, and managing property himself before ever
                representing a client. That experience shapes how RealtyLT works today: numbers
                first, honest advice always, and no pressure at any step.
              </p>
              <p>
                United Real Estate backs that work with the reach of a national brokerage (MLS
                syndication, marketing tools, and a referral network) while every client still
                talks to the same person from first call to closing. {SITE.disclaimer}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Values */}
      <section className="bg-mist py-16 md:py-20" aria-labelledby="values-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="values-heading">What You Can Hold Us To</span>
            </SectionHeading>
          </Reveal>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} as="li" delay={i * 110}>
                <div className="h-full border border-[#dddddd] bg-white p-7">
                  <h3 className="text-xl font-bold text-ink">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Where we work */}
      <section className="bg-paper py-14" aria-labelledby="serve-heading">
        <div className="mx-auto max-w-[1250px] px-4 text-center lg:px-8">
          <h2 id="serve-heading" className="text-2xl font-light text-ink">
            Where We Work
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {SERVED_AREAS.map((c) => (
              <li key={c.slug}>
                <Link
                  // Boroughs have no editorial /top-areas page yet — send them to search.
                  href={
                    COUNTY_CONTENT.some((k) => k.slug === c.slug)
                      ? `/top-areas/${c.slug}`
                      : `/search?county=${c.slug}`
                  }
                  className="inline-block border border-[#cccccc] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-stone transition-colors hover:border-ink hover:text-ink"
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
