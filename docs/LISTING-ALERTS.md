# Listing alerts — the website/CRM contract

Written 2026-07-28 (round 11). The website captures who wants alerts and what they want alerts
about. **The CRM sends them.** Nothing in this repo emails anybody, and nothing here should.

Before this round the website stored an `alerts` boolean and nothing else usable: the only
machine-readable description of a saved search was `query`, a URL query string in the website's
own grammar. So the marketing copy had been deliberately weakened to "Save any search and turn
on alerts for new matches" — true about the switch, silent about the outcome. This is what
makes the claim honest again.

---

## Path 1 — a visitor with an account

Their saved searches are rows in `public.portal_saved_searches`:

| column | who writes it | what it is |
|---|---|---|
| `client_id` | website | `portal_clients.id`, which is `auth.users.id` |
| `label` | website | what the visitor named it |
| `query` | website | the raw `/search` query string, so you can link straight to results |
| `alerts` | website | the visitor's switch, toggled in `/portal/searches` |
| `criteria` | website | **structured filters — read this one** |
| `last_alerted_at` | **CRM** | set it when you send. The website never writes it. |

`criteria` is produced by `lib/idx/criteria.ts`, which runs `parseFilterParams` — the same
validated parser `/api/idx/search` and `/api/idx/pins` run on every live request. That is the
point: a saved search can never describe something the search itself would not do. An area we
do not serve, a negative price, a property type off the whitelist — all of them fall out here
exactly the way they fall out of a live query. Keys are the `SearchParams` field names
(`county`, `priceMin`, `priceMax`, `bedsMin`, `bathsMin`, `sqftMin`, `sqftMax`, `propertyType`,
`rental`, `garageMin/Max`, `lotMin/Max`, `yearMin/Max`, `taxMax`, `withPhotosOnly`,
`newWithinDays`, `q`). Absent filters are absent keys, never nulls.

Rows written before 2026-07-28 have `criteria = null`. There were none in production when this
shipped, and the website tops a row up the moment its alerts switch is turned on, so a null
`criteria` on an active subscription should not exist.

### Read it through the view

```sql
select * from public.listing_alert_subscriptions;
```

One row per saved search with `alerts` on, joined to the subscriber:
`subscription_id, client_id, contact_id, email, full_name, phone, label, query, criteria,
created_at, last_alerted_at`.

The view is `security_invoker`, so the CRM's existing `portal_saved_searches_crm_read` /
`portal_clients_crm_read` organisation policies decide what it can see — the view invents no
visibility of its own. `anon` is revoked outright: it carries subscriber email addresses, and
an anon-readable view over those is the same defect class as the `market_reports` enumeration
this project already had to fix once. Verified: anon gets `42501 permission denied`,
service_role gets the rows.

## Path 2 — a visitor without an account

Most visitors. Their saved searches live in `localStorage` and the CRM can never see them, so
there is no row to subscribe. Instead, `/saved` offers an alert opt-in, and when it is
submitted the searches travel **with the lead**:

```jsonc
POST /api/lead
{
  "name": "…", "email": "…", "source": "/saved",
  "savedSearches": [
    { "label": "Dutchess County, NY · 3+ bd · $400K+",
      "query": "county=dutchess&priceMin=400000&bedsMin=3",
      "criteria": { "county": "dutchess", "priceMin": 400000, "bedsMin": 3 } }
  ]
}
```

The same list is also folded into the lead's `message` under `[Listing alerts requested]`, the
way the qualifying-wizard answers are, so the request is actionable in a plain CRM view that
only shows the note field. The payload is bounded defensively (20 searches, 120-char labels,
600-char queries, scalar criteria values only) — see `parseSavedSearches` in `lib/leads`.

The opt-in only renders when the visitor actually has saved searches. Offering to watch "the 0
searches above" is worse than not offering.

## What the CRM still owes

1. A scheduled job that, per subscription, runs `criteria` against `idx_listings` and finds
   matches newer than `last_alerted_at` (or `created_at` on first run).
2. The email itself, and writing `last_alerted_at` after a successful send.
3. Turning a Path-2 lead into a real subscription — today it arrives as a lead with the
   searches attached, and somebody or something has to act on it.

## On the marketing claim

The home carousel says "Save a search and get new matches by email" again. That wording was
chosen to be true on the day it shipped, not just after (1) and (2) land: the view hands Levan
a list of who subscribed and exactly what they asked for, and answering it by hand is a real
service, seven days a week, which is what the rest of the site already claims. What the copy
deliberately does NOT say is "the moment it hits the MLS" or "before the portals do" — that is
precision the automation has to earn first.

When the CRM's sender exists, the claim can get its timing back.
