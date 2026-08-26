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
 *
 * Round 27 fixed the SPACING that was contradicting that grouping. Measured at 390: the seam
 * INSIDE the reference block (details to page links: 40px + hairline + 32px = 72px) was wider
 * than the gap BETWEEN the form block and the reference block (56px), so proximity read the
 * links as a third block drifting away from the details they belong with. Now the between-block
 * gap (64px) is the widest interval in the footer and the intra-block seam (56px) sits inside
 * it, wider than the logo-to-details step (36px): three intervals, one hierarchy.
 */
export function Footer() {
  return (
    <footer className="border-t border-line bg-paper text-stone">
      <div className="mx-auto grid max-w-[1250px] gap-16 px-4 py-16 md:grid-cols-[1.25fr_1fr] md:gap-20 md:py-24 lg:px-8">
        <section aria-labelledby="footer-form-heading">
          <h2 id="footer-form-heading" className="t-h3 text-ink">
            Tell us what you&rsquo;re looking for
          </h2>
          {/* The words here are the owner's and the best writing on the site; only the SIZE
              changes. `.t-small` reads at 16px on a phone, where this paragraph is the first
              thing anyone reaching the footer form actually reads. */}
          <p className="t-small mt-3 max-w-md">
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

          {/* mt-7/pt-7, not mt-10/pt-8: this seam separates two halves of ONE reference block,
              so it must read narrower than the 64px gap that separates the blocks (see the
              header comment). The hairline stays — it marks the turn from "how to reach us"
              to "where to go next" without breaking the group. */}
          <nav aria-label="Footer" className="mt-7 border-t border-line pt-7">
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
          requires. See docs/parity/DESIGN-ROUND11.md §3 for the rules these follow.

          h-11, not h-8. Round 11 wrote the sizing rule down and then did not meet it: HUD's
          advertising guidance is that where other logotypes appear, the Equal Housing mark is
          "at least equal in size to the largest of the other logotypes". Measured in round 29,
          the tallest other logotype on every page is the header wordmark — 43.0px between
          640px and 1279px (w-52 on a 300x62 file), 40.5px above that, 36.4px below. The mark
          was 32px on every page at every width, so it was the smallest logotype on the page it
          is supposed to lead. 44px clears the tallest case with 1px to spare and needs no
          responsive fork. The row's type steps up with it (12 -> 13px) so the mark labels
          words of its own weight rather than towering over fine print. */}
      <div className="mx-auto max-w-[1250px] px-4 pb-10 lg:px-8">
        <div className="flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex items-center gap-5">
            <EqualHousingMark className="h-11 w-auto shrink-0 text-stone" />
            {/* text-sm, not an arbitrary text-[13px]: this is running prose, and 13px is not a
                step this site's theme defines. 14px is the size next to it on the scale, it is
                one pixel more legible, and it removes one of the six distinct body sizes the
                rubric was counting on every page. (The 13px LABELS in the header nav and the
                filter chips are a different thing and are left alone.)
                ROUND 38: and now t-small rather than text-sm, so the same prose reaches the 16px
                mobile floor. It reads at 14px from md exactly as it did before. */}
            <p className="t-small">
              Equal Housing Opportunity. Member of the National Association of REALTORS&reg;.
            </p>
          </div>
          {/* max-w-xl, not max-w-md: at 1440 a 448px cap broke this 560px sentence one word
              from the end, leaving "operated." alone on its own right-aligned line with ~300px
              of empty row beside it. The wider cap lets it set on one line where there is room
              and still wraps to two balanced lines when there is not. */}
          <p className="t-small sm:max-w-xl sm:text-right">
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
              {/* The HTML site map (app/sitemap) — a person's page. Crawlers get
                  /sitemap.xml via robots.ts; a visitor clicking raw XML was round 41's
                  opening defect. */}
              <Link
                href="/sitemap"
                className="inline-flex min-h-[24px] items-center transition-colors hover:text-paper"
              >
                Site Map
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
