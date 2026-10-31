# Round 14 blog preview: the two refreshed posts, built and checked

2026-10-30, branch `r14-blog-preview`. The two posts approved through the agents' review chain,
built into their pages with their data points as live scenes:

- `/blog/seller-disclosure-requirements-new-york` (RealtyLT brand): 7 scenes
- `/blog/ai-audit-small-business-what-not-to-automate` (AI brand): 8 scenes

Probe: `node docs/blog-r14/probe.mjs http://127.0.0.1:3107 <outdir>` against `next start`
on the production build. The full-page frames are downscaled to stay under 400 KB; the scene
frames are at 390 px, two scenes side by side per file, with the fixed chrome (reading bar,
contents button, chat launcher) hidden so each scene reads on its own.

## The shots

| File | What it shows |
|---|---|
| `seller-390-full.jpg` | The whole seller page at 390x844: cold open, prose, seven scenes, one column, no sideways scroll |
| `seller-1440-full.jpg` | The whole seller page at 1440x900 |
| `ai-390-full.jpg` | The whole AI page at 390x844 |
| `ai-1440-full.jpg` | The whole AI page at 1440x900 |
| `seller-390-scenes-1.jpg` | dp2 the timeline (true-date spacing, law filled, the bill hollow); dp1 the form as 56 cells, flood questions lit, question 36 outlined, 49 to 56 strip |
| `seller-390-scenes-2.jpg` | dp4 one line of the form, Unkn ticked and labelled an example, four rules; dp3 the two-question flow with its two exits |
| `seller-390-scenes-3.jpg` | dp5 the six lead paint duties, 10 days and three years large; the disclosure plan (three facts, four steps, step 3 mapping papers to question numbers on a miniature of the form) |
| `seller-390-scenes-4.jpg` | The free file: the prep sheet download |
| `ai-390-scenes-1.jpg` | The five-line summary; dp3 use by firm size in two panels (different reference periods, outlines for the bound and the expectation) |
| `ai-390-scenes-2.jpg` | dp1 three surveys, three counts; dp2 sales and marketing first, with the 57 percent callout |
| `ai-390-scenes-3.jpg` | dp4 the person stays (tasks and headcount on separate tracks); dp5 the three questions with the not-building exits and dp7's invented example |
| `ai-390-scenes-4.jpg` | dp6 the five steps; the free file: the three-question sheet download |

## The gate lines (as run, 2026-10-30)

- `npx tsc --noEmit`: exit 0, "TypeScript: No errors found"
- `npx vitest run`: exit 0, Test Files 167 passed (167), Tests 2377 passed (2377). One earlier run
  had the timing test `thinning ladder plans 5,000 homes ... under 40 ms` at 71 ms while the
  machine was loaded; it passed on the next two runs and touches nothing in this round.
- `npm run build`: exit 0, "Compiled successfully", static pages 130/130
- Probe at 390x844 and 1440x900, both pages: HTTP 200; `scrollWidth` equals `innerWidth`
  (390/390, 1440/1440); 0 reveals left hidden after scrolling; no element in a scene past the
  right edge; smallest text in any scene 11px (the eyebrow of the existing Summary and Offer
  scenes); the reading bar at mid-page scaleX 0.56 to 0.58; the contents sheet opens with 11
  links and its third link lands the heading 112 px from the top.
- 320 px: `scrollWidth` 320 on both pages.
- Console: 2 lines on every page, both the Vercel Analytics script (`/_vercel/insights/script.js`)
  that only exists on Vercel; the same 2 lines on the untouched `/blog` and
  `/blog/ai-chat-assistant-real-estate-website`. 0 other errors.
- The two free files: `/downloads/seller-disclosure-prep-sheet-ny.pdf` 200 application/pdf
  278,007 bytes; `/downloads/three-question-sheet.pdf` 200 application/pdf 48,138 bytes.
- At 1600 px and wider the contents show as the left rail (11 links on each page), the same
  breakpoint the existing flagship posts use; below it, the "On this page" button.
