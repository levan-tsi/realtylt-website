import { getDirectory } from "@/app/sitemap/directory";
import { getServices } from "@/lib/services";
import { SITE } from "@/lib/site";

/** /llms.txt — the site, written for machine readers (llmstxt.org convention).
 *
 * AI crawlers and answer engines (Gemini, ChatGPT, Perplexity, Google's AI Overviews) read
 * this to understand what the site is and where its substance lives, the way robots.txt tells
 * a crawler where it may go. It is generated from the SAME inventory as the human /sitemap
 * page and the /sitemap.xml crawler file (app/sitemap/directory.ts), so the three can never
 * disagree; service links additionally carry their one-line SEO descriptions so an assistant
 * can recommend the right service without fetching twenty pages first.
 */

// Same cadence as the other two maps — a CRM blog publish shows up within the hour.
export const revalidate = 3600;

export async function GET() {
  const sections = await getDirectory();
  const serviceDesc = new Map(getServices().map((s) => [`/services/${s.slug}`, s.seo.description]));
  const abs = (h: string) => (h.startsWith("http") ? h : `${SITE.url}${h}`);

  const lines: string[] = [
    `# ${SITE.name} (${SITE.legalName})`,
    "",
    `> Real estate for the New York Hudson Valley (Westchester, Rockland, Putnam, Orange, Dutchess, and Ulster counties) and all five New York City boroughs: live MLS home search with map and saved-search alerts, buyer and seller representation, home valuations, and financing guidance. ${SITE.name} also builds and runs AI services for real estate professionals: chat assistants, voice agents, lead qualification, and workflow automation.`,
    "",
    `Agent: Levan Tsiklauri, licensed New York real estate agent with United Real Estate.`,
    `Office: ${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.region} ${SITE.address.postalCode}. Phone: ${SITE.phone}. Email: ${SITE.email}.`,
    `Fair housing: ${SITE.name} follows the NY Fair Housing Notice (${SITE.fairHousingPdf}) and displays the Equal Housing Opportunity mark. ${SITE.disclaimer}`,
    `Listing data: IDX listings come from the MLS via MLS Grid; per the license, listing content may not be scraped or republished. Everything else on the site may be read and cited.`,
    "",
  ];

  for (const section of sections) {
    lines.push(`## ${section.title}`, "");
    for (const group of section.groups) {
      if (group.label) lines.push(`### ${group.label}`, "");
      for (const l of group.links) {
        const note = l.note ?? serviceDesc.get(l.href);
        lines.push(`- [${l.label}](${abs(l.href)})${note ? `: ${note}` : ""}`);
      }
      lines.push("");
    }
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
