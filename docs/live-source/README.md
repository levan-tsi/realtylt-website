# Live-site BlueRoof 360 custom-code reference (owner-pasted)

The owner pastes each live page's sitebuilder Custom Code panel here (2026-07-24 onward).
This is the SOURCE OF TRUTH for parity work — exact markup, assets, copy, and behavior of
realtylt.com, including popup/handler code that outside-in scraping can miss.

Rules when reconciling (owner-directed):
- Match structure/copy/assets, BUT strip every Brivity/BlueRoof sign (names, product
  screenshots, "Powered by" lines) and replace with our own equivalents.
- Improve where improvement is clear (anti-slop rules override live's arrow glyphs and
  inline-style soup; our React/Next implementations replace their inline <script> hacks).
- Their inline scripts (parsers, tracking) are BEHAVIOR SPECS, not code to copy.

Files: one per page, verbatim as pasted (owner may paste in parts).
- home.html — hero video section + contact-3 form + featured-listings heading + why-carousel
- buying.html — hero CTA section (rest of the page is Brivity-native theme sections)
- selling.html — hero + dual-path/reviews + pricing + shine + marketing + stay-in-loop
- search: custom code is only a map placeholder image (Brivity injects the real app) — nothing to copy.
