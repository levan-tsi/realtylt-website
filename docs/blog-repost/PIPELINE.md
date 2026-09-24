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
