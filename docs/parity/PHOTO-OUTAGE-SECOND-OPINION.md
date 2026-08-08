# Photo outage — independent second opinion (2026-08-08)

**VERDICT: waiting on MLS Grid is NOT the only path. It is not the right path.**
The outage is caused by **our own request shape**, and the fix is one line in this repo.

MLS Grid's new media-URL builder interpolates the parent listing's prefixed `ListingKey` into the
media path. It reads that value from the **projected** Property document — the projection *we* control
with `$select`. `lib/idx/mls-grid.ts` has never selected `ListingKey`, so the field is absent from the
projection and their builder stringifies it as the literal `undefined`:

```
…/images/undefined/<uuid>.jpeg      ← what our sync gets
…/images/KEY425033768/<uuid>.jpeg   ← what the SAME feed returns, same minute, same token,
                                      when the request adds ListingKey to $select
```

This was proven by a controlled A/B against the live feed, not inferred.

---

## The proof

Two calls to the deployed probe, ~1 minute apart, same two listing ids, same OAuth token, same
endpoint, same `$expand=Media`. **Only `$select` differed.**

| call | `$select` includes `ListingKey` | URL path segment returned |
|---|---|---|
| 1 (`?ids=KEY1002709,KEY1030126&media=1&fields=ListingKey`) | yes | `KEY425033768` / `KEY426086573` — **correct** |
| 2 (`?ids=KEY1002709,KEY1030126&media=1`) | no | `undefined` / `undefined` — **broken** |

Ordering matters and is favourable: the **clean** result came **first**, the broken one second. A
"they quietly fixed it in between" explanation would have to run time backwards.

The raw Media records are identical in both calls and both carry the key perfectly well:

```json
{"ResourceRecordKey":"425033768", "Order":0, "MediaKey":"6a120c2d863ae50f5f0fa4e5",
 "MediaURL":"…/images/KEY425033768/89aba772-….jpeg"}   ← call 1
{"ResourceRecordKey":"425033768", "Order":0, "MediaKey":"6a120c2d863ae50f5f0fa4e5",
 "MediaURL":"…/images/undefined/89aba772-….jpeg"}       ← call 2
```

`ResourceRecordKey` is present and correct in **both**. The data is fine; only the *rendered URL*
differs, and it differs as a function of our `$select`.

### Which key is in the path — the prior doc is right, the probe's own comment is wrong

Across 400 listings averaging 25.6 photos each, the number of **distinct** path segments per listing
is **1.00**. Every photo of a listing shares one segment, so the segment is the *parent's* key
(`KEY` + `ResourceRecordKey`), not the per-photo `MediaKey`. `PHOTO-BACKFILL-STATUS.md`'s addendum
says `KEY<ResourceRecordKey>` and is **correct**. The comment at
`app/api/cron/mls-probe/route.ts:133-134` ("the healthy URL shape is `/images/<MediaKey>/`") is
**wrong** and should be corrected when the file is next touched.

---

## The fix

`lib/idx/mls-grid.ts`, `SELECT_FIELDS` (line 85) — add one string:

```ts
const SELECT_FIELDS = [
  "ListingId", "ListingKey", "StreetNumber", …
];
```

Why this is surgical and safe:

- `this.select` (line 147) feeds **every** query path — `replicateDeep` (251), the baseline pull (325),
  `fetchPage` (421), `fetchById` (480). One line repairs all of them.
- `ResoProperty` already declares `ListingKey?: string` (line 29). No type change.
- `mapProperty` computes `const id = p.ListingId ?? p.ListingKey` (634). `ListingId` is always
  present, so **stored ids do not change**. Nothing about our stored shape moves.
- `ListingKey` is a supported field on this subscription — the probe added it and reported
  `droppedSelectFields: []`.
- If it were ever rejected, the existing self-heal (443-445) drops it and logs, so the failure mode
  is "back to today", not an outage.

### Verification required before believing the fix (do this, do not skip it)

I could **not** confirm that a repaired URL downloads bytes. My third and final probe call fetched a
correct-shaped, freshly-signed URL and got:

```
asStored: HTTP 429  text/plain      ← "Request limit reached" — throttled, NOT NoSuchKey
bare:     HTTP 403  text/plain      ← signature stripped, as expected
```

The meaningful change is that the `404 NoSuchKey` signature is **gone**. But 429 is not 200, so
"photos actually download again" is **UNVERIFIED**. After deploying the one-line change, the first
step is the standing 12-listing probe (`--max-pages 2 --max-listings 12 --max-429 1`) and nothing
larger. The media host is throttling this account *right now*, which is an independent condition
layered under the URL bug.

I spent exactly 3 probe calls and sent no other MLS traffic. No further media requests were made
after the 429.

---

## Confirm / refute against `PHOTO-BACKFILL-STATUS.md`

| # | Prior claim | Verdict |
|---|---|---|
| 1 | Every `MediaURL` carries `/images/undefined/` | **CONFIRMED** |
| 2 | We map photos verbatim; we do not build or rewrite the path | **CONFIRMED** (code read: `mls-grid.ts:642-646`; repo-wide grep finds no URL construction) |
| 3 | "It is not our bug" | **REFUTED.** True about string-building, false about causation. Our `$select` is the trigger. |
| 4 | Blast radius "100% of the live feed" | **REFUTED as stated.** 100% of *our sync's* request shape. The same feed, same minute, returns clean URLs to a request that selects `ListingKey`. |
| 5 | Valid signature still 404s `NoSuchKey` (not expiry/403/429) | **ACCEPTED, not re-tested** — I did not re-fetch a broken URL (budget). |
| 6 | Signatures bind the path; rewriting segment → 403 | **CONFIRMED in spirit and now moot.** No rewrite needed; correct URLs come from source. |
| 7 | Missing segment is `KEY<ResourceRecordKey>` | **CONFIRMED** (segment-uniqueness = 1.00/listing; probe shows `ResourceRecordKey=425033768` ↔ segment `KEY425033768`). |
| 8 | Their media schema migrated ~Aug 5 | **CONFIRMED and now documented** — see the Sept 8 notice below. |
| 9 | Media Access subscription setting is not the cause | **CONFIRMED** (clean URLs prove the subscription serves media normally). |
| 10 | "The only fix is MLS Grid's" / "Nothing in this repo needs changing" | **REFUTED.** One line. |
| 11 | Zero-photo cohort grows 150-250/day | **PARTIALLY REFUTED.** 1,238 (Aug 7) → 1,329 (now) ≈ **60/day**, not 150-250. |
| 12 | Site serves ~26,500 already-mirrored listings normally | **CONFIRMED** — 26,421 active rows with servable photos. |

### The thing the prior investigation never found

MLS Grid publishes
[Upcoming Changes to Media Delivery — Migration Away from Amazon AWS](https://docs.mlsgrid.com/upcoming-changes-to-media-delivery-migration-away-from-amazon-aws.md).
The new `media.mlsgrid.com/token=…&expires=…&id=…/images/<KEY>/<uuid>.jpeg` format is documented as
**"effective September 8, 2026"** — and we are already receiving it, a month early. That single fact
reframes everything: the URL is now *computed at response time* from a projected field, where the old
AWS URL was a stored string. That is exactly why an unchanged request of ours broke on their deploy.

The same notice adds three consumer obligations that this codebase does **not** yet satisfy:

- **Single-use.** "The URL may be used to download its image only once. A second request using the
  same URL will fail."
- **Time-limited.** One hour from generation.
- **"Do not store or cache a Media URL for later use."**

We store every `MediaURL` in `idx_listings.listing.photos` and re-fetch it later:
`app/api/media/[id]/[idx]/route.ts:176` proxies the **stored** signed URL per request for any
unmirrored index. Under the new rules that fallback is dead on arrival and spends media-host requests
for nothing — a live 429-risk surface. Several comments still assert the opposite
(`lib/idx/media.ts:6`, `app/api/cron/sync-mls/route.ts:16`, `lib/idx/snapshot.ts:11`,
`lib/idx/replicated.ts:28` all say MediaURLs are "PERMANENT"). **This is separate follow-up work with
a Sept 8 deadline**, not part of the one-line fix.

---

## Collateral damage — none worth acting on

Rows updated before vs. on/after 2026-08-05, last 9 days (n = 6,011 before / 7,135 after). Fill rates:

| field | before | after | Δ |
|---|---|---|---|
| price, county, city, address, lat/lng, status, propertyType, listOfficeName | 100.0% | 100.0% | 0.0 |
| beds | 89.4% | 91.1% | +1.7 |
| baths | 91.9% | 93.2% | +1.3 |
| sqft | 80.6% | 81.1% | +0.5 |
| description present | 100.0% | 99.9% | −0.1 |
| description avg length | 1,092 | 1,116 chars | +24 |
| features array present / avg size | 100% / 3.65 | 100% / 3.63 | −0.02 |
| interiorFeatures | 93.1% | 94.8% | +1.7 |
| heating | 97.4% | 98.2% | +0.8 |
| cooling | 97.3% | 98.1% | +0.8 |
| propertySubType | 97.4% | 98.2% | +0.8 |
| parkingFeatures | 93.5% | 95.0% | +1.5 |
| **lotAcres** | **71.8%** | **67.7%** | **−4.1** |
| lotFeatures | 24.9% | 23.8% | −1.1 |
| exteriorFeatures | 15.7% | 14.7% | −1.0 |

A full `jsonb_object_keys` diff found **no key that disappeared**. Only `lotAcres` moves more than a
couple of points, and it moves with `lotFeatures`/`exteriorFeatures` in the same direction — the
signature of cohort composition (which listings happened to change), not a broken field. `beds`,
`baths`, `sqft`, `interiorFeatures`, `heating` all went **up**. The media leg broke; nothing else did.

`photosMirroredCount` (0.7% → 56.8%) is our own marker rollout, not upstream.

### Current state

| measure | value |
|---|---|
| active rows | 27,750 |
| active with ≥1 servable photo | 26,421 |
| active with 0 servable | 1,329 (881 first seen since Aug 5) |
| active rows carrying `undefined` URLs | 3,540 |
| …of those, still serving photos from earlier mirrors | 2,688 |
| **new objects in `mls-photos` bucket since Aug 5** | **0** |

Storage confirms a hard stop: 16,593 objects created Aug 3, 8,649 Aug 4, 25,222 Aug 5, then **nothing**.

An apparent anomaly resolves cleanly: 8-18% of rows updated Aug 6-8 still show a keyed URL. Those are
**deactivations** — the `deactivateIds` path moves `updated_at` without rewriting `listing`. Among
rows whose JSON was actually rewritten, the `undefined` rate since Aug 5 ≈ 18:07 UTC is 100%.

---

## Alternative causes — each closed

| hypothesis | outcome |
|---|---|
| **Our request shape** | **THE CAUSE.** Proven by A/B above. |
| Auth / token validity / rotation | **Eliminated.** The same token in the same minute returns correct URLs. |
| API version | **Eliminated.** `api.mlsgrid.com/v2` throughout, both calls. |
| Our cron routes corrupt URLs after receipt | **Eliminated.** `mls-grid.ts:642-646` filter/sort/slice/map, no construction; repo-wide grep finds no builder. |
| Our jsonb serialization invents `"undefined"` | **Eliminated.** The **raw probe response**, before any storage, already contains it. |
| Subscription / Media Access config | **Eliminated.** Correct URLs are being served to this subscription right now. |
| Rate limiting as root cause | **Eliminated as root cause.** The prior 404 histogram (`404:274`, zero 429s) is a path error, not a throttle. A throttle is nonetheless **currently active** (my 429). |
| Consumer-side remedy in their docs | **FOUND** — the projection/`$select` interaction, plus the Sept 8 notice. |

## Workaround hunt

- **Primary and sufficient: add `ListingKey` to `$select`.** No alternate endpoint needed.
- Client-side path repair (`undefined` → `KEY…`): **dead** — the signature binds the path (prior doc
  measured 404 → 403). Also unnecessary now.
- **RESO `$metadata`:** not needed. The probe's existing `?fields=` parameter already self-heals
  unsupported fields and let me test a new field with **zero code changes** — that is the cheap field
  oracle, and it is already deployed. No code change recommended.
- Alternate media resources (standalone `Media` resource): not required; deliberately not probed, to
  respect the request budget.

## External corroboration

Searched for other MLS Grid consumers reporting `/images/undefined/` or the migration. **Nothing
found** — results were dominated by Major League Soccer. Only MLS Grid's own docs and the RESO Data
Dictionary discuss `MediaURL` semantics.

**Absence is itself corroborating.** A genuine blanket outage of MLS Grid media would have every
vendor across dozens of MLSs complaining within hours. Silence fits a defect that only bites consumers
who omit `ListingKey` from `$select` — an unusual choice, since it is the resource's primary key and
most integrations select it by default. We are an outlier, which is why we are alone.

---

## Recommendation

1. **Add `"ListingKey"` to `SELECT_FIELDS`** in `lib/idx/mls-grid.ts`. One line.
2. Run the standing 12-listing probe with `--max-429 1`. Require zero 429s, `downloaded ≈ fetched`,
   non-zero `mirrored`. **Do not sweep before that passes** — the media host is throttling now.
3. Only then the covers-only sweep, then the gallery pass, per the prior doc's Step 3/4.
4. **Do not send the drafted support ticket as written.** It asserts an MLS Grid defect. If anything
   is worth raising, it is a much narrower question: *"should the media-URL builder depend on the
   consumer's `$select` projection?"* — arguably their bug, but ours to route around today.
5. Separately, before **September 8, 2026**: retire stored-`MediaURL` reuse
   (`app/api/media/[id]/[idx]/route.ts:176` and the "PERMANENT" comments). Single-use + 1h expiry
   becomes contractual on that date.

*Sources:* [Upcoming Changes to Media Delivery](https://docs.mlsgrid.com/upcoming-changes-to-media-delivery-migration-away-from-amazon-aws.md) ·
[API Version 2.0 — Media](https://docs.mlsgrid.com/api-documentation/api-version-2.0.md) ·
[Changes to MLS Grid Media Access](https://docs.mlsgrid.com/recent-releases/changes-to-mls-grid-media-access.md) ·
[RESO Data Dictionary — MediaURL](https://dd.reso.org/DD1.7/Media/MediaURL/)
