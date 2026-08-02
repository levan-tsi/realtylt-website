# Home hero — three candidates, and the CRM pairing answer

Written 2026-08-02. **Nothing in here is live and nothing was deployed.** The site still plays
the Vimeo clip exactly as before. Run the dev server and open `/lab/hero` to compare all three
against each other; two of them only make sense in motion, so screenshots undersell them.

The lab lives on the **local branch `hero-lab`** and was deliberately not pushed —
`git checkout hero-lab` to see it, `git checkout main` to get back.

---

## Why not just port the /ai page's look

`/ai` sells a **capability**, so it can be abstract: a galaxy that becomes a brain is a metaphor
for the product. The home page sells **homes**. An abstract particle field there is decoration,
and decoration on a luxury page is exactly what reads as vibe-coded — it is the thing the
anti-slop rules exist to prevent.

So the brief I set for all three: the signature has to be made of something **only RealtyLT
has**, and it has to add depth without adding noise. All three are monochrome, dark, and use
the type we already have. None of them introduces a colour, a gradient, or a dependency.

---

## A — "Depth"

The photograph we already own, no longer flat. The picture, the valley haze and the type sit on
three planes that answer the pointer at different rates.

- **Uses:** the licensed Breakneck Ridge still we already ship.
- **Cost:** lowest. No new data, no canvas, no dependency, ~60 lines.
- **LCP:** safe by construction — the hero image is only ever `transform`ed, never faded and
  never re-decoded, so its paint time is untouched. (LCP on this page IS the hero image, measured
  ~1.5s on dev, so this is the constraint that matters.)
- **Honest weakness:** it is *nice*, not memorable. Any good agency site could have it. It does
  not say anything about RealtyLT specifically.

## B — "The Valley" ← my recommendation

Every active listing we hold, at its real coordinates: **6,000 points of light** over the Hudson
Valley. The field parallaxes with the pointer; the listing nearest the cursor brightens and names
itself with its price and town.

- **Uses:** `lat`/`lng` we already store for every listing. The towns emerge as clusters and the
  Hudson corridor is visible — because it is genuinely the map, not a pattern.
- **Cost:** canvas 2D, no Three.js, no dependency. One query at render time.
- **Why this one:** it does not *claim* coverage of the valley, it *shows* it, and no competitor
  can copy it because it is our inventory. It is the only one of the three that could not exist
  on anyone else's site. It also stays dark and quiet — the restraint is doing the work.
- **Honest weaknesses:** it is the riskiest to get exactly right; a field like this becomes a
  screensaver the moment the motion is too visible (the shimmer here is deliberately tiny). And
  it moves the hero away from photography, which is a real trade for a property business.
- **Deliberately NOT done:** colour-coding the points by price. It would turn a luxury hero into
  a dashboard and would be the loudest thing on the page.

## C — "Traverse"

Your idea: one house, and the mouse changes it. Moving across the frame travels through real
homes we are selling, each cross-fading into the next with its address and price.

- **Uses:** real listing photographs — every frame is a house we are actually selling.
- **Cost:** low, but with one hard constraint: it **only ever shows homes whose photos are
  already mirrored into our own Storage**, and it preloads a fixed set of 8 once, never on
  pointer move. This account has been rate-limited into the ground once already; a hover effect
  that fetches is how that happens again. If this variant ships, that constraint is not optional.
- **Honest weakness:** the photographs are listing-agent photographs of wildly varying quality.
  Curating 8 good ones is easy; keeping them good automatically, for ever, is not.

---

## What I would do

**B, with A as the fallback.** B is the only one that is unmistakably ours, and the home page is
the one surface where that is worth the risk. A is the safe answer and can ship in an afternoon
if B does not earn its place after you have looked at it in motion.

If neither convinces you, keeping the Vimeo clip is a perfectly good outcome — it is a real
ambient shot of home interiors and it works. The licence question is separate and stands either
way.

---

## The paired CRM change you asked about

**Double-checked with the anon key — the key that actually ships to visitors — and it is still
open.** Nothing has been changed; this needs your go-ahead because a half-application breaks
your live CMA page.

### What is wrong

`cma_reports` carries the policy `cma_reports_public_select` → `anon SELECT where
status='published'`. That permits **enumeration**: an anonymous caller can list *every* published
CMA, not only the one whose share link they hold. Verified just now — one row came back,
`prepared_for: "Mary Johnson"`, without knowing any link. Each row also carries `subject`,
`contact_id`, `owner_id`, `criteria`, `stats` and the suggested price range.

Only one published report exists today, so the exposure is small right now. It becomes a real
client-data leak the first time you publish real CMAs.

### The fix, and why it must ship as one change across two repos

The CRM's public CMA page reads that table directly, so dropping the policy first would break it.
Order matters:

1. **Supabase** — add `get_published_cma_report(report_id uuid)`, a SECURITY DEFINER function
   that returns exactly one published report by id. It does not exist yet (checked: RPC 404s).
   This mirrors `get_active_market_report`, which is how the identical `market_reports` flaw was
   already fixed.
2. **CRM repo** — point `apps/web/lib/data/cma-public.ts::getPublishedCmaReport` at that RPC
   instead of `.from('cma_reports').select('*')`. It is a handful of lines, and the file already
   uses this exact pattern for `record_cma_view` and `submit_cma_lead`.
3. **Supabase** — only then `drop policy cma_reports_public_select on public.cma_reports`.

I checked every other reader: `cma-public.ts` is the **only** anon consumer. `lib/data/cma.ts`
and `lead-engagement.ts` run as a signed-in agent and are unaffected, so nothing else breaks.

**Why I did not just do it:** step 2 lands in `~/realtylt-crm`, which another session owns and
which is mid-branch (`fix/brivity-parity`), and step 3 is irreversible from this side. Steps 1
and 3 also have to straddle a CRM deploy. Say the word and I will run all three in order, or
hand steps 1 and 3 to whoever is driving the CRM.

### The other open item (no CRM pairing needed)

Raw MLS `MediaURL`s are readable with the anon key — measured just now, **57 raw
`media.mlsgrid.com` URLs across 3 listings, all 57 already expired**. MLS Grid's rule is that the
raw URL must not appear on the site, and publishing it through PostgREST is worse than rendering
it. The fix is website-side only: store `/api/media/<id>/<n>` proxy paths in `listing.photos` and
keep raw URLs in transit during the sync. It touches the rate-sensitive sync path, so it wants
its own round rather than being bolted onto another change.
