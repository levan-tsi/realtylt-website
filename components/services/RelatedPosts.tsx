import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fmtDate, getArticles } from "@/lib/blog";
import type { Service } from "@/lib/services";

/** Blog cross-links, resolved through the same loader the blog uses, so a post published
 * from the CRM under one of these slugs replaces the static stub here too. Renders nothing
 * when a service has no related posts, or when the slugs no longer resolve. */
export async function RelatedPosts({ service }: { service: Service }) {
  const slugs = service.relatedPosts ?? [];
  if (slugs.length === 0) return null;

  const all = await getArticles();
  const posts = slugs
    .map((slug) => all.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  if (posts.length === 0) return null;

  return (
    <section className="bg-mist py-16 md:py-20" aria-labelledby="related-heading">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Read more" as="h2">
            <span id="related-heading">
              Written up in <strong className="font-bold">more detail</strong>
            </span>
          </SectionHeading>
        </Reveal>

        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((p, i) => (
            <Reveal key={p.slug} as="li" delay={i * 110} className="min-w-0">
              <article className="group relative grid h-full grid-cols-[auto_1fr] items-center gap-5 border border-[#dddddd] bg-white p-4 transition-colors hover:border-ink/35 sm:gap-6 sm:p-5">
                <Link href={`/blog/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title} />
                <div className="photo-zoom relative h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28">
                  <Image src={p.cover} alt="" fill sizes="112px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-stone">{fmtDate(p.date)}</p>
                  <h3 className="mt-2 text-base font-bold leading-snug text-ink-soft group-hover:text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">{p.excerpt}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
