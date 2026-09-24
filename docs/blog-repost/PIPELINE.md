# Blog repost pipeline: one Drive draft to one live article

Started 2026-09-24 on the owner's order: repost the Brivity-era blog drafts from Google Drive, check
every fact, link the sources, bring them to the site's SEO standard, and spread the dates. This is
how one post goes through, so the next session repeats it exactly.

## 0. Where things are

- **Drafts:** Google Drive, `Blog` folder `1BvHZ53fworCeYxUx60c9HPmTVotvMxDg`. Category folders:
  Buyer `1fBgRdIR8o3MnqETlflj7lqO4gDHhSuiy` (10), Seller `1VMedGueNpVAqKRMgBPZLjFpO2sj5BrgH` (5 unique,
  the other 4 are copies of buyer drafts 1, 2, 4, 5), Investing `1zQFxoVx_jsYh7JHQuPTjQiQDbwaEg2Z8` (10),
  Homeownership `1Aa_8zs-HJPI3cignYPlkCchaXlC_0eSy` (5), Moving `1fvwfwgtYLVw_U5Gc0VrE3PCTkNChfDaX` (5).
  Read with the Drive MCP `read_file_content` by file id. Each draft ends with the Gemini prompt that
  wrote it (role, keywords, a `Slug:` and a meta title): the keywords and the slug are useful, the
  prompt itself is never published.
- **Bodies:** `content/blog/real-estate-posts.ts`, one exported markdown constant per article, in the
  subset `lib/blog/markdown.tsx` renders (no tables: use lists).
- **Entries:** `content/blog/posts.ts` (`POSTS`). A reposted article REPLACES its seeded stub where
  one exists (`placeholder: false`, `body: []`, `markdown: ...`).
- **Old URLs:** `aliases` on the entry. `app/blog/[slug]/page.tsx` answers an alias with a 308 to
  the live slug. `lib/blog/aliases.test.ts` holds the 34 slugs the CRM's drip emails link, with a
  `PENDING_CRM` list that may only shrink.

## 1. Read and decide the slug

1. Read the draft. Note the draft's own `Slug:` line and its keyword list.
2. Slug rule, in order: the CRM drip slug if the article is on the CRM list (the emails then hit it
   with no redirect); else the seeded stub's slug if one exists; else a short keyword slug. Every
   other known old slug (the draft's own, the stub's, the drip doc's alternates) goes in `aliases`.

## 2. Check every claim

For each factual sentence: find the current public source, prefer government (HUD, CFPB, FHFA,
Fannie Mae, Freddie Mac, NY DOS, NY AG, NYS Tax, NYS DOH, NYS HCR/SONYMA, NYC HPD, county sites) or a
reputable body (NAR, NYSBA). Then one of three things:

- **kept**, with an inline link to the source;
- **corrected** to what the source says today, with the year in the sentence ("as of 2026");
- **removed**, if no reputable source says it. A claim with no source does not ship.

Year-bound numbers (limits, rates, fees, program caps, tax brackets) are updated to 2026 and
dated. Record what changed in the commit message. Known traps found so far:

- Drafts from September 2025 predate Fannie Mae's removal of the hard 620 score floor for DU loans
  (November 2025) and say "620 minimum".
- Drafts say the buyer's agent is "paid by the seller". Since August 17, 2024 a written buyer
  agreement states the compensation and says it is negotiable (NAR settlement).
- Drafts call the NY real estate attorney "legally required". It is standard practice, not a
  statute; cite NYSBA.
- NYC HomeFirst is now 120% AMI (was 80%), with 3% of the price from the buyer's own funds.
- SONYMA DPAL raises the first-mortgage rate by 0.40%; say so next to the benefit.

## 3. Rewrite in the house voice

Plain, professional, no hype, first person where it is Levan's own experience. No em dashes, no
arrow glyphs, no "99% of buyers" style claims, no old phone numbers or signatures (the page has its
own contact block). Keep the owner's personal stories: they are first-hand and his to tell.

## 4. SEO shape (the /ai page standard, applied to an article)

- `seoTitle` (the `<title>`): the primary keyword, 60 characters or fewer, and at least three of the
  slug's words (scripts/seo-audit.mjs enforces this).
- `seoDescription`: 140 to 160 characters, keyword first, says what the reader gets.
- `title` (the H1): the draft's headline, kept, since it already carries the keyword.
- First paragraph and at least two `##` subheads carry the primary keyword naturally.
- A `## Frequently asked questions` section with `### question` headings and plain answers: the page
  emits FAQPage JSON-LD from it automatically (`lib/blog/toc.ts`). BlogPosting and BreadcrumbList
  are automatic.
- Internal links: `/buying`, `/financing`, `/search` or `/selling`, `/home-value` as they fit, and at
  least two related posts by their LIVE slug (never an alias).
- A `## Sources` list at the end, and a closing line with the date the figures were checked.
- `cluster`: buying, selling, investing, owning or moving (drives "Keep reading").
- `cover`: a photo already in `public/images/` with a recorded licence in
  `public/images/ATTRIBUTIONS.md`. No new unlicensed or vendor-CDN images.

## 5. Dates

`date` = the post's original publish date where one is known (the seeded stubs carried the old
site's dates), otherwise a date spread across September 2025 to August 2026 at irregular intervals,
never earlier than the draft was written (the drafts are dated 2025-09-04 to 2025-09-13), with the
evergreen guides oldest. `updated` = 2026-09-24, the day the text was re-verified; it drives JSON-LD
`dateModified`. Every date and its reason is in docs/handoff/BLOG-REPOST-URLS-2026-09-24.md.

## 6. Gates, per post

1. `npx tsc --noEmit` and `npx vitest run lib/blog app/blog app/sitemap`.
2. Render on the worktree's own dev server:
   `node scripts/_scratch-blog/shoot.mjs <slug>` (1440 and 390; blocks /api/media and /api/lead;
   reports overflow, h1 count, heading skips, JSON-LD types, em dashes, arrows). Look at the frames.
3. `BASE=http://127.0.0.1:3104 node scripts/seo-audit.mjs --only /blog/<slug> --external`.
   403s from hcr.ny.gov and fanniemae.com are bot walls, not dead links (each was opened by hand).
4. `curl -I` an alias: expect 308 to the live slug.
5. Commit that post alone with explicit pathspecs; the message lists the sources it cites.

## 7. SEO check, all 35 posts (measured 2026-09-24)

Measured on the rendered pages from the dev server on :3104 (`scripts/_scratch-blog/seo-table.mjs`, a scratch file, not committed): the `<title>` and meta description, the H1 count, the canonical link, JSON-LD types, and whether the slug appears in `/sitemap.xml` and `/llms.txt`. H2 and FAQ counts, source links and internal links come from the markdown. "Sources" counts the unique links in the `## Sources` section; more links are cited inline. All 35 pass: SEO titles are 60 characters or fewer, descriptions are 148 to 160 characters (the committed scorer `lib/blog/repost-seo.test.ts` requires 140 to 160), each page has exactly one H1, the canonical points to itself, the page emits BlogPosting, BreadcrumbList and FAQPage JSON-LD, and the slug is in both the sitemap and llms.txt.

Image alt text: each page has seven images, all with an `alt` attribute. The logo images carry "RealtyLT". The cover and the three "Keep reading" card photos use `alt=""` because the post template treats them as decorative, and the H1 and card titles beside them carry the meaning. This is the template's existing behaviour, left unchanged because the flagship template is out of scope.

`seo-audit.mjs --only /blog/<slug> --external` was run on each post as it landed, and all were clean. The only non-200 outbound responses were 403s from bot walls: hcr.ny.gov, fanniemae.com, jlconline.com, dos.ny.gov, dmv.ny.gov, dec.ny.gov, fmcsa.dot.gov, governor.ny.gov, mta.info, broadbandmap.fcc.gov and health.ny.gov. Most of those pages were read directly, through a fetch that gets past the wall, and checked for what they are cited for. Five were not read directly:
- **fmcsa.dot.gov/protect-your-move** and **broadbandmap.fcc.gov/home** are cited only as the official places to look something up, not for a figure.
- **jlconline.com's 2025 Cost vs. Value page** blocked every fetch. The basement figures ($52,012, $36,905, 71%) are the ones several independent secondary sources quote from it, and they are internally consistent (36,905 / 52,012 = 71.0%). This is unverified against the primary page.
- **dmv.ny.gov** (the 10-day address change and the 30-day licence exchange) was confirmed through DMV search snippets and several consistent secondary sources, not a page read.
- **health.ny.gov/environmental/radon** is cited as a general resource. The radon figures come from EPA and Putnam County, both of which were read.

| Slug | SEO title (chars) | Description chars | H1 | H2s | FAQs (schema) | Sources | Internal /blog links | Canonical | BlogPosting + Breadcrumb | Sitemap | llms.txt |
|---|---|---|---|---|---|---|---|---|---|---|---|
| why-you-need-real-estate-attorney-ny | Why You Need a Real Estate Attorney in NY, and What They Do (59) | 151 | 1 | 10 | 5 (yes) | 3 | 3 | self | yes | yes | yes |
| first-time-home-buyer-ny-10-step-checklist | First-Time Home Buyer NY Checklist: 10 Steps for 2026 (53) | 156 | 1 | 14 | 5 (yes) | 16 | 7 | self | yes | yes | yes |
| down-payment-hudson-valley-ny | Down Payment in the Hudson Valley, NY: What You Need in 2026 (60) | 158 | 1 | 8 | 5 (yes) | 14 | 4 | self | yes | yes | yes |
| fha-va-conventional-mortgage-loans-ny | FHA vs VA vs Conventional Loans in NY: A 2026 Guide (51) | 155 | 1 | 8 | 5 (yes) | 11 | 4 | self | yes | yes | yes |
| buyer-closing-costs-new-york | Buyer Closing Costs in New York: A 2026 Breakdown (49) | 154 | 1 | 8 | 5 (yes) | 11 | 3 | self | yes | yes | yes |
| mortgage-pre-approval-requirements-ny | Mortgage Pre-Approval Requirements in NY: A 2026 Guide (54) | 153 | 1 | 7 | 5 (yes) | 10 | 5 | self | yes | yes | yes |
| how-much-house-can-i-afford-ny-guide | How Much House Can I Afford in NY? A 2026 Budget Guide (54) | 153 | 1 | 7 | 5 (yes) | 4 | 4 | self | yes | yes | yes |
| home-inspection-checklist-hudson-valley-ny | Home Inspection Checklist for Hudson Valley, NY Buyers (54) | 156 | 1 | 7 | 5 (yes) | 9 | 3 | self | yes | yes | yes |
| winning-offer-competitive-market-ny-hudson-valley | How to Make a Winning Offer in a Competitive NY Market (54) | 154 | 1 | 6 | 5 (yes) | 4 | 5 | self | yes | yes | yes |
| final-walk-through-checklist | Final Walk-Through Checklist Before Closing in New York (55) | 149 | 1 | 7 | 5 (yes) | 3 | 3 | self | yes | yes | yes |
| seller-disclosure-requirements-new-york | Seller Disclosure Requirements in New York: 2026 Guide (54) | 157 | 1 | 7 | 5 (yes) | 6 | 3 | self | yes | yes | yes |
| common-home-seller-mistakes-hudson-valley | Common Home Seller Mistakes in the Hudson Valley, NY (52) | 156 | 1 | 9 | 5 (yes) | 5 | 4 | self | yes | yes | yes |
| timeline-selling-a-house-ny | Timeline for Selling a House in NY, from Listing to Closing (59) | 159 | 1 | 9 | 5 (yes) | 4 | 4 | self | yes | yes | yes |
| seller-guide-prepare-home-inspection | Seller's Guide to Prepare for a Home Inspection in NY (53) | 157 | 1 | 8 | 5 (yes) | 6 | 3 | self | yes | yes | yes |
| fsbo-vs-agent-new-york-guide | FSBO vs Agent in New York: The Pros and Cons in 2026 (52) | 156 | 1 | 8 | 5 (yes) | 5 | 4 | self | yes | yes | yes |
| how-to-buy-your-first-rental-property-in-the-hudson-valley | How to Buy Your First Rental Property in the Hudson Valley (58) | 160 | 1 | 9 | 5 (yes) | 8 | 6 | self | yes | yes | yes |
| house-hacking-hudson-valley-ny | House Hacking in the Hudson Valley, NY: A 2026 Guide (52) | 153 | 1 | 9 | 5 (yes) | 7 | 5 | self | yes | yes | yes |
| calculate-roi-cap-rate-investment-property-ny | How to Calculate ROI and Cap Rate on NY Investment Property (59) | 155 | 1 | 7 | 5 (yes) | 4 | 2 | self | yes | yes | yes |
| multi-family-vs-single-family-investing-ny | Multi-Family vs Single-Family Investing in NY: Pros and Cons (60) | 153 | 1 | 7 | 5 (yes) | 4 | 3 | self | yes | yes | yes |
| 1031-exchange-rules-new-york | 1031 Exchange Rules in New York: A 2026 Investor Guide (54) | 156 | 1 | 7 | 5 (yes) | 6 | 2 | self | yes | yes | yes |
| brrrr-method-hudson-valley | BRRRR Method in the Hudson Valley, NY: 2026 Guide (49) | 151 | 1 | 7 | 5 (yes) | 3 | 3 | self | yes | yes | yes |
| how-to-find-screen-tenants-ny | How to Find and Screen Tenants in New York: A 2026 Guide (56) | 151 | 1 | 9 | 5 (yes) | 9 | 2 | self | yes | yes | yes |
| best-places-to-invest-hudson-valley | Best Places to Invest in Real Estate in the Hudson Valley (57) | 154 | 1 | 10 | 5 (yes) | 6 | 2 | self | yes | yes | yes |
| short-term-vs-long-term-rentals-hudson-valley | Short-Term vs Long-Term Rentals in the Hudson Valley (52) | 156 | 1 | 8 | 5 (yes) | 7 | 2 | self | yes | yes | yes |
| hiring-property-management-company-hudson-valley | Hiring a Property Management Company in the Hudson Valley (57) | 149 | 1 | 8 | 5 (yes) | 5 | 3 | self | yes | yes | yes |
| cost-vs-value-finishing-basement-hudson-valley | Finishing a Basement in the Hudson Valley: Cost and Value (57) | 152 | 1 | 7 | 5 (yes) | 6 | 3 | self | yes | yes | yes |
| new-homeowner-toolkit-essentials | The New Homeowner Toolkit: 9 Essentials Every Owner Needs (57) | 152 | 1 | 7 | 4 (yes) | 4 | 2 | self | yes | yes | yes |
| seasonal-home-maintenance-checklist-hudson-valley | Seasonal Home Maintenance Checklist for Hudson Valley Homes (59) | 150 | 1 | 8 | 5 (yes) | 6 | 3 | self | yes | yes | yes |
| lower-energy-bills-new-york-homeowners | Lower Energy Bills in New York: 9 Tips for Homeowners (53) | 157 | 1 | 6 | 5 (yes) | 10 | 4 | self | yes | yes | yes |
| high-roi-home-improvements-under-1000 | 9 High-ROI Home Improvements Under $1,000 in New York (53) | 148 | 1 | 12 | 5 (yes) | 3 | 2 | self | yes | yes | yes |
| relocating-to-hudson-valley-ny-guide | Relocating to the Hudson Valley: A Newcomer's Guide (51) | 159 | 1 | 7 | 5 (yes) | 5 | 4 | self | yes | yes | yes |
| ultimate-8-week-moving-checklist | The Ultimate 8-Week Moving Checklist: A Stress-Free Plan (56) | 155 | 1 | 11 | 5 (yes) | 8 | 4 | self | yes | yes | yes |
| how-to-hire-local-movers-ny | How to Hire Local Movers in NY: 7 Questions to Ask (50) | 155 | 1 | 5 | 5 (yes) | 5 | 3 | self | yes | yes | yes |
| rent-vs-buy-hudson-valley-ny | Rent vs. Buy in the Hudson Valley, NY: How to Decide (52) | 158 | 1 | 7 | 5 (yes) | 7 | 4 | self | yes | yes | yes |
| packing-tips-hacks-for-moving | Packing Tips for Moving: 10 Hacks for a Faster Move (51) | 157 | 1 | 7 | 5 (yes) | 3 | 3 | self | yes | yes | yes |
