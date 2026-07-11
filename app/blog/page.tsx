import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { fmtDate, POSTS } from "@/content/blog/posts";

export const metadata: Metadata = {
  title: "Blog — Stay Up To Date",
  description:
    "Hudson Valley real estate advice from RealtyLT — buying, selling, moving, and homeownership guides written for New York.",
};

export default function BlogIndexPage() {
  const [featured, ...rest] = POSTS;

  return (
    <>
      {/* ── Hero — live: laptop photo band, centered "Stay Up To Date" */}
      <header className="relative isolate overflow-hidden bg-ink">
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/financing.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center md:py-28 lg:px-8">
          <h1 className="text-3xl font-light text-paper md:text-4xl">
            Stay <strong className="font-bold">Up To Date</strong>
          </h1>
        </div>
      </header>

      <section className="bg-paper py-14 md:py-20" aria-label="Articles">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          {/* Featured — live: image left, date/title/excerpt/READ MORE right */}
          <Reveal>
            <article className="group relative grid items-center gap-8 md:grid-cols-2">
              <Link href={`/blog/${featured.slug}`} className="absolute inset-0 z-10" aria-label={featured.title} />
              <div className="photo-zoom relative aspect-[16/10] overflow-hidden">
                <Image
                  src={featured.cover}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone">
                  {fmtDate(featured.date)}
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-snug text-ink-soft md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 leading-relaxed text-stone">{featured.excerpt}</p>
                <span className="mt-6 inline-block rounded-[4px] bg-ink px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors group-hover:bg-ink-soft">
                  Read More
                </span>
              </div>
            </article>
          </Reveal>

          {/* Grid — live: photo, centered date, centered bold title */}
          <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              // min-w-0 lets the truncated title actually truncate (grid items default to
              // min-width:auto → the nowrap H2 forced ~816px width + horizontal scroll @390).
              <Reveal key={p.slug} as="li" delay={(i % 3) * 100} className="min-w-0">
                <article className="group relative h-full text-center">
                  <Link href={`/blog/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title} />
                  <div className="photo-zoom relative aspect-[16/11] overflow-hidden">
                    <Image
                      src={p.cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.14em] text-stone">{fmtDate(p.date)}</p>
                  <h2 className="mt-1.5 truncate text-base font-bold leading-snug text-ink-soft group-hover:text-ink">
                    {p.title}
                  </h2>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
