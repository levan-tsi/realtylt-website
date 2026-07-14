import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Service } from "@/lib/services";

/** The internal-link rail. Twenty service pages that only link back up to the index are
 * twenty leaves; linking sideways is what makes them a section of the site. */
export function MoreServices({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section className="bg-paper py-16 md:py-20" aria-labelledby="more-heading">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Also built" as="h2">
              <span id="more-heading">
                The rest of the <strong className="font-bold">machine</strong>
              </span>
            </SectionHeading>
            <Link
              href="/services"
              className="pb-1 text-sm font-bold text-ink underline-offset-4 hover:underline"
            >
              All AI services
            </Link>
          </div>
        </Reveal>

        <ul className="mt-10 grid gap-px border border-[#e3e6ea] bg-[#e3e6ea] sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} as="li" delay={(i % 3) * 90} className="min-w-0 bg-white">
              <Link
                href={`/services/${s.slug}`}
                className="group flex h-full flex-col p-6 transition-colors hover:bg-mist"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
                  {s.eyebrow}
                </p>
                <h3 className="mt-2.5 text-base font-bold leading-snug text-ink-soft group-hover:text-ink">
                  {s.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">{s.title}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
