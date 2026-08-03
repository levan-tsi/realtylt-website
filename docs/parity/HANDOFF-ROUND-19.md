# Handoff — round 19

Written 2026-08-02 at the end of round 18b, at the owner's request ("prepare handoff and will
clear chat and start"). This is the running order. Everything below was verified on the real
system, and where it was not, it says so.

---

## 0. First actions, in this order

1. `node scripts/_scratch-r16-debt.mjs` — freshness. If "modified in last 24h" is 0 the feed is
   frozen and nothing else matters. It was **1,319** when this was written.
2. **Ask him the two open decisions before building anything** (§1 backfill, §4 hero). Both are
   his call and both change what the round does.
3. Read `docs/parity/DESIGN-ROUND18.md` for the measurements behind everything here.

---

## 1. THE PHOTO BACKFILL — his decision, and my recommendation

**The problem, in one line:** 8,400 of 10,045 Pending listings show **one** photo when the MLS
feed holds 20–40. One photo makes a good house look like a bad listing, and it is the biggest
visible quality gap on the site.

**It is not a broken fix.** Round 17's change detection works — rows the cron has touched since
it shipped are 6% one-photo and 69% at 5+. The 84% is pure backlog, healing at ~1,300 rows a day
against 27,605 active. About three weeks on its own.

**The lever, and it is proven.** A bounded live slice ran during round 18: **72 photos fetched,
72 downloaded, zero failures.** The media host is serving.

| | |
|---|---|
| listings short of the feed | **13,382** |
| photos missing | **271,141** |
| of those, Pending | 8,077 |
| storage | ~68 GB → **$0** (250 GB plan, ~120 GB used today) |
| wall clock | ~12h continuous at the ~6 photos/sec the hourly cron sustains |

**MY RECOMMENDATION: yes, but in chunks, not one 12-hour blast.**

```bash
# 1. A real chunk first. Watch the failure count, not the clock.
node scripts/backfill-photos.mjs --max-pages 40 --max-listings 2000 --cap 30 --concurrency 3
# 2. If downloaded == fetched and failures are 0, keep going. Resumable via
#    scripts/.photo-backfill-watermark.local; --fresh restarts from the beginning.
# 3. Only then the full pass:
node scripts/backfill-photos.mjs --max-pages 999 --max-listings 999999
```

**ABORT IF** the run starts reporting fetched > downloaded, or any `Request limit reached`. That
is the exact failure that froze the entire inventory for seven days in round 16 — the media host
answers a rate limit with a 21-byte `text/plain` body under a **2xx**. `isImagePayload()` now
catches it, but a sustained 429 window still means stop and come back later.

**Photos appear gradually**, and `photos_servable` is recomputed hourly by pg_cron — so a
listing will not visibly change the second its photos land.

---

## 2. CONSENT TO CALL OR TEXT — a real compliance gap, and it is not cosmetic

His ask: *"we need to add box that will get a permission to give them a call or text on CTAs and
filling out forms."*

**Verified state: there is NO consent language anywhere on this site.** Grepped every lead
surface for `consent` / `By submitting` / `agree` / `TCPA` / `text message` — **zero matches** —
while four components collect a phone number:

- `components/leads/LeadForm.tsx`
- `components/leads/ListingLeadCTAs.tsx`
- `components/leads/QualifyingWizard.tsx`
- `components/leads/TrackedButton.tsx`

That matters more now than it did last month, because the CRM has a **live dialer and live
Twilio SMS** pointed at exactly these leads. We are about to call and text people who never
agreed to be called or texted.

**RESEARCH BEFORE WRITING THE CHECKBOX — do not copy a competitor's wording.** What to settle:

- Federal TCPA consent for autodialed/prerecorded calls and for texts, and what "prior express
  written consent" has to say and record.
- **The FCC's "one-to-one consent" rule and its current status** — it was adopted and then
  vacated on appeal in early 2025, so anything written before that is unreliable. Verify against
  the FCC and a current legal source; do NOT assert this from memory.
- New York State telemarketing rules and the state Do-Not-Call list.
- What his brokerage (United Real Estate) requires.

**What the implementation must do, whatever the wording turns out to be:**

1. An **unchecked** checkbox — never pre-ticked, never bundled into "I agree to the terms".
2. Separate the ask from the service: submitting a form to hear about a house is not the same as
   agreeing to marketing texts. Consider two checkboxes, and make the phone field's purpose plain.
3. **STORE THE PROOF, not just the flag.** The exact wording shown, the timestamp, the page URL,
   and the IP. A boolean `consent: true` proves nothing a year later. This means a schema change
   that the CRM must read — coordinate it, it is the same lead payload (`CRM_LEAD_WEBHOOK`).
4. Copy the language to the CRM so the agent sees, on the lead, exactly what that person agreed
   to before pressing dial.

**⚠️ `CRM_LEAD_WEBHOOK` in `.env.local` points at the LIVE CRM.** Test submissions land in his
real pipeline. Intercept `**/api/lead` in any Playwright run, or you will send him fake leads.

---

## 3. THE CHAT REBUILD — asked and answered: **the CRM session builds it**

His question: *"should you rebuild that chat in new session or crm session?"*

**Answer: the CRM session owns it. The website session owes it two small things.** The reasoning,
because the reasoning is what makes it stick:

**Everything hard about this is stateful, and all the state lives in the CRM.** Conversation
storage, realtime delivery, the AI-answers-first behaviour, the *turn the AI off and take over*
handoff, agent presence, read state, and Twilio SMS. The website widget is a thin client over
that: open a conversation, stream messages, render a property card. Small — once the contract
exists.

**The CRM already owns the takeover concept.** The Pause wire is live and proven on production:
pressing Pause in the CRM really does stop the n8n bot answering. Rebuilding the chat anywhere
else would fork the one mechanism that already works.

**Property search is not a reason to build it here.** The chat needs to find homes, but that is
already an HTTP API on this site — `/api/idx/search`. The CRM's AI calls it as a tool. The site
does not need to own the conversation to own the inventory.

**So the split is:**

| Side | Owns |
|---|---|
| **CRM session** | the schema, message storage + realtime, AI-first with agent takeover, the agent inbox, Twilio SMS, and the AI's tool-calling |
| **Website session** | a documented, rate-safe `/api/idx/search` contract for the AI to call; then swap the widget for the new client; keep the page-context (which listing they are on) flowing into the conversation |

**WRITE THE CONTRACT DOWN FIRST, BEFORE EITHER SIDE STARTS.** Message shape, conversation id,
who-is-speaking (visitor / AI / agent), the takeover flag, and how a property result is
represented in a message. Two sessions building against an unwritten contract will invent two
schemas and one of them will be thrown away.

**Do not let the AI hit MLS Grid directly, ever.** It searches our own database through our own
endpoint. This account has been rate-limited into a seven-day inventory freeze once already.

---

## 4. THE HOME PAGE HERO — his verdict is the blocker

Four candidates now live at `/lab/hero` on branch **`hero-lab`** (pushed; mint a fresh share
link with the Vercel MCP `get_access_to_vercel_url` — they last ~23h):

`https://realtylt-website-git-hero-lab-levans-projects-a543d940.vercel.app/lab/hero`

- **D "The Opening"** — added after he called A/B/C "really bad… I need something to make me say
  wow". A title-sequence entrance (photo settles out of over-scale, light blooms, hairline draws,
  three copy lines rise in sequence, 1.9s, once) and then a warm pool that follows the pointer so
  the valley *warms where you look*. Verified on the deployed build: 8 animations wired, the
  light tracks the pointer (29.77% → 70.19%), no errors.
- A "Depth", B "The Valley", C "Traverse" — see `docs/parity/HERO-LAB.md`.

**HIS LAST WORD WAS "this pages still look like shit the demo pages", and it is ambiguous** —
it may mean the *lab page presentation* (which is deliberately bare scaffolding: a plain white
page with paragraphs of my argument above each hero) or it may mean *the heroes themselves,
including D*. **Ask him which before spending a round on it.** If it is the presentation, the lab
page needs to stop looking like a dev tool: full-bleed variants, no essay, a way to flip between
them in place rather than scrolling past three.

Nothing has shipped to the live home page. `app/page.tsx` still plays the Vimeo clip.

**Hard constraints for whatever wins:** LCP on that page IS the hero image (measured ~1.5s dev) —
transform it, never fade it. Reduced-motion and JS-off must land the finished hero. Mobile gets a
still. No purple/gradient/neon.

---

## 5. "GENERAL BOXES AND ALL" — the design pass

His words, unelaborated. Read as: the repeated card/panel/box vocabulary across the site is
inconsistent and reads generic. Before touching anything, inventory it — the corner radii, the
border colours, the padding, the shadow, the hover state of every card, panel, tile and sheet on
home / search / listing / buying / selling / connect — and find where the same idea is drawn
three different ways. Fix the system, not individual boxes.

Corner scale already agreed and it must hold: **8px** badges/chips · **12px** buttons/inputs ·
**16px** cards/panels/media · **24px** large feature panels · `rounded-full` pills.

Invoke the `frontend-design` skill for this, and get his verdict on the hero first — the box
language should follow whatever the hero establishes, not fight it.

---

## 6. Carried, unchanged, still his call or another repo

- **Published-CMA enumeration.** Anon can still enumerate `cma_reports`, `cma_report_comps` and
  `mls_listings`. Three ordered steps; step 2 lands in `~/realtylt-crm`, and dropping the policy
  first breaks his live CMA page. Full write-up in the round-18 checkpoint block.
- **57 raw `media.mlsgrid.com` URLs** anon-readable (all already expired). Website-side fix —
  store `/api/media` proxy paths in `listing.photos`. Touches the rate-sensitive sync path, so it
  wants its own round.
- **The retired coming-soon artwork** (`public/images/mls/coming-soon.webp`, his own generation) —
  keep or delete.

---

## 7. What round 18 + 18b shipped, so nobody re-does it

- Map popup now carries the **status badge** (Pending / Coming Soon).
- **Coming-soon panel redrawn** — the old inset frame was being cropped to two stray lines on
  every card, and the type collapsed to ~10px. Frame and aperture glyph gone, square viewBox,
  two-line setting.
- **Previous / next listing**, reading `‹ PREVIOUS · LISTING 3 OF 50 · NEXT ›`, appearing from
  every browse surface (search, both home rails, Saved, county pages) and correctly absent for a
  cold visitor. Arrow keys work; the photo lightbox and the photo band keep their own ← →.
- **The listing photo band was frozen** — it moved once and stopped, because the hero was picked
  as "first surviving photo NOT in the side column" instead of "first at or after the anchor".
  Fixed as `lib/idx/photo-band.ts::heroAt`, with tests that walk the arrows.
- **/search overflowed 320 by 22px** (four un-wrappable quick filters).
- **Page size 36 → 50.** Measured: 177ms → 215ms, 87KB → 123KB. **This is LIVE and verified on
  production** — server-rendered 50 cards, stored set 50. If he still sees 36 it is a cached
  bundle in his browser; hard-refresh.

**Gates at handoff:** tsc clean · **635 tests** pass (never go below) · 0 horizontal overflow at
1440/390/320 across home, search, buying, selling, connect, financing, top-areas and a listing ·
no JS errors · JS-off renders the listing page.

---

## 8. Traps that cost time in round 18 — do not pay for them twice

- **`git checkout` under a running dev server 500s the site** until it recompiles. It recovers;
  do not panic and clear `.next`.
- **A design that only exists on an unpushed local branch has not been shown to anyone.** Use a
  `git worktree` to build/merge/push a branch without disturbing the running tree.
- **Probing map popups:** hovering leaves *stale* popup nodes in the DOM (match by address, not
  "the last one"), and price chips **overlap** (check `document.elementFromPoint` at the chip's
  centre or you hover its neighbour).
- **`style.cssText` serializes with spaces** — a selector matching `left:6px` finds nothing;
  it is `left: 6px`.
- **The entrance animation must not be gated on a JS flag** set in `useEffect`: it cannot start
  until hydration, so the finished frame flashes and then re-animates.
- **A dev-only overlay is not a bug.** The "dark circle covering a control" at 320 was
  `NEXTJS-PORTAL`; the red "1 Issue" badge is Next's cross-origin dev notice.
- **Page 1 of a `mixed` search showing fewer cards than the others is CORRECT** — the daily ring
  rotation moves the short tail page around. Verified: every listing served, zero duplicates.
- **Windows `python` hangs on this box** — use node or `wsl -e bash -lc 'python3 …'`.
- **`MSYS_NO_PATHCONV=1`** in git-bash whenever an argument starts with `/`, or it becomes
  `C:/Program Files/...`.
