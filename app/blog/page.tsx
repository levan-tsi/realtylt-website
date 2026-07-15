import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { fmtDate, getArticles, type Article } from "@/lib/blog";
import { readingTime } from "@/lib/blog/toc";

export const metadata: Metadata = {
  title: "Blog — Stay Up To Date",
  description:
    "Hudson Valley real estate advice from RealtyLT — buying, selling, moving, and homeownership guides written for New York.",
};

// Articles come from the static collection PLUS anything published from the CRM
// ("Website" section → Supabase blog_posts). ISR ceiling; a publish also pings
// /api/revalidate for an immediate refresh. See docs/BLOG-CMS.md.
// MUST be a literal — Next statically analyses this export and rejects an imported
// constant ("Unknown identifier ... at revalidate"). Keep in sync with
// BLOG_REVALIDATE_SECONDS in lib/blog/db.ts (300).
export const revalidate = 300;

const minutes = (a: Article) =>
  readingTime(a.body.kind === "markdown" ? a.body.markdown : a.body.paragraphs.join(" "));

export default async function BlogIndexPage() {
  const articles = await getArticles();
  const [featured, ...rest] = articles;

  return (
    <>
      {/* ── Hero — ink editorial band, cohesive with the article pages. */}
      <header className="relative isolate overflow-hidden bg-ink text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 80% at 50% -10%, rgba(40,168,224,0.13), transparent 66%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-24 lg:px-8">
          <p className="rise text-xs font-bold uppercase tracking-[0.22em] text-paper/55">The RealtyLT journal</p>
          <h1 className="rise rise-2 mt-4 max-w-2xl text-4xl font-light leading-[1.1] tracking-[-0.01em] md:text-[52px]">
            Stay <strong className="font-bold">up to date</strong>
          </h1>
          <p className="rise rise-3 mt-5 max-w-xl text-lg leading-relaxed text-paper/75">
            Straight talk on buying, selling, moving, and owning a home across the Hudson Valley, written from
            local experience across six New York counties.
          </p>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
      </header>

      <section className="bg-paper py-14 md:py-20" aria-label="Articles">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          {!featured ? (
            // Defensive: the static collection is never empty, so this only shows if a
            // future edit removes it — an honest state instead of a blank page.
            <div className="mx-auto max-w-xl py-10 text-center">
              <p className="text-xl font-light text-ink">New articles are on the way.</p>
              <p className="mt-3 leading-relaxed text-stone">
                We&rsquo;re writing up what we&rsquo;re seeing across the Hudson Valley. In the meantime, ask us
                anything, and we answer seven days a week.
              </p>
              <div className="mt-6">
                <Button href="/connect">Ask us directly</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Featured */}
              <Reveal>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone">Latest</p>
                <article className="group relative mt-6 grid items-center gap-8 md:grid-cols-2 md:gap-12">
                  <Link href={`/blog/${featured.slug}`} className="absolute inset-0 z-10" aria-label={featured.title} />
                  <div className="photo-zoom relative aspect-[16/10] overflow-hidden rounded-[14px] bg-mist">
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
                    <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.14em] text-stone">
                      <time dateTime={featured.date}>{fmtDate(featured.date)}</time>
                      <span aria-hidden className="text-[#c3c9d2]">/</span>
                      <span>{minutes(featured)} min read</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold leading-snug text-ink-soft transition-colors group-hover:text-porchlight-deep md:text-[32px]">
                      {featured.title}
                    </h2>
                    <p className="mt-4 leading-relaxed text-stone">{featured.excerpt}</p>
                    <span className="mt-6 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.1em] text-ink">
                      Read article
                      <span aria-hidden className="h-px w-8 bg-ink transition-all duration-300 group-hover:w-14" />
                    </span>
                  </div>
                </article>
              </Reveal>

              <div className="mt-14 border-t border-[#e3e6ea] pt-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone">More reading</p>
                <ul className="mt-7 grid gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p, i) => (
                    // min-w-0 lets the clamped title truncate instead of forcing overflow.
                    <Reveal key={p.slug} as="li" delay={(i % 3) * 90} className="min-w-0">
                      <article className="group relative h-full">
                        <Link href={`/blog/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title} />
                        <div className="photo-zoom relative aspect-[16/11] overflow-hidden rounded-[12px] bg-mist">
                          <Image
                            src={p.cover}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="mt-4 flex items-center gap-2.5 text-[11px] uppercase tracking-[0.14em] text-stone">
                          <time dateTime={p.date}>{fmtDate(p.date)}</time>
                          <span aria-hidden className="text-[#c3c9d2]">/</span>
                          <span>{minutes(p)} min</span>
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-ink-soft transition-colors group-hover:text-porchlight-deep">
                          {p.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">{p.excerpt}</p>
                      </article>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
