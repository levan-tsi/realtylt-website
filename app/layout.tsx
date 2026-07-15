import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Providers } from "@/components/auth/Providers";
import { SERVED_AREAS, SITE } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonld";
import "./globals.css";

// Live realtylt.com renders Lato everywhere (computed: "Lato, Helvetica, Arial, sans-serif").
// Weights on live: 300 (light headings/footer), 400 (body), 700 (nav/bold headings).
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  // "./" resolves per-route against metadataBase — self-canonical on every page.
  // Pages that set their own alternates (county pages) override this.
  alternates: { canonical: "./" },
  title: {
    default: `${SITE.name} | ${SITE.legalName}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Hudson Valley real estate with RealtyLT — search homes across Dutchess, Westchester, Putnam, Rockland, Ulster and Orange counties, get your home value, or a cash offer in 24 hours.",
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RealtyLT — Let's find home. Hudson Valley real estate." }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

/** Site-wide schema.org — RealEstateAgent (brief §8 / ARCHITECTURE.md SEO). */
const AGENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: SITE.legalName,
  alternateName: SITE.name,
  url: SITE.url,
  telephone: SITE.phoneE164,
  email: SITE.email,
  logo: `${SITE.url}/og.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: "US",
  },
  areaServed: SERVED_AREAS.map((c) => `${c.name}, NY`),
  founder: { "@type": "Person", name: "Levan Tsiklauri" },
  slogan: "Let's Find Home",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={lato.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(AGENT_JSON_LD) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:font-bold focus:text-paper"
        >
          Skip to content
        </a>
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
