# Design round 60: the dark site (his seventh verdict)

The owner, 2026-09-25, after seeing round 59: "Others are still mostly whitish ... do all the other
pages as well so they are not white. We're making it dark." On /search: the Bed list showed nothing
until hovered, and "bad boxes, the filters and all the other things, make it better and round". The
chat icon "light color blue": make it "the dark color blue that our logo has, the second one". On the
agent profile "call box was not doing anything". Record of builder 4 (the foundation and the first
pages); a fifth builder sweeps what is listed as left in §1.9.

## §1 The dark foundation and the first pages

### 1.1 The mechanism, and why

`.nocturne` (the round-53 token re-point) now sits on `<html>` in `app/layout.tsx`, and `:root` is
`color-scheme: dark`. Every page, every portal (sign-in modal, dialogs, the suggestion list) and the
chat launcher are inside it, server-rendered: with JavaScript off every page is dark (probe below).

Why the class on the root rather than night values written into `@theme`:

1. Every rule, `night:` variant and test written since round 53 keeps working unchanged, and the
   home page (finished) sees exactly the tokens it saw: calibration 0.00 px, hover 50 of 50.
2. The day values stay available: in `@theme`, under `.daylight`, and under `@media print`.

ONE mechanism, three words: `.nocturne` re-points the tokens; `night:` states a component's night
look (it now matches everywhere, so it is kept, not folded: folding would rewrite ~70 class strings
for no visual change); `.daylight` is the way back to the day's tokens. `.daylight` serves two kinds
of surface: things white by nature (Google's map popup, a white pill on a photograph) and, new this
round, sections DESIGNED DARK on the day theme (photo heroes, `bg-ink text-paper` bands, the photo
lightbox, the blog's dark scenes): inside `.daylight` their `bg-ink` is black and `text-paper` white,
exactly the day design, so they needed no redesign. A light child inside such a section (a document
mock, a device screen, the home-value form) wears `.nocturne` again to come back to night.

Printed pages take the day values (`@media print { .nocturne { ... } }`): a browser prints without
background graphics, so moon text would print white on white.

`NIGHT_ROUTES` / `isNightRoute` are removed and their day branches folded (Header, FooterShell,
NightLabel, AccountMenu, SignInModal, LocationSuggest; LocationSuggest's `dark` prop went with it
and the home hero's one-word `dark` attribute was dropped, render identical).

### 1.2 The token table

| token | day (`@theme`, `.daylight`, print) | night (`.nocturne`) | used for |
|---|---|---|---|
| paper | #ffffff | #050505 (night) | the ground, inputs' fill, text on ink controls |
| mist | #f3f5f8 | #111111 (night-raise) | raised panels, the utility bar, option lists |
| ink | #000000 | #f2f2ee (moon) | text, primary buttons, active chips, selection band |
| ink-soft | #222222 | #cfcfca | secondary text, control labels |
| stone | #6f6f6f | #9b9b96 (haze) | quiet text (7.30:1 on night, 6.76 on mist) |
| line | #dddddd | #242424 | hairlines |
| line-strong | #cccccc | #5e5e5a | control edges (3.13:1 on night) |
| river | #102c54 | moon | the focus ring |
| porchlight / -deep | #28a8e0 / #1c729a | moon | actions, rings, underlines |
| card | #ffffff | #0d0d0d | cards (listing cards, and now every former `bg-white` card) |
| brand-r | #28a8e0 | #28a8e0 | the AI nav item only |
| fonts | Newsreader / Lato | Bricolage Grotesque | the night type scale on every page |

Scrims that were `bg-ink/60..70` (white inside the scope) are `bg-night-deep/70..80`.

### 1.3 /search's filters

- The Bed list: options are painted outright, `option, optgroup { background: var(--color-mist);
  color: var(--color-ink) }`, and the root is `color-scheme: dark`. Proof: every filter select
  computes `colorScheme: dark`, options `rgb(17,17,17)` / `rgb(242,242,238)` (16.8:1); and by eye in a
  headed Chrome, the Bed list open, dark with every row legible:
  `docs/design-r60/search-bed-popup-headed.jpg`.
- Round, not boxes: the six filters and Sort are native selects worn as 44px pills
  (`.rlt-pill-select`: hairline 3.13:1, the haze chevron drawn as a fill, 16px type on a phone for the
  iOS zoom floor, the moon edge and text once a value is set via `data-set`). The sale/rent and
  grid/map toggles are pill segments (44px, a 3px inset thumb). More and Filters are pills. The box
  round the whole bar is gone: pills on the page's ground. The MORE panel is its own 24px panel with
  pill selects and a pill keyword box; the pager buttons are 40px circles; the empty-state buttons
  pills. Native selects kept: keyboard, screen reader and the phone picker come free.
- Kept: the place field's instrument (16px container, 8px action), because its geometry is pinned by
  `components/search-instrument.test.ts` as the same object as the home hero's, which is not mine. It
  is 62px tall beside 44px pills: an open question for the owner (a capsule on both pages or neither).

### 1.4 The chat launcher

`public/rlt-chat.js`: new `LAUNCHER_COLOR #0f2e53` (the logo's navy) and `LAUNCHER_HOVER #1a4270`; the
panel's own brand blue is untouched. White glyph 13.67:1 at rest, 10.21:1 on hover; the navy is
1.49:1 on the black ground, so a 22% white hairline (box-shadow ring) draws the disc's edge. The night
override in globals.css that painted it porchlight is removed (porchlight is the moon now). Test:
`lib/chat-launcher-colour.test.ts`. The file is a byte copy on the /ai repo: the launcher there
stays as it is until that copy is refreshed.

### 1.5 The Call label

`/who-we-are`: `Call (914) 506-5884` (was `Call`), from `SITE.phone`. `/connect`'s "Call or text"
link now reads `Call or text (914) 875-2424` (`SITE.connectPhone`). Every other dialling control
already showed its number. `lib/call-label.test.ts` walks every `href={SITE.phoneHref}` /
`connectPhoneHref` in app/ and components/ and requires the label to read the constant.

### 1.6 Per page (each looked at 1440, 390 and 320 on the production build)

- **Chrome** (header, utility bar #111, footer, skip link, selection): night everywhere, the night
  logo, sentence-case labels.
- **/search**: §1.3. The cards, map chrome, sort, save row were already night.
- **Listing** (`/homes-for-sale/...`): the gallery section `.daylight` (its overlay buttons are dark
  pills on photos as designed), the no-photo panel scoped to night, the agent box and market cards on
  `bg-card`, "Never miss a property" band day-dark. Agent box shows the number (already did).
- **/buying**: hero, steps and close bands day-dark; device mocks' screens and the floating cards
  scoped to night (they show the dark site now).
- **/selling**: hero, pricing, loop bands and the aside day-dark; the two path cards on `bg-card` with
  a mist header and a hairline (the black-on-white header and the 2px border were the loudest thing
  left); the comparable-statistics sheet dark; the seller-portal laptop screen `.daylight`.
- **/connect**: surfaces only; the Google Calendar embed cannot be themed (Google paints it white),
  so its frame takes the 16px media radius and stands as a white card. Layout untouched.
- **/financing**: hero, pre-approval and closing bands day-dark, the letter mock dark, the calculator's
  result panel day-dark, the application laptop mock dark.
- **/home-value**: hero day-dark; the address bar is the home hero's dark glass instrument; the three
  result panels night `mist`; "Find out" in sentence case.
- **/top-areas** and **/top-areas/dutchess**: heroes and the close band day-dark, area cards
  `bg-card`, borough cards' header a mist strip with night text.
- **/who-we-are**: hero day-dark, principle cards `bg-card`, the Call label.
- **/blog** and posts: headers day-dark, the flagship's dark scenes (ColdOpen, ResponseGap,
  SystemDiagram, Film, and every scene band the registry marks dark) `.daylight`, the calculator's
  result panel `.daylight`, faint scene and ToC labels lifted (45/55% white to 60/65%: pre-existing
  4.3 to 4.4:1, now over 4.5).
- **/saved**, **/plan**, **/thank-you**, **/reviews**, **/services** and one service page, legal
  pages, **404**, **/sitemap**: headers and bands day-dark; the service page's lead band, use-case,
  related and more-services cards dark.

Contact sheets (before 1440 | after 1440 | before 390 | after 390 | after 320):
`docs/design-r60/<page>.jpg` for search, listing, buying, selling, connect, financing, home-value,
top-areas, dutchess, who-we-are, blog, post, saved, thank-you, privacy, dmca, reviews, services,
plan, sitemap, 404, home, and `_services_ai-chat-assistant.jpg` (no before for that one).

### 1.7 Contrast

`scripts/_scratch-r60-contrast.mjs` walks every visible text node, composites its ground (Tailwind's
oklab alphas converted) and reports anything under 4.5:1 (3:1 large). At 1440, 21 routes: 0 under
the floor except Google's own map attribution inside the map on /search (Google's text on Google's
tiles, not ours). At 390 on /search, /buying, /selling, eight posts and five service pages: 0; at 1440 the same set showed only the ToC bar's "On this
page" label (4.44:1), lifted to 65%, and a re-check of a post and a service page reads 0.

### 1.8 Gates (final build)

- `npx tsc --noEmit` clean; `npx vitest run` 2218 passed, 0 failed (was 2189).
- `node scripts/qa-crawl.mjs http://127.0.0.1:3102` ALL PASS (250 links, no overflow at 390, the six
  county pages in-county).
- Home page: `_scratch-r58-calib.mjs --shots=hero,queens` 0.00 px both; `_scratch-r57l-hover.mjs`
  alone 50 of 50.
- JavaScript off (`_scratch-r60-nojs.mjs`): 18 routes, root `.nocturne`, scheme dark, body #050505.
- No horizontal overflow at 390 or 320 on any page shot.

### 1.9 The list for the fifth builder

Finished (looked at 1440/390/320, contrast clean): the chrome, /search, the listing page, /buying,
/selling, /connect (bar the embed), /financing, /home-value, /top-areas, /top-areas/dutchess (the
other county pages share the template), /who-we-are, /blog, the flagship post, /saved (empty state),
/thank-you, /plan (landing), /reviews, /services, one service page, /privacy-policy, /dmca-terms,
/sitemap, the 404.

Started or not looked at in every state:
- **/portal** and its pages (`app/portal/**`, `components/portal/**`): `bg-white` cards remain
  (portal/page, searches, reports, ReportGenerator, ReportDetail lines 158/381/400/414/445,
  TalkToAgent). Needs a signed-in session to look at.
- **Dialogs and flows** not opened by the shots: the plan quiz takeover (options now `bg-paper`,
  scrim dark; not looked at open), the qualifying wizard, the lead sheet, the save-search dialog, the
  sign-in modal (tokens say night; look at each open), the Top areas flyout, the mobile menu.
- **The other blog posts' light scenes** (`components/blog/scenes/primitives/*`: Plate, Conversation,
  Calculator, Grid use `bg-white` on their light variant) and the remaining service pages.
- **/auth/reset**, **/listing/[id]** (the old route), **/sitemap** detail, legal pages at length.
- **The chat panel** (`public/rlt-chat.js`) is still the live site's white panel with its blue; only
  the launcher changed. A dark panel is a separate decision (the file is shared with /ai).
- **The blog index hero's blue radial glow** (rgba 40,168,224, `app/blog/page.tsx`) reads as a blue
  cast on black; the rules say no new hues. Not changed (not asked).
- **Dead day markup** left in place: the footer's day logo `night:hidden` (never shows now), the
  `dark ? ... : ...` branches in Field/TestimonialCard/Conversation. Harmless; fold when touched.
- **The instrument height** on /search (62px beside 44px pills), §1.3.
- **The Google Calendar embed** on /connect is white by Google's design.
- **Typography**: every page takes the night scale (Bricolage 580 to 620). Headings with a
  `<strong className="font-bold">` half render that half at 700 beside 600-620 (the utility beats the
  night rule's `inherit`); visible on /buying's hero and a few `t-h2`s. Reads fine; the round-53 rule
  says the night does not use the one-bold-word device, so a later pass may drop those `strong`s.

### The orchestrator's verification of §1 (2026-09-25, on a rebuild from HEAD `bf0bdc8`)

tsc clean; vitest 2218 passed, 0 failed. The crawler: 350 internal links resolve, no overflow at 390,
the county pages in-county. The home page after the theme flip: calibration 0.00 px at the territory
and Queens with the live map's light counts; hover 50 of 50 alone. JavaScript off: dark from the
server on every route tried. The contrast walker at 1440 over 20 routes: 4 under the floor, all four
Google's own attribution inside the /search map, none ours. A light-surface scan of every route at
1440 and 390 (`scripts/_scratch-r60-light.mjs`: any opaque background above 0.5 luminance holding
text, outside media): every hit is the site's white primary button with dark text at 18:1 or better,
except the home page's listing cards, which the scan reports as white with light text (the article's
`bg-card` computes white there) while the painted card is dark and readable at both widths (looked at:
`scripts/_scratch-r60/look/home-{1440,390}-find.png`): a dark cover paints over a white ground, which
is fragile and is on the fifth builder's list. Looked at: /search (the pills, the Bed list dark in a
headed window), /buying (the photo hero, the white primary button), /connect (the dark page around
Google's white calendar, which Google paints), the featured rail. The /search place box stays taller
than the pills by the pinned instrument geometry; it reads as the primary control and is left.

## §2 The rest of the dark site (builder 5)

Every surface below was opened on the production build (:3102) and looked at, at 1440 and 390 (320 for
overflow on the changed ones). Probes block `/api/media/`, `app.realtylt.com` and any MLS host by CDP;
`/api/lead` and `/api/activity` are answered locally with `{ok:true}` so a form can succeed without
reaching the CRM (it never did: every form run printed its mocked post count).

### 2.1 The chat panel (`public/rlt-chat.js`)

The launcher was navy; the panel it opened was the old white one with a blue header. Now the whole
panel is night, in the site's tokens written into the script's CONFIG (it is a static script outside
the stylesheet):

| part | colour | measured |
|---|---|---|
| ground (panel, header, list, composer, footer) | `#0d0d0d` (the card), a 14% white hairline for the edge on black | |
| text | moon `#f2f2ee` | 17.3:1 |
| quiet text (subtitle, footer, system line, placeholder) | haze `#9b9b96` | 7.0:1 |
| ours | a hairline bubble on the ground (`#242424`) | |
| the visitor's | the raised step `#1a1a1a`, moon text | 15.5:1 |
| Levan's own replies | our bubble with a 3px porchlight bar and a porchlight tag | 7.2:1 |
| Send, the live mic | porchlight `#28a8e0`, a `#050505` glyph; hover `#52bae6` | 7.5:1, 9.2:1 |
| chips, mic, composer edge | `#63635f` (a step over the page's `#5e5e5a`, which is 2.98 on this card) | 3.2:1 |
| failure line | `#f4b8b3` on `#1c1010` | 10.9:1 |

The composer is 16px at every width (was 14 on a desktop), chips 14px pills, the message text 15px,
the close control 44px with a moon focus ring (every control has one now), the scrollbar and native
parts dark (`color-scheme: dark`). The launcher is untouched. Test: `lib/chat-panel-night.test.ts`
(8), beside the launcher and CSP tests, all green. Looked at in a HEADED Chrome at 1440 and 390 with a
sample conversation injected into the DOM (nothing sent): `docs/design-r60/chat-panel.jpg` (before
1440 | after 1440 | before 390 | after 390; probe `scripts/_scratch-r60-chat.mjs`, `--before` serves
HEAD's file). NOT DONE: the byte copy of this file in the /ai repo is left alone; it still has the
white panel until someone copies this file there.

### 2.2 Dialogs and overlays

`scripts/_scratch-r60-dialogs.mjs` opens each for real and runs the light scan, the contrast walker
and the 16px check INSIDE the dialog (`scripts/_scratch-r60-scan.mjs`); the quiz and the qualifying
wizard are walked step by step by their first answer. Final build:

| surface | how opened | ground | light | contrast | <16px (390) |
|---|---|---|---|---|---|
| sign-in modal | header Sign in | #111 | 0 | 0 | 0 |
| mobile menu (390) | Open menu | #050505 | 0 | 0 | 0 |
| Top areas flyout (1440) | the caret | #050505 | 0 | 0 (was 2: its group labels at haze/70, 3.98:1, now haze) | - |
| save-search dialog | Save search on /search | #111 | 0 | 0 | 0 |
| place suggestions | "Yon" in /search's box | #111 | 0 | 0 | 0 |
| plan quiz | /plan?quiz=1, walked to step 7 | scrim + #111 | 0 | 0 | 0 |
| tour sheet (390) / tour form (1440) | Schedule a tour on a listing | #050505 | 1* | 0 | 0 |
| offer sheet | Make an offer | #050505 | 0 | 0 | 0 |
| /connect form sheet | its button | #050505 | 0 | 0 | 0 |
| gallery lightbox | the hero photo | black 95% | 0 | 0 | 0 |
| qualifying wizard | /selling hero form submitted (mocked), walked to its last step | #050505 | 0 | 0 | 0 |
| account menu | signed in (§2.3) | #111 | 0 | 0 | - |

\* the selected day ("Today 25 Sep") is a moon chip with dark text at 18.2:1: the selected state,
the same inverted pill the site uses for every active chip. Kept.

Consent: the forms carry ONE consent checkbox, unticked, optional (`ConsentCheckbox`); there are no
consent radios in the codebase. Its behaviour is untouched; its invalid state had a light rose ground
where no `dark` prop is passed, now `night:bg-rose-400/10`. Sheets: `docs/design-r60/dialogs-1440.jpg`,
`docs/design-r60/dialogs-390.jpg`.

Found while looking: the listing page's photo band is a `.daylight` section, so every photo tile
WAITING for its picture showed the day's near-white `mist` (the skeleton in `MlsImage`): big white
boxes on a black page until the photo landed. Now the night's raised step:
`docs/design-r60/listing-skeleton.jpg` (before | after).

### 2.3 The portal

The e2e portal account does not exist between runs (it is SQL-created and deleted per test, and
creating an auth user is not a builder's call), so `scripts/_scratch-r60-portal.mjs` answers the
browser's Supabase host LOCALLY: a fake session for "Probe Visitor", an in-memory `portal_reports`
table, `[]` for the rest. No request reached Supabase; our own `/api/reports/*` answered the generator
from the listings DB, and the page's own generator made a market report and a home-value report.

Before, signed in: the portal's header band and the "Your agent, on call" panel were `bg-ink` bands
that had turned moon-white on the night page; the market report's stat cards were WHITE WITH WHITE
FIGURES (1.1:1, invisible), the home card the same, the report-type switch a white box. Now: the
header and the agent panel keep their dark design under `.daylight` (the panel with a hairline so its
edge shows on black), every `bg-white` card is `bg-card`, the error notes take a night ground, the
header's strong half is plain (one weight). Final: overview, saved homes, saved searches, reports,
profile, a market report, a home-value report and the account menu: light 0, contrast 0 at both
widths, except two DISABLED buttons ("Send" before a message is typed, "Save adjustments" before a
change) at 3.9 and 2.7, which WCAG exempts. Printed reports keep the day values (`@media print`
re-points `.nocturne`; the estimate panel is `.daylight`): black on white paper. Sheets:
`docs/design-r60/portal.jpg` (overview 1440, market and home-value reports 390, each before | after),
`docs/design-r60/portal-reports-1440.jpg`.

### 2.4 The blog's scenes and the index

The light scene primitives (Plate, Calculator, Grid) are already on tokens (`bg-mist`, `bg-paper`)
and read night; the sweep found the Conversation scene's (and the flagship's Teardown's) VISITOR
bubble white: it is `bg-river`, and at night `river` is the moon (the focus ring). It keeps its navy,
`#102c54`, with moon text (12.4:1): the scene's own language, no new hue. Faint labels lifted to the
floor: the flagship's "You called" 11px label (3.0:1, /35 to /50) and its dimmed "9:00 am" (/40 to /50;
the 20px "am" was 3.66:1 on a phone), a conversation's timestamps, a plate's photo credit. The
flagship's approved dark scenes are otherwise untouched. The blog index hero's blue radial glow is
REMOVED (a blue cast with no source in the picture; no new hues), and its strong half with it.

### 2.5 /auth/reset, /listing/[id], /thank-you, the 404, the sitemap

All dark in the sweep at both widths: `/auth/reset` (the expired-link state; its red error text was
red-600, 4.2:1 on black, now red-400 7.4:1 at night, the same fix in `Field`'s two error lines),
`/listing/<key>` (a 308 to the listing page, which is §1's), `/thank-you`, `?c=1`, `?c=0`, the 404 and
/sitemap. /auth/reset was also shot at 320: no overflow.

### 2.6 The home rail card's ground

`components/idx/ListingCard.tsx`: the rail card's `<article>` was literally `bg-white` (a dark cover
painted over it). Now `bg-card`. The page is unchanged: calibration 0.00 px at the territory and
Queens, hover 50 of 50 alone, and the look (`docs/design-r60/home-rail.jpg`, before | after at 1440
and 390) identical; the light scan no longer reports the card.

### 2.7 Dead day markup and one weight per heading

- The footer's day logo is removed (the root is always `.nocturne`, the `night:hidden` cut could never
  show, not even in print). Only the night cut remains.
- The `dark ? ... : ...` branches in Field, TestimonialCard and Conversation are NOT dead: `dark` is
  the photo-hero / dark-band variant (rendered inside `.daylight`) and the other branch is the night
  page's. Both render today; kept.
- One weight per heading: 25 headings carried `<strong className="font-bold">`, and the utility beat
  the night rule's `inherit` (measured: h1 620, its strong half 700). The class is dropped from every
  one; the plain `strong` inherits at night (measured on /buying after: 620/620, 600/600) and is bold on paper.
- Also: the financing phone mock's "5-year total" was a moon-white box (now a night panel with a
  hairline), the Top areas flyout's group labels at haze. Looks of the changed surfaces (the phone mock,
  the navy visitor bubble, /auth/reset, the blog hero, the one-weight h1, the dark photo band at 390):
  `docs/design-r60/surfaces-b5.jpg`.

### 2.8 Left as decided

The /search place box (pinned geometry, the orchestrator's call) and Google's white calendar embed on
/connect (Google paints it; the frame keeps its 16px radius).

### 2.9 Gates (final build, HEAD `e3b693f`)

- `npx tsc --noEmit` clean; `npx vitest run` 2236 passed, 0 failed (was 2218; +8 chat panel, +10
  `lib/dark-surfaces.test.ts`).
- `node scripts/qa-crawl.mjs http://127.0.0.1:3102`: ALL PASS (250 internal links, no overflow at 390,
  the county pages in-county).
- The light-surface scan over 106 routes (every page, every blog post, every service page, the
  listing, /listing/<key>, the thank-you states, /auth/reset, /portal) at 1440 and 390: every light
  surface left is a control with dark text at 18.2:1 or better (the white primary buttons, the listing
  cards' "Coming Soon" status chips on photographs, the device mocks' buttons). 0 with light text, 0
  covering text. The dialogs and the portal: §2.2, §2.3.
- The contrast walker over the same 106 routes: 1440, 4 under the floor, all Google's own map
  attribution on /search; 390, 0 (after the "am" fix, rechecked on the final build).
- JavaScript off: all 18 routes dark (`_scratch-r60-nojs.mjs`).
- The home page: `_scratch-r58-calib.mjs --shots=hero,queens` 0.00 px both; `_scratch-r57l-hover.mjs`
  alone 50 of 50 (a first run right after a server restart read 45 with 5 "none"; the rerun alone, 50).

### 2.10 Open

- The /ai repo's copy of `rlt-chat.js` still opens the white panel (not this repo's to change).
- The portal was looked at through a local Supabase mock, not a real signed-in account; the pages and
  data shapes are the real ones, the rows are made up.
- The listing cards' "Coming Soon" / "New" status chips stay white on photographs (a white pill on a
  photograph is white by nature, §1.1).

## §3 The orchestrator's verification of §2, the deploy, and the close (2026-09-25 evening)

**Verified on a rebuild from HEAD `8804a61`, nothing else running.** tsc clean; vitest 2236 passed, 0
failed (2189 at the round's start, 2218 after builder 4). The crawler: 250 internal links resolve, no
overflow at 390, the county pages in-county. The light-surface scan over the routes at 1440 and 390:
every hit a white primary button with dark text at 18:1 or better (the home page's cards no longer
appear: their own ground is the night card now). Builder 5's dialogs probe, twelve dialogs and
overlays opened for real at both widths (sign-in, the mobile menu, the Top areas flyout, save-search,
the place suggestions, the plan quiz twice, the tour and offer sheets, the /connect form, the gallery,
the qualifying wizard to its fields): light 0, contrast 0, no control under 16 px, the one hit the
selected "Today" day chip (moon with dark text at 18.2:1, the site's active chip), the lead posts
answered locally and none reaching the CRM. The contrast walker at 1440 over 20 routes: 4 under the
floor, all Google's own attribution inside the /search map. JavaScript off: dark on every route.
The home page: calibration 0.00 px mean, p95 and max at the territory (443 common lights) and Queens
(754); hover at Queens 50 of 50 alone on the warm server (the first run straight after the restart
read 45 of 50 with 5 none, as it did for both builders: a cold server misses the probe's 90 ms
window; the second run is the one that counts). The chat panel opened on the final build at 1440 and
390 and looked at: the night ground with a hairline edge, moon text, the visitor's bubble a raised
step, the send control the porchlight blue, the input 16 px. The sheets under `docs/design-r60/`
looked at: the chat panel before and after, the dialogs, the portal (its white header bands and the
white stat cards with white figures gone), the listing skeleton, the home rail.

**Deployed.** `git push origin HEAD:main` at 22:25:59 on the owner's standing word ("deploy yourself
once all the pages are in dark mode and everything works properly and white background is not
covering text"): `c07889f..8804a61`, Vercel deployment `dpl_AY9Kpun5pCscBbSijaY1YRLiHv4o`, READY,
aliases realtylt.com, www.realtylt.com and the vercel.app hosts. **Verified live on realtylt.com**
(a real browser; plain fetches are challenged by Vercel's bot mitigation): the root carries the
night scope with `color-scheme: dark`, the body near black; the home page at 1440 and 390: the plates
ground, the plate revealed (981 and 749 ms over the network), 450 and 257 lights drawn, the credit
collapsed to the (i), the lights fetched once, the first film fetched and ready, CSP silent, no page
errors; the live pages at 390 looked at: /search with its pills, /buying's dark photo hero with the
number and the white primary button, /who-we-are with "Call (914) 506-5884", the home page's footer
without a map credit, with the Equal Housing and REALTOR marks and the navy chat launcher. Vercel
runtime errors in the deploy's first half hour: none.

**Open, said plainly.** The /ai repo's copy of `rlt-chat.js` still opens the white panel (another
repo). The portal was seen through a local Supabase mock, not a real signed-in account. Real iPhone,
Safari and Firefox are unverified (`scripts/_scratch-r60-engines.mjs` runs the home page and /search
on Playwright's WebKit and Firefox as an iPhone 13 and a laptop; the owner paused it; his iPhone on
realtylt.com is the truest test, and a Vercel preview of a branch can serve the next round before it
goes public). The /search place box stays taller than the pills (the pinned instrument). Google's
calendar on /connect is white by Google's hand. Status chips on listing photos stay white on the
photo by design. Two SEO items from the live 404s: an old blog slug
(`/blog/when-to-sell-house-hudson-valley`) and the old listing URL form for homes that left the
market. Next: the map round, `docs/handoff/WEBSITE-R61-MAP-ROUND-BRIEF.md`.
