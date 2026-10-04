import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Round 63 (the owner, 2026-09-26: the ALL CAPS labels and the Title Case headings, "fix those, and
 * any we missed"). Every page is `.nocturne` (app/layout.tsx), where no label is set in capitals and
 * headings and buttons read in sentence case. Page <title>s and the machine-readable directory
 * (llms.txt) keep their names. Checked on the source: a class or a string that drifts back fails
 * nothing else.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const read = (f: string) => fs.readFileSync(path.join(ROOT, f), "utf8");

describe("sentence case, site-wide", () => {
  it("sets no label in capitals on the night site, and drops the capitals' tracking with them", () => {
    const css = read("app/globals.css").replace(/\s+/g, " ");
    expect(css).toContain(".nocturne .uppercase { text-transform: none; }");
    expect(css).toContain('.nocturne .uppercase:not([class*="night:tracking"]) { letter-spacing: normal; }');
    expect(read("app/layout.tsx")).toMatch(/className=\{`[^`]*\bnocturne\b/);
  });

  it("prints the county chips by name, not in the nav's stored capitals", () => {
    const page = read("app/who-we-are/page.tsx");
    expect(page).toContain("{areaName(item.label)}");
    expect(page).not.toMatch(/text-\[11px\] font-bold uppercase tracking-\[0\.14em\]/);
  });

  it("writes the headings and buttons in sentence case", () => {
    const gone: Record<string, string[]> = {
      "app/buying/page.tsx": [">The Home Buying Process<", ">Your Saved Homes<", ">Book Your Free Consultation<"],
      "app/selling/page.tsx": ["Choose the Path That", 'title="Fast Cash Offer"', 'cta="Get Your Free Cash Offer"', "Stay in the Loop"],
      "app/financing/page.tsx": [">Demystifying Home Loans<", ">See The Full Buying Process<", "Loan Pre-Approval Letter"],
      "app/home-value/page.tsx": [">A Valuation You Can Actually Act On<"],
      "app/top-areas/page.tsx": [">Where Do You See Yourself?<", ">The Five Boroughs<"],
      "app/top-areas/[county]/page.tsx": [">Talk To A Local Agent<", ">Homes for Sale in {short}<"],
      "app/reviews/page.tsx": ["Read All Reviews On Google", ">In Their Words<"],
    };
    // Round 65 (E), the ones the scan still found (scripts/_scratch-r65/polish/case-scan.mjs).
    Object.assign(gone, {
      "app/saved/page.tsx": ["<strong>Homes &amp; Searches</strong>"],
      "app/who-we-are/page.tsx": ["Who <strong>We Are</strong>"],
      "app/thank-you/page.tsx": ["Browse Homes"],
    });
    gone["app/buying/page.tsx"].push("Start Your <strong>", "<strong>Listing Alerts<", "<strong>See Listings<", "Making An <strong>");
    gone["app/selling/page.tsx"].push("<strong>Pricing Strategy<", "Making Your Listing", "<strong>Internet Marketing<");
    gone["app/financing/page.tsx"].push("Find The Right");
    Object.assign(gone, {
      "components/leads/ConnectFormModal.tsx": ['"Send Message"'],
      "components/leads/LeadForm.tsx": ['"Send Message"'],
      "components/leads/ListingLeadCTAs.tsx": ['"Submit Offer"'],
      "components/leads/QualifyingWizard.tsx": ["Request My Call"],
      "components/search/SavedClient.tsx": ['"Turn On Alerts"'],
      "components/auth/AccountMenu.tsx": ["Sign Out"],
      "components/listing/MarketInsights.tsx": [">Market Insights<", '"Current Listings"', '"Average Price"'],
    });
    gone["app/top-areas/page.tsx"].push("Talk It Through With Us");
    gone["app/buying/page.tsx"].push(">Save a Search<", ">Start Searching<");
    gone["app/reviews/page.tsx"].push("What Our <strong>");
    // Round 66 (builder 3), the two-word ones round 65's scan could not see (it flagged two or more
    // capitalised words after the first; scripts/_scratch-r66/final/case-scan.mjs flags one).
    gone["app/top-areas/page.tsx"].push("Top <strong>Areas</strong>");
    gone["app/financing/page.tsx"].push("Get <strong>Pre-Approval</strong>", "Application &amp; <strong>Processing</strong>");
    Object.assign(gone, {
      "app/sitemap/page.tsx": ["Site <strong>Map</strong>"],
      "app/search/page.tsx": ["Search Listings:"],
      "components/services/ServiceHero.tsx": ["AI Services\n"],
      "app/services/page.tsx": ['<span className="text-paper/80">AI Services</span>'],
      "components/listing/ListingSubNav.tsx": ['label: "Market Insights"', "Make an </span>Offer"],
    });
    gone["components/leads/ListingLeadCTAs.tsx"].push("Request a Tour\n");
    for (const [file, strings] of Object.entries(gone)) for (const s of strings) expect(read(file), `${file}: ${s}`).not.toContain(s);
    // The site map prints the page names as the header and footer do (the directory keeps its own).
    expect(read("app/sitemap/page.tsx")).toContain('plain={section.id === "pages"}');
    expect(read("components/listing/ListingSubNav.tsx")).toContain(">Make an offer<");
    expect(read("app/buying/page.tsx")).toContain(">The home buying process<");
    expect(read("app/reviews/page.tsx")).toContain("Read all reviews on Google");
  });

  it("keeps the page titles as they are (they are not headings)", () => {
    expect(read("app/reviews/page.tsx")).toContain('title: "Reviews | What Our Clients Say"');
    expect(read("app/home-value/page.tsx")).toContain('title: "Home Value | How Much Is Your Home Really Worth?"');
  });
});
