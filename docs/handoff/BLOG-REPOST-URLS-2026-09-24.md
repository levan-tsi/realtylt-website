# Blog repost: every URL, 2026-09-24

The 35 Brivity-era drafts from the owner's Google Drive are reposted on branch
`content/blog-repost-0924` (worktree `C:\Users\Levan\realtylt-website-blog`, NOT pushed): 10 buyer, 5
seller, 10 investing, 5 homeownership and 5 moving. Every claim was checked against a cited source,
corrected, or removed. Each post was committed separately, and its commit message lists its sources and
corrections. How the work was done: `docs/blog-repost/PIPELINE.md`.

## The CRM drip links (34 slugs)

These are the links the CRM's Sell 24 plan has been emailing since 2025. On 2026-09-22 all 34 returned
"Post not found" (`docs/handoff/BRIVITY-DEAD-BLOG-LINKS-2026-09-22.md` in the r53 worktree).

- **29 now answer 200.** Each reposted article's live slug IS its CRM slug, so there is no redirect hop.
  I checked all 34 against the dev server on port 3104: 29 return 200 and 5 return 404.
- **5 remain unresolved, because the Drive has no draft for them.** They are listed honestly in
  `PENDING_CRM` in `lib/blog/aliases.test.ts`, and the test fails if one starts resolving without
  being taken off the list:
  - `when-to-sell-house-hudson-valley`: no draft.
  - `how-to-price-home-hudson-valley`: no draft.
  - `home-staging-tips-highest-roi`: no draft.
  - `seller-closing-costs-new-york-state-guide`: no draft.
  - `high-roi-renovations-new-york`: only an AI Studio prompt exists (the "top 5 renovations" topic).
    The old placeholder `top-5-renovations-increase-home-value-ny` is still a noindex stub.

  Fixing these means writing five new articles. The fix is not a redirect, because no page covers
  those topics.

## Dating rule

- `updated` is 2026-09-24 on every post, the day its facts were re-verified. It drives JSON-LD
  `dateModified`.
- `date` is not the same for every post:
  - Where the old site's stub carried a date, the post keeps it. Every stub was dated 2025-09-12 or
    2025-09-13, and dates must be unique, so only the basement post (2025-09-12) and the relocation
    guide (2025-09-13) keep one.
  - All other posts are spread at irregular intervals from 2025-09-17 to 2026-08-12. None is earlier
    than the drafts, which were written 2025-09-04 to 2025-09-13. The evergreen guides are the oldest:
    the seasonal checklist, first rental, the basement, the toolkit, the 8-week checklist and the
    relocation guide.
- `lib/blog/repost-seo.test.ts` fails if two reposted posts share a date, or if any date falls after
  2026-09-24.

## Every post

The "Old slugs" column lists the slugs that answer with a 308 to the live path: the old site's stub
slugs, the drafts' alternate slugs and the title-slugs used in the drafts' internal-link notes. The
live path is always `https://www.realtylt.com` plus the path shown.

| Folder | Title (H1) | Live path | Date | Why this date | Old slugs that 308 here |
|---|---|---|---|---|---|
| Buyer | Why You Need a Real Estate Attorney in New York (And What They Do) | /blog/why-you-need-real-estate-attorney-ny | 2025-10-02 | no original date known; spread | none (the live slug is the CRM slug) |
| Buyer | First-Time Home Buyer in NY? Here's Your 10-Step Checklist from Start to Finish | /blog/first-time-home-buyer-ny-10-step-checklist | 2025-10-24 | no original date known; spread | `first-time-home-buyer-checklist-ny` |
| Buyer | How Much Do You Really Need for a Down Payment in the Hudson Valley, NY? | /blog/down-payment-hudson-valley-ny | 2025-11-06 | no original date known; spread | none (the live slug is the CRM slug) |
| Buyer | Understanding Different Mortgages: FHA, VA, and Conventional Loans Explained | /blog/fha-va-conventional-mortgage-loans-ny | 2025-11-20 | no original date known; spread | `understanding-mortgages-fha-va-conventional` |
| Buyer | What Are Buyer's Closing Costs in New York? A Complete, No-Surprise Breakdown | /blog/buyer-closing-costs-new-york | 2025-12-03 | no original date known; spread | none (the live slug is the CRM slug) |
| Buyer | Getting Pre-Approved for a Mortgage: What Lenders Are Looking For | /blog/mortgage-pre-approval-requirements-ny | 2026-01-14 | no original date known; spread | none (the live slug is the CRM slug) |
| Buyer | "How Much House Can I Afford?" A Simple Guide to Calculating Your Real Budget | /blog/how-much-house-can-i-afford-ny-guide | 2026-01-29 | no original date known; spread | `how-much-house-can-i-afford` |
| Buyer | The Ultimate Home Inspection Checklist: 9 Critical Things You Can't Overlook | /blog/home-inspection-checklist-hudson-valley-ny | 2026-02-19 | no original date known; spread | `home-inspection-checklist-ny` |
| Buyer | How to Make a Winning Offer in the NY Hudson Valley's Competitive Market | /blog/winning-offer-competitive-market-ny-hudson-valley | 2026-04-08 | no original date known; spread | `how-to-make-winning-offer-ny`, `how-to-make-a-winning-offer-in-the-ny-hudson-valleys-competitive-market` |
| Buyer | The Final Walk-Through: Your Last Chance Checklist Before Closing | /blog/final-walk-through-checklist | 2026-05-21 | no original date known; spread | `final-walk-through-checklist-before-closing` |
| Seller | Seller Disclosures in New York: What You Are Legally Required to Reveal | /blog/seller-disclosure-requirements-new-york | 2025-12-17 | no original date known; spread | `seller-disclosures-in-new-york` |
| Seller | Common Mistakes Hudson Valley Home Sellers Make (And How to Avoid Them) | /blog/common-home-seller-mistakes-hudson-valley | 2026-02-02 | no original date known; spread | `common-mistakes-hudson-valley-home-sellers-make` |
| Seller | From Listing to Closing: A Step-by-Step Timeline for Selling Your Home | /blog/timeline-selling-a-house-ny | 2026-03-05 | no original date known; spread | `from-listing-to-closing-a-step-by-step-timeline-for-selling-your-home`, `listing-to-closing-timeline-selling-home` |
| Seller | Preparing for the Home Inspection: A Seller's Guide to a Smooth Process | /blog/seller-guide-prepare-home-inspection | 2026-06-10 | no original date known; spread | `preparing-for-home-inspection-sellers-guide` |
| Seller | For Sale By Owner (FSBO) vs. Using an Agent: The Pros and Cons in New York | /blog/fsbo-vs-agent-new-york-guide | 2026-07-15 | no original date known; spread | `fsbo-vs-using-agent-pros-cons-ny` |
| Investing | How to Buy Your First Rental Property in the Hudson Valley (A Step-by-Step Guide) | /blog/how-to-buy-your-first-rental-property-in-the-hudson-valley | 2025-09-25 | no original date known; spread | `beginners-guide-buying-first-rental-property` |
| Investing | 'House Hacking' 101: How to Live for Free in the Hudson Valley | /blog/house-hacking-hudson-valley-ny | 2025-10-15 | no original date known; spread | `house-hacking-westchester-county-ny`, `house-hacking-101-hudson-valley` |
| Investing | How to Calculate ROI & Cap Rate on Investment Property | /blog/calculate-roi-cap-rate-investment-property-ny | 2025-11-12 | no original date known; spread | `how-to-calculate-roi-and-cap-rate` |
| Investing | The Pros and Cons of Investing in Multi-Family vs. Single-Family Homes | /blog/multi-family-vs-single-family-investing-ny | 2026-01-07 | no original date known; spread | `pros-cons-investing-multi-family-vs-single-family` |
| Investing | A Guide to the 1031 Exchange in New York | /blog/1031-exchange-rules-new-york | 2026-02-25 | no original date known; spread | `understanding-1031-exchange-ny` |
| Investing | BRRRR Method 101: How to Build Your Real Estate Portfolio Faster in NY | /blog/brrrr-method-hudson-valley | 2026-03-18 | no original date known; spread | `brrrr-method-101-ny` |
| Investing | Managing Your First Rental: A Guide to Finding and Screening Tenants in New York | /blog/how-to-find-screen-tenants-ny | 2026-04-22 | no original date known; spread | none (the live slug is the CRM slug) |
| Investing | Which Hudson Valley Towns Offer the Best Opportunities for Real Estate Investors? | /blog/best-places-to-invest-hudson-valley | 2026-05-06 | no original date known; spread | `hudson-valley-towns-best-for-real-estate-investors` |
| Investing | Short-Term vs. Long-Term Rentals in the Hudson Valley: What's More Profitable? | /blog/short-term-vs-long-term-rentals-hudson-valley | 2026-06-24 | no original date known; spread | none (the live slug is the CRM slug) |
| Investing | The Pros and Cons of Hiring a Property Management Company in the Hudson Valley | /blog/hiring-property-management-company-hudson-valley | 2026-08-12 | no original date known; spread | `pros-cons-hiring-property-management-company` |
| Homeownership | Thinking of Finishing Your Basement? What to Know About Cost and Value | /blog/cost-vs-value-finishing-basement-hudson-valley | 2025-09-12 | the old site's stub date, carried over | `finishing-your-basement-cost-and-value`, `finishing-your-basement-cost-value` |
| Homeownership | The Ultimate New Homeowner's Toolkit: 9 Essentials Every Owner Needs | /blog/new-homeowner-toolkit-essentials | 2025-09-17 | no original date known; spread (the stub's 2025-09-12 went to the basement post) | `new-homeowners-toolkit-9-essentials`, `new-homeowner-toolkit` |
| Homeownership | Your Essential Seasonal Home Maintenance Checklist for Hudson Valley Homes | /blog/seasonal-home-maintenance-checklist-hudson-valley | 2025-09-30 | no original date known; spread | `seasonal-home-maintenance-checklist` |
| Homeownership | Lower Your Energy Bills: 9 Efficiency Tips for New York Homeowners | /blog/lower-energy-bills-new-york-homeowners | 2025-10-08 | no original date known; spread | `lower-energy-bills-9-efficiency-tips-ny`, `lower-energy-bills-ny` |
| Homeownership | 9 High-ROI Home Improvements You Can Tackle for Under $1,000 | /blog/high-roi-home-improvements-under-1000 | 2026-03-25 | no original date known; spread | `high-roi-improvements-under-1000` |
| Moving | Relocating to the Hudson Valley: A Newcomer's Guide to Small-Town Charm and Big-City Access | /blog/relocating-to-hudson-valley-ny-guide | 2025-09-13 | the old site's stub date, carried over | `relocating-to-hudson-valley-newcomers-guide`, `relocating-to-hudson-valley` |
| Moving | The Ultimate Moving Checklist: Your 8-Week Guide to a Stress-Free Move | /blog/ultimate-8-week-moving-checklist | 2025-09-19 | no original date known; spread | `ultimate-moving-checklist-8-week-guide` |
| Moving | How to Hire the Best Local Movers: 7 Questions You Must Ask Before Signing | /blog/how-to-hire-local-movers-ny | 2025-10-22 | no original date known; spread | `how-to-hire-best-local-movers-7-questions`, `how-to-hire-best-local-movers` |
| Moving | Moving to the Hudson Valley: Rental vs. Buying, and What Makes the Most Sense | /blog/rent-vs-buy-hudson-valley-ny | 2025-11-26 | no original date known; spread (the stub's 2025-09-13 went to the relocation guide) | `moving-to-hudson-valley-rental-vs-buying`, `hudson-valley-rental-vs-buying` |
| Moving | Packing 101: Pro Tips and Hacks for a Faster, More Organized Move | /blog/packing-tips-hacks-for-moving | 2026-05-13 | no original date known; spread (ahead of the summer moving season) | `packing-101-pro-tips-organized-move`, `packing-101-pro-tips-hacks` |

## Before this goes live

- The branch is not pushed. A push to `main` deploys the site, and that is the owner's call.
- The site is still noindex (`PRELAUNCH=1`), and this work leaves that switch alone. The posts are in
  the sitemap and in llms.txt, so they will be picked up when the owner flips the launch switches.
- The CRM drip links point at `https://www.realtylt.com/blog/<slug>`. They resolve once this branch
  is deployed.
