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
      <header className="bg-ink py-14 text-paper md:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">Blog</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Stay up to <span className="text-porchlight">date</span>
          </h1>
          <p className="mt-3 max-w-xl text-paper/75">
            Buying, selling, moving, and owning in the Hudson Valley — written from the field, not
            a content farm.
          </p>
        </div>
      </header>

      <section className="bg-paper py-14 md:py-20" aria-label="Articles">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Featured */}
          <Reveal>
            <article className="lift group relative grid overflow-hidden rounded-[2px] border border-ink/10 bg-white md:grid-cols-2">
              <Link href={`/blog/${featured.slug}`} className="absolute inset-0 z-10" aria-label={featured.title} />
              <div className="photo-zoom relative aspect-[16/10] overflow-hidden md:aspect-auto">
                <Image
                  src={featured.cover}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-7 md:p-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone">
                  {fmtDate(featured.date)} · Featured
                </p>
                <h2 className="mt-3 font-display text-2xl leading-snug text-ink group-hover:text-porchlight-deep md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 leading-relaxed text-stone">{featured.excerpt}</p>
                <p className="mt-6 font-bold text-river">Read more →</p>
              </div>
            </article>
          </Reveal>

          {/* Grid */}
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} as="li" delay={(i % 3) * 100}>
                <article className="lift group relative h-full overflow-hidden rounded-[2px] border border-ink/10 bg-white">
                  <Link href={`/blog/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title} />
                  <div className="photo-zoom relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={p.cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone">{fmtDate(p.date)}</p>
                    <h2 className="mt-2 font-display text-lg leading-snug text-ink group-hover:text-porchlight-deep">
                      {p.title}
                    </h2>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
