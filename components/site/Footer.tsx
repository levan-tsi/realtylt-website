import Link from "next/link";
import Image from "next/image";
import { LeadForm } from "@/components/leads/LeadForm";
import { FOOTER_NAV, SITE } from "@/lib/site";

/** Shared footer matched to live realtylt.com: white bg, three columns
 * (stacked nav links / contact form / logo + REACH OUT), legal line,
 * then a black bottom bar with the legal links. */
export function Footer() {
  return (
    <footer className="border-t border-[#dddddd] bg-paper text-stone">
      <div className="mx-auto grid max-w-[1250px] gap-12 px-4 py-16 md:grid-cols-[1fr_1.6fr_1fr] md:py-20 lg:px-8">
        <nav aria-label="Footer">
          <ul className="space-y-2.5 text-sm font-light">
            {FOOTER_NAV.map((item) =>
              "external" in item && item.external ? (
                // /ai is served by an external rewrite, not an RSC route — a plain anchor
                // avoids a 404 from Next's link prefetch.
                <li key={item.href}>
                  <a href={item.href} className="text-ink-soft transition-colors hover:text-stone">
                    {item.label}
                  </a>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-soft transition-colors hover:text-stone">
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <section aria-label="Contact form">
          <LeadForm submitLabel="Send Us A Message" />
        </section>

        <div>
          <Image
            src="/logo-realtylt.png"
            alt="RealtyLT"
            width={200}
            height={41}
            className="h-auto w-44"
          />
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.14em] text-ink">Reach Out</p>
          <address className="mt-3 space-y-1 text-sm font-light not-italic">
            <p>{SITE.address.street}</p>
            <p>
              {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
            </p>
            <p>
              <a href={SITE.phoneHref} className="transition-colors hover:text-ink">
                {SITE.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-ink">
                {SITE.email}
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="mx-auto max-w-[1250px] px-4 pb-10 text-xs lg:px-8">
        <p>
          © {new Date().getFullYear()} {SITE.legalName}. {SITE.disclaimer}
        </p>
      </div>

      <div className="bg-ink text-paper/70">
        <div className="mx-auto flex max-w-[1250px] flex-col gap-2 px-4 py-4 text-xs md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <ul className="flex gap-4">
            <li>
              <Link href="/privacy-policy" className="transition-colors hover:text-paper">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/dmca-terms" className="transition-colors hover:text-paper">
                DMCA &amp; Terms of Service
              </Link>
            </li>
            <li>
              <a href="/sitemap.xml" className="transition-colors hover:text-paper">
                Sitemap
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
