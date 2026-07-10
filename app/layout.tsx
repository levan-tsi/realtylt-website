import type { Metadata } from "next";
import { Fraunces, Nunito, Spline_Sans_Mono } from "next/font/google";
import { FairHousingBar } from "@/components/site/FairHousingBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SITE } from "@/lib/site";
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
        <FairHousingBar />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
