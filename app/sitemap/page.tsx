import type { Metadata } from "next";
import Link from "next/link";
import { getDirectory, sectionCount, type DirectoryLink } from "./directory";

export const metadata: Metadata = {
  title: "Site Map",
  description:
    "Every public page on realtylt.com in one place: search, buying, selling, top areas, AI services, the blog, and our legal and fair housing pages.",
};

// Same cadence as sitemap.xml — a CRM blog publish shows up here within the hour.
export const revalidate = 3600;

/** One row. Internal links go through <Link>; `external` covers the /ai rewrite (no RSC
 * payload to prefetch), the NY DOS notice, and /sitemap.xml — the router owns none of them. */
function Row({ link }: { link: DirectoryLink }) {
  // Padding lives on the anchor, not the li: a label-only row's link was 19px tall,
  // under the 24px tap-target floor (the probe caught all 31 noteless rows).
  const className = "block py-3 text-ink transition-colors hover:text-river";
  const body = (
    <>
      {link.label}
      {link.note && <span className="mt-0.5 block t-small text-stone">{link.note}</span>}
    </>
  );
  return (
    <li className="border-t border-line">
      {link.external ? (
        <a href={link.href} className={className}>
          {body}
        </a>
      ) : (
        <Link href={link.href} className={className}>
          {body}
        </Link>
      )}
    </li>
  );
}

export default async function SiteMapPage() {
  const sections = await getDirectory();
  const posts = sections.find((s) => s.id === "blog")!;

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1250px] px-4 py-14 lg:px-8 lg:py-20">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-16">
          {/* ── The rail: title, intro, and a jump list that counts each section. Sticky at
                lg so the index stays put while ~70 rows scroll; stacked (and still useful)
                on a phone. */}
          <header className="lg:sticky lg:top-10 lg:self-start">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-river">Index</p>
            <h1 className="mt-3 t-h1 text-ink">
              Site <strong>Map</strong>
            </h1>
            <p className="mt-4 text-stone">
              Every public page on this site, in one place. If you cannot find something here,
              it does not exist yet.
            </p>
            <nav aria-label="Site map sections" className="mt-8">
              <ul>
                {sections.map((s) => (
                  <li key={s.id} className="border-t border-line">
                    <a
                      href={`#${s.id}`}
                      className="flex items-baseline justify-between gap-4 py-2.5 text-ink transition-colors hover:text-river"
                    >
                      {s.title}
                      <span className="font-mono text-xs text-stone">{sectionCount(s)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          <div className="mt-12 space-y-16 lg:mt-0">
            {sections.map((section) => (
              <section key={section.id} aria-labelledby={`sm-${section.id}`} className="scroll-mt-8" id={section.id}>
                <div className="flex items-baseline justify-between gap-4 pb-3">
                  <h2 id={`sm-${section.id}`} className="t-h3 text-ink">
                    {section.title}
                  </h2>
                  <span className="font-mono text-xs text-stone">{sectionCount(section)}</span>
                </div>

                {section.id === "blog" ? (
                  /* Post rows: title + date share a baseline; a long title wraps and the
                     date holds its column. */
                  <ul>
                    {posts.groups[0].links.map((l) => (
                      <li key={l.href} className="border-t border-line">
                        <Link
                          href={l.href}
                          className="flex items-baseline justify-between gap-5 py-3 text-ink transition-colors hover:text-river"
                        >
                          <span>{l.label}</span>
                          <span className="shrink-0 font-mono text-xs text-stone">{l.note}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  section.groups.map((group, gi) => (
                    <div key={group.label ?? gi} className={gi > 0 ? "mt-8" : undefined}>
                      {group.label && (
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
                          {group.label}
                        </p>
                      )}
                      <ul
                        className={
                          section.id === "pages" || section.id === "legal"
                            ? "grid gap-x-10 sm:grid-cols-2"
                            : "grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3"
                        }
                      >
                        {group.links.map((l) => (
                          <Row key={l.href} link={l} />
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
