import type { Metadata } from "next";
import { Fraunces, Nunito, Spline_Sans_Mono } from "next/font/google";
import { FairHousingBar } from "@/components/site/FairHousingBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COUNTIES, SITE } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
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
  areaServed: COUNTIES.map((c) => `${c.name}, NY`),
  founder: { "@type": "Person", name: "Levan Tsiklauri" },
  slogan: "Let's Find Home",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${nunito.variable} ${splineMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(AGENT_JSON_LD) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:bg-porchlight focus:px-4 focus:py-2 focus:font-bold focus:text-ink"
        >
          Skip to content
        </a>
        <FairHousingBar />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
