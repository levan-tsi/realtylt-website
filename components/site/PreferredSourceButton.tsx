import Script from "next/script";
import { SITE } from "@/lib/site";

/** Google's "Add to Preferred Sources" button (developers.google.com/search/docs/appearance/
 * preferred-sources). One click adds realtylt.com as the reader's preferred source, which can
 * badge our pages in AI Overviews / AI Mode and weight Top Stories and Discover.
 *
 * It renders ONLY once the site serves as realtylt.com — the same launch switch that fixes
 * every canonical (clear NEXT_PUBLIC_SITE_URL, lib/site falls back to the real domain).
 * Preferred sources are DOMAIN-level: pre-launch this button would register the temporary
 * vercel.app host as the reader's preference, which helps nobody. So it ships dark and turns
 * itself on at launch with no further work. CSP: next.config.ts admits news.google.com.
 */
export function PreferredSourceButton() {
  if (SITE.url !== "https://realtylt.com") return null;
  return (
    <div className="flex items-center">
      <Script src="https://news.google.com/swg/js/v1/publisher.js" strategy="lazyOnload" />
      <div {...{ "google-add-preferred-source-btn": "", "data-theme": "dark" }} />
    </div>
  );
}
