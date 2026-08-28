import type { Metadata } from "next";
import Script from "next/script";
import { Lato, Newsreader } from "next/font/google";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Providers } from "@/components/auth/Providers";
import { PostHogInit } from "@/components/site/PostHogInit";
import { QualifyingWizardProvider } from "@/components/leads/QualifyingWizard";
import { SERVED_AREAS, SITE } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonld";
import "./globals.css";

// Lato carries every body paragraph, form control, nav item, button and table on the site.
// Weights: 300 (light), 400 (body), 700 (nav/bold). Unchanged — the product surfaces should
// not shift under anyone's muscle memory.
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

// Display face, headlines only (see docs/parity/DESIGN-ROUND11.md §"which face, and why").
// A site whose display and body face are the same face has no typographic point of view;
// Lato was inherited from the old vendor theme rather than chosen. Newsreader is
// modern-classical rather than fashion-classical, holds a 200 beautifully at hero sizes, and
// keeps a 600 so the site's existing signature — light next to bold inside one headline —
// survives and gets more expressive. Variable font, so the weight range is a single file.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
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
    "Hudson Valley and NYC real estate with RealtyLT. Search homes across six counties and all five boroughs, get your home value, or a cash offer in 24 hours.",
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-realtylt.png", width: 1200, height: 630, alt: "RealtyLT. Let's Find Home. Hudson Valley and New York City real estate." }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-realtylt.png"],
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
  // The actual logo mark, not the 1200x630 share card — Google's logo guidance wants the
  // brand image itself here; og-realtylt.png stays the social preview.
  logo: `${SITE.url}/logo-realtylt.png`,
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
    <html lang="en" className={`${lato.variable} ${newsreader.variable}`}>
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
          {/* Wraps main + footer so a successful lead submit from either the hero form or the
              footer form can open the qualifying wizard. The wizard only ever shows on /selling. */}
          <QualifyingWizardProvider>
            <main id="main">{children}</main>
            <Footer />
          </QualifyingWizardProvider>
        </Providers>
        {/* PostHog: cookieless, proxied through /relay-ph, replay masked. GA below stays —
            it feeds the owner's Ads conversions; two tools, two jobs. */}
        <PostHogInit />
        {/* The SAME chat widget the live site injects via BlueRoof custom code —
            extracted byte-exact from realtylt.com (self-contained, talks to the n8n
            agent webhook). Keeping it a static file means updates are a re-extract. */}
        <Script src="/rlt-chat.js" strategy="afterInteractive" />
        {/* Google Ads tag — mirrors the live site's custom-code include so conversion
            tracking survives the migration. gtagSendEvent matches the live helper. */}
        <Script id="gtag-helper" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-11479042629');
          function gtagSendEvent(url) {
            var callback = function () {
              if (typeof url === 'string') { window.location = url; }
            };
            gtag('event', 'conversion_event_submit_lead_form', {
              'event_callback': callback,
              'event_timeout': 2000,
            });
            return false;
          }
        `}</Script>
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-11479042629" strategy="afterInteractive" />
      </body>
    </html>
  );
}
