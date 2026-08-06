import Link from "next/link";
import Image from "next/image";
import { LeadForm } from "@/components/leads/LeadForm";
import { EqualHousingMark } from "@/components/site/EqualHousingMark";
import { FOOTER_NAV, SITE } from "@/lib/site";

/** Site footer.
 *
 * Round 11 regrouped it. It used to run page links, then the message form, then the REACH OUT
 * details — so on a phone the two reference blocks sat at opposite ends with a six-field form
 * wedged between them, and on desktop the same three columns had the same problem left to
 * right. The owner asked for the contact details and the page links to be grouped, with the
 * form treated as its own block.
 *
 * The designer's call, applied at EVERY width rather than only on mobile: the form is the
 * action, so it leads; everything you look something up in — who we are, how to reach us,
 * where to go next — is one contiguous reference block after it. Keeping one order at every
 * size also means the visual order and the DOM order never disagree, so keyboard focus and a
 * screen reader walk the footer in exactly the order the eye does.
 */
export function Footer() {
  return (
    <footer className="border-t border-line bg-paper text-stone">
      <div className="mx-auto grid max-w-[1250px] gap-14 px-4 py-16 md:grid-cols-[1.25fr_1fr] md:gap-20 md:py-24 lg:px-8">
        <section aria-labelledby="footer-form-heading">
          <h2 id="footer-form-heading" className="t-h3 text-ink">
            Tell us what you&rsquo;re looking for
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed">
            A house, a neighborhood, a number you need to hit. We read every message and answer
            seven days a week.
          </p>
          {/* First/Last split matches the rest of the site's lead forms. */}
          <div className="mt-7">
            <LeadForm splitName submitLabel="Send Us A Message" />
          </div>
        </section>

        <div>
          <Image
            src="/logo-realtylt.png"
            alt="RealtyLT"
            width={200}
            height={41}
            className="h-auto w-44"
          />

          <p className="t-eyebrow mt-9 text-ink">Reach Out</p>
          <address className="mt-4 space-y-1 text-sm font-light not-italic">
            <p>{SITE.address.street}</p>
            <p>
              {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
            </p>
            <p>
              <a
                href={SITE.phoneHref}
                className="inline-flex min-h-[24px] items-center transition-colors hover:text-ink"
              >
                {SITE.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex min-h-[24px] items-center transition-colors hover:text-ink"
              >
                {SITE.email}
              </a>
            </p>
          </address>

          <nav aria-label="Footer" className="mt-10 border-t border-line pt-8">
            {/* inline-flex min-h-[24px]: text-sm links with no padding measured ~17px tall,
                under the WCAG 2.5.8 (24px) pointer-target minimum. Height only. */}
            {/* gap-y-2.5, not 1: at 4px against 24px targets these read as a cramped list of
                options rather than a set of destinations, and at 1440 the column they sit in
                ends ~220px above the strip below it — the space to breathe was already there
                and unused. The pairs are horizontal and meant to be (Buying|Selling,
                Financing|Home Value), so the row gap is the one to open, not the column gap. */}
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm font-light">
              {FOOTER_NAV.map((item) =>
                "external" in item && item.external ? (
                  // /ai is served by an external rewrite, not an RSC route — a plain anchor
                  // avoids a 404 from Next's link prefetch.
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="inline-flex min-h-[24px] items-center text-ink-soft transition-colors hover:text-stone"
                    >
                      {item.label}
                    </a>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-[24px] items-center text-ink-soft transition-colors hover:text-stone"
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Legal marks + disclaimer. The Equal Housing Opportunity logo appears on every page
          because a real estate website is advertising, which is where HUD asks for it. The
          REALTOR® mark is set as a word mark in our own type — the form NAR states as
          preferred — and it is followed by the membership reference NAR's contextual-use rule
          requires. See docs/parity/DESIGN-ROUND11.md §3 for the rules these follow. */}
      <div className="mx-auto max-w-[1250px] px-4 pb-10 lg:px-8">
        <div className="flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex items-center gap-5">
            <EqualHousingMark className="h-8 w-auto shrink-0 text-stone" />
            <p className="text-xs leading-relaxed">
              Equal Housing Opportunity. Member of the National Association of REALTORS&reg;.
            </p>
          </div>
          <p className="text-xs leading-relaxed sm:max-w-md sm:text-right">
            &copy; {new Date().getFullYear()} {SITE.legalName}. {SITE.disclaimer}
          </p>
        </div>
      </div>

      <div className="bg-ink text-paper/70">
        {/* A pure utility strip. It used to open with a second copyright notice — "© 2026
            RealtyLT" sitting directly under "© 2026 Levan Tsiklauri | United Real Estate. Each
            office is independently owned and operated." two strips apart. One of them had to
            go, and it is this one: the other names the legal entity and carries the franchise
            disclaimer, and it belongs with the Equal Housing and REALTOR® marks it sits beside. */}
        <div className="mx-auto flex max-w-[1250px] flex-col gap-2 px-4 py-4 text-xs md:flex-row md:items-center md:justify-center lg:px-8">
          {/* inline-flex min-h-[24px]: text-xs links with no padding were ~13px tall, under the
              WCAG 2.5.8 (24px) pointer-target minimum on mobile. */}
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            <li>
              <Link
                href="/privacy-policy"
                className="inline-flex min-h-[24px] items-center transition-colors hover:text-paper"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/dmca-terms"
                className="inline-flex min-h-[24px] items-center transition-colors hover:text-paper"
              >
                DMCA &amp; Terms of Service
              </Link>
            </li>
            <li>
              <a
                href="/sitemap.xml"
                className="inline-flex min-h-[24px] items-center transition-colors hover:text-paper"
              >
                Sitemap
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
