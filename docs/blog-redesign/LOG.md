# Blog redesign — running log

Goal: bring the /blog reading experience to the craft level of realtylt.com/ai — hovering
scroll-spy table of contents, Apple-style transitions, reading progress, refined long-form
typography, share affordance, related-posts end cap — while keeping (and improving) SEO/GEO
so assistants crawl and quote the articles. House palette only (ink / paper / mist / stone /
river navy #102c54 / porchlight azure #28a8e0). No em dashes, no arrow glyphs, no gradient
text/buttons, no AI-generic tells.

## Baseline (before)
Shots in `before/` (index + 2 real articles + 1 stub, at 1440 and 390).
- Article: single narrow column. Ink hero with breadcrumb + title + dek only (no author /
  reading time / eyebrow). Cover in body. Competent body type, but NO table of contents, NO
  reading progress, NO share, NO scroll-reveal orchestration, NO related posts. Ends on a
  grey CTA box. Reads "low-level" next to the /ai page.
- Index: dark laptop-photo hero band. Featured (image left / text right) + 3-col card grid
  (photo, date, truncated title). Clean but flat — cards carry no excerpt / reading time,
  little hover craft.
- Audit tells: pre-existing em/en dashes in some post excerpts + one title, and an em dash in
  the "DRAFT STUB —" template note (that note is template copy I own → fixed).

## Plan
1. lib/blog/toc.ts — slugify + parseHeadings + extractToc + readingTime + extractFaqs (pure, tested).
2. lib/blog/markdown.tsx — add stable heading ids (in sync with toc) + section grouping for reveal.
3. lib/blog/structured-data.ts — BlogPosting + BreadcrumbList + optional FAQPage (pure, tested).
4. components/blog/* — ArticleToc (scroll-spy rail + mobile bottom sheet), ReadingProgress,
   ShareRow, ArticleBody (sectioned reveal).
5. app/blog/[slug]/page.tsx — new hero + 2-col reading layout + enriched metadata/JSON-LD.
6. app/blog/page.tsx — index polish.
7. app/globals.css — additive blog tokens / entrance animation / prose refinements.

## After (shipped)
Shots in `after/` (1440 + 390) and close-ups in `probe/`.
- Article: ink editorial hero (breadcrumb, light title, dek, author/date/reading-time meta,
  share row) with a subtle azure glow + staged rise-in entrance. Wide cover band. Two-column
  reading layout: prose (~66ch measure) + a sticky scroll-spy Table of Contents rail. Body
  regrouped into <section> landmarks that rise into view on scroll (readable without JS,
  reduced-motion safe). Refined long-form type: lead paragraph, circled-number step lists,
  azure-square bullets, azure-rule pull quotes, azure inline links. Reading-progress bar
  (top). End cap: share divider + "Keep reading" related cards + ink "Ask us" CTA.
- Mobile: floating "On this page / <current section>" pill opens a bottom sheet of sections
  (active-dot highlight); tapping jumps + closes. Top progress bar. No horizontal overflow.
- Index: ink "The RealtyLT Journal" hero; "Latest" featured with a growing-hairline
  "Read article" affordance; "More reading" magazine cards (reading time + 2-line excerpt +
  hover title/zoom). Cohesive with the article pages.

## Verification (all against the production build on :3002)
- `npx tsc --noEmit`: clean. `npm test`: 196 pass (added toc + structured-data + updated
  markdown coverage). `npm run build`: clean, all 71 pages prerendered (the intermittent
  Windows `*.nft.json` build-trace ENOENT is environmental — unrelated IDX/_not-found route
  trace files — and passes on retry; will not occur on Vercel/Linux).
- Scroll-spy: lights all 6 sections in document order (scripts/probe-blog.mjs).
- Mobile ToC sheet: opens, jumps (heading lands ~top), closes; no overflow (probe-blog-mobile.mjs).
- Contrast AA: clean (scripts/contrast.mjs). Focus rings >=3:1: clean, 14/19/18 focusables
  (scripts/focus-blog.mjs). Reduced motion: static read, 0 hidden sections (probe-reduced-motion.mjs).
- JSON-LD valid + complete: BlogPosting (author/publisher+logo/dates/absolute image/wordCount/
  mainEntityOfPage/inLanguage) + 3-level BreadcrumbList (scripts/check-jsonld.mjs). FAQPage
  emitted only when a body has a Q&A section (unit-tested; neither real post has one).
- Metadata: per-post canonical + full OpenGraph (absolute 1200x630 image, type=article) +
  Twitter summary_large_image (scripts/check-meta.mjs).
- shoot-blog audit: both real articles + the stub fully clean at 1440 + 390 (h1=1, no console
  errors, no overflow, no tiny taps, all ToC anchors resolve). Remaining index em/en-dash
  flags are out of the repo: the featured DB post excerpt (Supabase/CRM) and one stub post's
  title en dash (mirrors the live-site page inventory).

## Not done / follow-ups
- Featured DB post ("hudson-valley-market-check-in") excerpt has an em dash — edit in the CRM.
- Stub title "...Rental vs. Buying – What Makes the Most Sense?" has an en dash (from the live
  inventory) — left as-is to avoid desyncing a real post title; owner may clean it.
- Only 2 posts carry real structure (headings) to show the ToC; the 8 seeded stubs are
  paragraph placeholders and correctly render without a ToC until the SEO writer fills them.
