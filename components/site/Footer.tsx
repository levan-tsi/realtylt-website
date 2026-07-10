import Link from "next/link";
import { LeadForm } from "@/components/leads/LeadForm";
import { ValleyDivider } from "@/components/valley-line/ValleyLine";
import { FOOTER_NAV, SITE } from "@/lib/site";

/** Shared footer: nav, contact form (every page — brief §7), REACH OUT block, legal row. */
export function Footer() {
  return (
    <footer className="bg-ink text-paper/80">
      <ValleyDivider dark className="pt-10" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:grid-cols-[1fr_1.6fr_1fr] lg:px-8">
        <nav aria-label="Footer">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-paper/50">Explore</p>
          <ul className="space-y-2 text-sm">
            {FOOTER_NAV.map((item) =>
              "external" in item && item.external ? (
                // /ai is served by an external rewrite, not an RSC route — a plain anchor
                // avoids a 404 from Next's link prefetch.
                <li key={item.href}>
                  <a href={item.href} className="hover:text-porchlight transition-colors">
                    {item.label}
                  </a>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-porchlight transition-colors">
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <section aria-label="Contact form">
          <p className="mb-4 font-sans text-lg font-bold tracking-widest text-paper">
            SEND US A MESSAGE
          </p>
          <LeadForm dark compact submitLabel="Send Message" />
        </section>

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
