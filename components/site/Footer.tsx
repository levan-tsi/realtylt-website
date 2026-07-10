import Link from "next/link";
import { FOOTER_NAV, SITE } from "@/lib/site";

/** Shared footer: nav, REACH OUT block, legal row (brief §7).
 * The footer contact form (LeadForm) is added in Phase B. */
export function Footer() {
  return (
    <footer className="bg-ink text-paper/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 lg:px-8">
        <nav aria-label="Footer">
          <ul className="space-y-2 text-sm">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-porchlight transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer contact form slot — LeadForm lands here in Phase B */}
        <div data-slot="footer-lead-form" />

        <div>
          <p className="font-sans text-lg font-bold tracking-widest text-paper">
            REACH OUT
          </p>
          <address className="mt-4 space-y-1 text-sm not-italic">
            <p>{SITE.address.street}</p>
            <p>
              {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
            </p>
            <p>
              <a href={SITE.phoneHref} className="hover:text-porchlight transition-colors">
                {SITE.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${SITE.email}`} className="hover:text-porchlight transition-colors">
                {SITE.email}
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-paper/60 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. {SITE.disclaimer}
          </p>
          <ul className="flex gap-4">
            <li>
              <Link href="/privacy-policy" className="hover:text-porchlight transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/dmca-terms" className="hover:text-porchlight transition-colors">
                DMCA &amp; Terms of Service
              </Link>
            </li>
            <li>
              <a href="/sitemap.xml" className="hover:text-porchlight transition-colors">
                Sitemap
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
