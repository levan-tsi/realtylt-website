# Design round 41 — the Site Map becomes a page

**The defect (owner's words):** "site map is terrible looks like code there. it should be proper
site map like my page on brivity that is live realtylt.com and make it similar or better."

**What was actually happening:** the footer's "Sitemap" link pointed at `/sitemap.xml` — the
crawler file. A visitor clicking it got a wall of raw XML. The live Brivity site serves a real
HTML page at `/sitemap`: an ALL-CAPS flat list of the main pages, a Blogs list, and a
homes-by-state tree. Zero design, but it is a page a person can read. Ours has to beat it.

## What Brivity publishes (read off the live page 2026-08-26)

- H2 "Site Map", then a flat link list: INDEX, SEARCH LISTINGS, BUYING, CONNECT, five county
  searches, SELLING, FINANCING, WHO WE ARE, HOME VALUE, BLOG (~15 links, all caps, unstyled).
- A "Blogs" section: 9 post titles + ALL BLOGS.
- "Homes For Sale By State" → New York → a deep `/sitemap/NY/...` county/city tree.

## Ours: a considered index, in the site's own voice

One page at `/sitemap`, five sections, ~70 links — the complete public territory:

1. **Pages** (14) — every top-level page, each with a one-line plain-words note saying what it
   is. This is the "better than Brivity" move: their map is a link dump; ours reads like a
   guided index. Notes only here — areas, services, and posts explain themselves by name.
2. **Top Areas** (11) — grouped Hudson Valley / New York City, same order as the nav
   (south → north along the Hudson; the order is information).
3. **AI Services** (20) — registry order (flagship first), no tier labels. The /services page
   editorializes its tiers ("The three that change a week"); a map just lists.
4. **From the Blog** (every published post) — title + mono date, newest first. Placeholder
   stubs excluded, same rule as sitemap.xml.
5. **Legal & Fair Housing** (4) — Privacy, DMCA & Terms, the NY DOS Fair Housing Notice, and
   an honestly-labeled link to `/sitemap.xml` for what it is: the machine version of this page.

**Form:** the site's own reference-page language, nothing invented. Paper ground, Newsreader
display headings, mono counts, hairline `border-line` rows (the same row texture as the
/services "quiet ones" list). At `lg` a sticky left rail carries the h1, the intro, and a
jump list with per-section counts — the quiet signature: an index that counts itself. On
mobile the rail stacks on top and the jump list still works (the page is long; anchors earn
their place). No new colors, no new radii, no icons.

## Routing (the part that can bite)

- `next.config.ts` redirected `/sitemap` → `/top-areas` (legacy parity: the vendor's deep
  `/sitemap/NY/...` tree). Redirects run BEFORE the filesystem in Next, so the bare rule must
  go, and `/sitemap/:path*` must become `/sitemap/:path+` (`*` matches zero segments, i.e. it
  would swallow the bare path too). The deep tree keeps redirecting to /top-areas.
- `app/sitemap.ts` (→ /sitemap.xml, a metadata route) and `app/sitemap/page.tsx` (→ /sitemap)
  coexist; verified on the running dev server.
- Footer link: `/sitemap.xml` → `/sitemap`, label "Site Map".
- sitemap.xml gains `/sitemap` (0.3) and `/plan` — /plan was public and indexable but absent
  from the XML inventory; found while building the page's inventory.

**Tests:** `app/redirects.test.ts` updated for the new routing truth (bare /sitemap is OURS
now — asserted, so a future redirect can't silently swallow the page again). New
`app/sitemap/directory.test.ts` couples the HTML map to the XML map: every evergreen URL
sitemap.xml publishes must appear on the page, no duplicates, no dead shapes.
