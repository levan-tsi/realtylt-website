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
