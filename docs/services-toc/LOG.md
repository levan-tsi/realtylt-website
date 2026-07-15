# Service-page Table of Contents — build log

Added the blog's hovering, sticky, scroll-spy table of contents to the service page template
(`app/services/[slug]/page.tsx`), so it applies to all 20 service pages from one template.

## What was built

The service sections are full-bleed bands (ink / mist / paper), so the blog's in-column grid
rail does not translate directly. The ToC adapts to that context while reusing the blog's logic
and its mobile pattern verbatim:

- **Desktop (>= 1360px):** a fixed rail floating in the left gutter. At rest it is a compact
  spine of ticks whose active tick is lit in porchlight (the scroll-spy is legible without
  hovering). On hover or keyboard focus it expands into a floating labelled card. Below 1360px
  the gutter disappears, so it falls back to the mobile pattern.
- **Mobile / narrow (< 1360px):** the same floating "On this page" pill + bottom sheet the blog
  uses, with the active section shown on the pill and highlighted in the sheet.

Curated (not markdown-parsed) sections, in document order: What it is, How it works, Use cases,
See it live, [Watch it — only when a walkthrough is attached], FAQ. Hero, the outcome band, the
lead form and "more services" do not earn a row.

### Files

- `lib/toc/scroll-spy.ts` (new) — shared `useScrollSpy(ids)` hook + `scrollToId(id)`. The blog's
  scroll-spy logic, lifted so there is ONE implementation. `ArticleToc` now consumes it too.
- `lib/services/toc.ts` (new) — pure `serviceTocItems(service)` deriving the curated rows
  (video row is conditional). Unit-tested in `lib/services/toc.test.ts` (4 tests).
- `components/services/ServiceToc.tsx` (new) — the desktop rail + mobile pill/sheet.
- `components/blog/ArticleToc.tsx` — refactored to use the shared hook (behaviour unchanged).
- `components/services/{WhatItIs,HowItWorks,UseCases,SeeItLive,VideoBlock,Faq}.tsx` — each
  section got a stable `id` (`what-it-is`, `how-it-works`, `use-cases`, `see-it-live`,
  `watch-it`, `faq`) and `scroll-mt-24` so anchor jumps land un-hidden.
- `app/services/[slug]/page.tsx` — computes the ToC and renders `<ServiceToc>` last in the DOM
  (fixed/floating, so the page reads and tabs in full before a keyboard user reaches it).
- `scripts/verify-services-toc.mjs` (new) — the browser verification harness below.

## Design notes

- Brand accent only (porchlight azure `#28a8e0` active tick / dot, river-navy focus ring). No
  gradients, no neon, no emoji, no em dashes, no arrows. Restraint: rest state is near-silent,
  the reveal is the moment.
- Rest state reads on BOTH dark and light sections (porchlight active tick + `#c3c9d2` inactive
  ticks) — see `_rest-on-white.png`.
- The expanded hover card transiently overlaps the leftmost content by ~30px at 1440px (the
  gutter is 80px, narrower than a labelled card). This is a deliberate, brief hover overlay with
  its own opaque card; the persistent rest state has zero overlap.

## Before / after (1440px, workflow-automation)

- Before: `workflow-1440-BEFORE-top.png`, `workflow-1440-BEFORE-usecases.png` (ToC hidden)
- After — rest on dark hero: `workflow-1440-top.png` ; rest on white: `_rest-on-white.png`
- After — hover reveal: `workflow-1440-hover.png` ; keyboard focus reveal: `workflow-1440-focus.png`
- After — clicked "Use cases", landed at top=96px: `workflow-1440-jumped.png`
- Second service (voice): `voice-1440-top.png`
- Mobile 390px: `workflow-390-pill.png`, `workflow-390-sheet.png`

## Verification

- `npx tsc --noEmit` — clean.
- `npm test` — 200 passing (196 prior + 4 new ToC tests).
- `npm run build` — clean; all 20 `/services/[slug]` pages prerendered as SSG.
- `node scripts/verify-services-toc.mjs` — 48/48. Proves, at 1440px on workflow-automation AND
  ai-voice-agents: rail on the LEFT, scroll-spy marks the correct section (How it works / Use
  cases / FAQ), hover + keyboard focus reveal labels, click jumps + lands the section at
  top=96px (un-hidden) + updates the hash, no horizontal overflow, no sub-24px targets, exactly
  one h1, Service+FAQPage+BreadcrumbList JSON-LD intact, zero console errors. At 390px: desktop
  rail hidden, pill present, bottom sheet lists the sections, a tap jumps to FAQ (landed 96px)
  and closes the sheet. Blog regression: the article ToC still scroll-spies and jumps.
- `node scripts/shoot-services.mjs` — all service pages clean at 1440 + 390 (one transient dev
  500 on workflow-automation from two scripts hitting the HMR server at once; it renders fine on
  a single request and the production build renders it statically without error).

## Notes for the main session

- Reused the already-running dev server (the task said none was running, but one was live on
  :3000) instead of stacking a second, then stopped it to build and restarted a fresh one on
  :3000. Nothing committed — tree left dirty for review.
- `scroll-mt-24` (96px) is the jump landing offset. If the color-band boundary feels like too
  much or too little air on jump, that's the single knob to tune on all six sections.
