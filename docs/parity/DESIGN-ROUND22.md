# Design assessment — round 22

Written before any code was touched, from production (`realtylt-website.vercel.app`) at 1440 and
390, walked a viewport at a time so reveals fired, shot at native resolution in viewport bands.
Bands are in `docs/design-r22/prod/`.

**Measure on production, not dev.** Round 20 learned this the hard way and this round re-learned it
in the first twenty minutes: on the local dev server every listing card photographed as a grey
placeholder, which looks exactly like "the photo backfill is broken". On production the same cards
carry real photography and `/api/media` answers `302` with `X-Media-Status: storage` — the
storage-first success path, not the "no photo" branch. Two lessons, both mine to keep:
the redirect **is** the happy path here, and a dev screenshot is not evidence about the site.

---

## 1. What already reads luxury — do not churn it

These are converged. Round 11–21 reasoned them out and the reasoning is in the code comments.

- **The type pairing.** Newsreader for display, Lato for body. Newsreader holds a 200 at hero size
  and keeps a 600, which is what lets the signature "light next to bold inside one headline"
  (`Let's Find **Home**`) work at all. Lato was inherited rather than chosen, but it is deliberately
  kept so product surfaces do not shift under anyone's muscle memory. Leave both alone.
- **The box vocabulary.** One shadow hue, five radii, two hairline tokens, and a test
  (`components/design-system.test.ts`) that fails on a new hardcoded grey, an ad-hoc shadow or an
  off-scale radius. This is the single best structural decision on the site.
- **The hero search instrument.** Input and button share one container with a 4px inset —
  connected because they share a body, breathing because of the inset, radii concentric
  (12px container = 8px button + 4px). The owner rejected both butted-together and gapped; this
  third reading is right.
- **The listing detail micro-labels.** `STATUS / ON SITE` set as small-caps grey over a plain
  value. Quiet, dense, informative. This pattern deserves to spread, not be replaced.
- **The home-value section's split.** Eyebrow + left-aligned heading against a panelled form,
  `lg:items-center` so the short column sits against the middle of the tall one. It is the only
  home-page section with a distinct shape, and it is the best one.

---

## 2. What reads generic

**The page has no hierarchy between its sections.** This is the headline finding and everything in
§3 serves it. Every section below the hero is the same weight: centred h2, content, centred pill.
Same vertical padding (`sec`), same heading size, same button treatment. Generous whitespace that
is *uniform* stops reading as generosity and starts reading as a template — nothing is emphasised
because everything is. Luxury layout is unequal on purpose: it spends space where the content earns
it and withholds it elsewhere.

The specific symptoms:

- **Two consecutive listing rails are literally the same section.** "Featured Listings" and "New
  Listings" have identical centred headings, identical MLS attribution, and the same centred
  outline pill with the *same words* — "See More Listings" — twice. A visitor scrolling past
  cannot tell they have moved.
- **The counties strip is an undifferentiated bag of pills.** Eleven identical outline pills,
  centre-justified, wrapping 7 + 4 so the second row is an orphaned centred remnant. It also
  silently mixes two different kinds of place: six Hudson Valley counties and five NYC boroughs,
  with "THE BRONX" sitting at the end of the county row as though it were one. The distinction is
  true, it is the business's actual footprint, and the design throws it away.
- **The photography is the best asset and the hero desaturates it.** `grayscale` on the hero image.
  On a phone that turns a licensed Hudson Highlands aerial into a grey moody wash; the Hudson
  Valley in colour is the product.
- **Precision defects undercut the "considered" read** (§3.1–3.4). Luxury is precision; a price row
  that does not align and a caption that collides with a button say "assembled" more loudly than
  any palette choice says "premium".

---

## 3. The ranked moves

Ranked by impact on the "considered, calm, high-end" read, and within that by risk. **1–7 are
build-now.** 8–10 need the owner.

### 3.1 — Listing card: the price row breaks alignment when an address wraps *(verified)*
In a 4-up row, the metadata block is bottom-anchored, so a 3-line address pushes its price up while
its neighbours' stay put. Measured on the production home page: prices at y=516, **492**, 516, 516.
Three of four align and one does not, which reads as a bug rather than a rhythm. Reserve the
address block so every card in a row shares one price baseline.

### 3.2 — Listing card: the MLS attribution collides with the View button *(verified)*
"Listed With United RE Hudson Valley Edge" wraps to two lines and its second line runs under the
View button on every card wide enough to trigger it. Two elements sharing one line with no
allowance for the longer one.

### 3.3 — The two listing rails need different jobs, not different words *(verified)*
Do not fix this by renaming the button. "New" is a **time** claim, and structure should encode what
is true: the new-listings rail earns a time signal that the featured rail must not have. Featured
keeps the symmetric centred grid (centring is structure there — it sits over a symmetric object).

### 3.4 — Counties strip: split the two kinds of place *(verified)*
Group as Hudson Valley (6 counties) and New York City (5 boroughs) under two quiet labels. Fixes
the orphaned wrap row, makes the strip informative instead of decorative, and states the footprint
accurately. This is the clearest case on the site of a structural device that should carry meaning.

### 3.5 — Footer: two copyright notices *(verified — `Footer.tsx:118` and `:126`)*
`© 2026 Levan Tsiklauri | United Real Estate. Each office is independently owned and operated.`
sits directly above `© 2026 RealtyLT` in the black bar. The first is the substantive one (legal
entity plus the franchise disclaimer) and belongs with the Equal Housing and REALTOR® marks. The
second is redundant.

### 3.6 — Footer: the reference column is cramped inside 220px of unused space *(verified)*
At 1440 the right column's links end ~220px above the strip below it, while the left column's form
runs long — the same "unused extra space" the owner named on the home-value block, still unfixed
here. The links themselves are set at `gap-y-1` (4px) against 24px targets, which is tight enough
to read as a list of options rather than a set of destinations. Open the rhythm into the space that
is already there rather than inventing content to fill it.

### 3.7 — Listing detail: a single-photo listing leaves an off-centre black void *(verified)*
On `/listing/KEY1013776` at 1440 the one photo runs x=112→1045 inside a full-bleed black section:
112px of black to its left, **395px to its right**. It is not centred and the asymmetry is
visible. The gallery is built for a filmstrip and has no considered state for one photo.

### 3.8 — The hero image: `grayscale`, and an asset with no licence *(owner)*
Two separate things, tangled:
- **Desktop** gets `hero-vimeo-frame.jpg`, the first frame of the old IDX vendor's Vimeo clip. It
  is a dim interior hallway, and `ATTRIBUTIONS.md` already lists it as the one hero asset carrying
  **no licence record at all**. It stands or falls with the clip, which is also the vendor's.
- **Phones and reduced-motion** get `valley-aerial.jpg` — Breakneck Ridge, which we do hold a
  licence for, and which says where this business works.

The licensed photograph is both the safer asset and the better one. Recommendation: drop the clip
and its frame, let the Hudson Highlands carry the hero at every width, and reconsider `grayscale`
on it. That is an owner decision because he chose the video, so it is written up here rather than
taken — but it is the single largest available gain on the page and it retires a liability.

### 3.9 — The home-value copy is the old vendor's boilerplate *(owner)*
"We demand excellence throughout the home-selling process." "…our entire network of experts in Real
estate sales, Real estate purchases, Loan processing and Marketing." (sic — the capitalisation is
in the source). This is the **second thing** a visitor sees and it says nothing. Round 11 recorded
it as "the owner's own words, verbatim — his copy, not ours to rewrite", so it is flagged, not
touched. Worth asking him for four sentences in his own voice about how he actually prices a home.

### 3.10 — Scrollspy shows PAYMENT active at the top of a listing *(suspected, not yet confirmed)*
Observed at y=0 on `/listing/KEY1013776` after a scripted scroll to the bottom and back. May well
be an artifact of scrolling faster than any human, which is exactly the class of probe lie this
project keeps a list of. Verify by hand before treating it as a defect.

---

## 4. What this round deliberately is not doing

- **The photo backfill.** Probed first thing; it died on `idx_sync_apply 504: upstream request
  timeout`, and the cause is that Supabase is IO-starved right now — a plain count over
  `idx_listings` (170 MB, 31,409 rows) ran 75s+ with `wait_event` NULL while catalog reads returned
  instantly, and later a connection timed out outright. That is ~2 MB/s of scan throughput with the
  project still reporting `ACTIVE_HEALTHY`, which is the signature in `[[supabase-io-exhaustion-signature]]`.
  The backfill is a heavy writer to that same table, so running it now deepens the starvation and
  risks the MLS key for a 1.4% tail (384 stale rows of 27,680). The watermark did **not** advance.
- **Storage image transformations are not involved in any of this.** `publicPhotoUrl()` builds
  `/storage/v1/object/public/…`; the transformation product lives behind `/render/image/public/…`
  and a grep across `lib/`, `app/` and `components/` for `render/image` or `transform` returns
  nothing. The site serves original bytes. Resizing on the site is Vercel's `/_next/image`, a
  different product on a different bill, and the Supabase project is shared with other work.
- **Type, box tokens, and the search instrument** — converged, see §1.
