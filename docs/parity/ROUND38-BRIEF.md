# Round 38 brief — the blog, the design sweep, and the launch call

Written 2026-08-23 as the seed for a fresh session (Fable orchestrator + Opus builder). The
operative summary is the top block of `POLISH_CHECKPOINT.md`; this is the detail behind it.

---

## 1. The launch question, answered honestly

He asked: *"is everything ready to launch next week?"*

**The site: yes.** It is built, audited and gated on three switches, and only two of them are still
pending:

| switch | state |
|---|---|
| 1. `NEXT_PUBLIC_SITE_URL` cleared in Vercel | **DONE 2026-07-31.** All 61 canonicals and sitemap entries are on `realtylt.com`, verified again today. |
| 2. Point the apex DNS | **Not done.** `realtylt.com` and `www` still serve the OLD vendor site. Zone is at **Namecheap**; set `A realtylt.com 76.76.21.21` and `A www 76.76.21.21`. Do NOT move nameservers to Vercel — `app.realtylt.com` (the CRM) lives in the same zone. |
| 3. Remove `PRELAUNCH=1` | **Not done, and must be last.** He should see the real domain before it becomes indexable. |

**The blog backlog: no.** Roughly twenty unpublished posts, built to the flagship's standard, is not
a week of work. Tell him that plainly and recommend the split: **launch the site next week with the
sixteen posts that exist, and run the blog as a continuing project after.** Holding a finished site
for a content backlog is the wrong trade, and promising the backlog by Sunday is the kind of claim
this repo has had to walk back before.

## 2. The blog, measured

His ask, in his words: the flagship is the standard; the Drive folder has the texts; check the facts
are correct; make them interactive and teaching, like the `/ai` page; link them internally; **link
the data sources for authority**; and build for SEO/GEO so AI agents can read and recommend them.

**What is actually true today (measured 2026-08-23):**

- **16 posts published, and all 16 are linked from `/blog`.** The index is not dropping anything.
  His "you can't find all of our blogs" is not an index bug — the missing ones were never built.
- The Drive folder holds **~35 unique `.docx` drafts** across five category folders, so roughly
  **20 are written and unpublished**.
- Drive has categories **1, 2, 3, 8, 9 only**. Folders **4, 5, 6 and 7 do not exist.** Ask him
  whether they were never written or live somewhere else.
- **Duplicates exist across folders 2 and 3** — "First-Time Home Buyer", "Down Payment", "Closing
  Costs" and "Home Inspection Checklist" each appear in both Seller Education and Buyer Education.
  Publishing both would create two URLs competing for one query, which is the opposite of the SEO
  goal.
- **`Blog plan.docx` (226 KB) in the Drive root is the master plan. Read it before anything else.**
- The standard he named is `/blog/ai-chat-assistant-real-estate-website`. Study it before writing a
  template; `docs/blog-flagship/` and the `blog` slash-command carry its history and its scoring.

**Recommended shape.** Template first, derived from the flagship. Then publish in small batches with
the facts checked and every claim's source LINKED. Volume at low quality actively hurts the GEO
goal: an assistant that finds one wrong number in a post stops treating the domain as reliable.

**The sources requirement is the interesting part** and should not be treated as a footnote. Linking
out to the primary source of every number (NAR, FRED, NY DFS, the county assessor, One Key MLS) is
what makes a post citable by an AI answer engine rather than merely readable.

## 3. The design sweep

He asked for the **`emil-design-eng`** and **`apple-design`** skills to be applied across every
page, and specifically to improve the thank-you page's photograph.

Both skills are installed. Use them as the lens for a full pass, not as a garnish. The pages worth
the most attention, from the last measured scoring run (`scripts/score-page.mjs`, the committed
60-point rubric — **use it, and prove it can fail with `--break` before quoting a number**):

| page | last score |
|---|---|
| /buying | 52.0 |
| /financing | 52.5 |
| / | 53.5 |
| /selling | 53.5 |
| /home-value | 56.0 |
| /who-we-are | 57.25 |
| /connect | 57.75 |
| /thank-you | 57.5 |

The pooled penalties that survived round 36 were: off-scale heading sizes, more than four distinct
text left edges, controls that ignore a press, focus rings under 3:1, lazy images above the fold,
and radii outside the scale. Those are the concrete targets.

**The thank-you photograph** is `public/images/hero/millerton-night.jpg`. The page around it was
rebuilt on 2026-08-22 and is good; he is now objecting to the picture itself. Options are a better
crop, a different licensed photograph, or a generated one — all three need a licence record in
`public/images/ATTRIBUTIONS.md`.

## 4. `/connect` needs a form

Measured: the page body carries **no lead form** — a phone number, an email address, and the
booking. He wants a **clickable popup form** as an alternative for people who do not want to use the
Gmail booking.

The modal lead-form pattern already exists in `components/leads/ListingLeadCTAs.tsx`. Reuse it.
Do not build a second modal system.

## 5. Accounts — the one untried route

Google and Apple sign-in are **done in code and proved in the browser**; what is missing is
configuration on his Supabase project and a Google Cloud OAuth client. Measured today:
`disable_signup: true`, `external.google: false`, `external.apple: false`.

There is no Supabase management token on this machine and no Google Cloud credential, so round 37
could not do it. **Round 38 has one route round 37 did not try: the Claude-in-Chrome browser tools,
against his signed-in Chrome profile.** He explicitly asked us to "take over Supabase and Google
Cloud". That is worth attempting, with two rules:

1. **Confirm with him before changing any project setting.** These are outward-facing, hard to
   reverse, and affect a live database.
2. **Never weaken a security control**, and never widen anything beyond exactly what is needed.

`docs/parity/OPENING-ACCOUNTS.md` is the click-by-click runbook, including the trap: email
confirmation is on and Supabase's built-in mailer is rate-limited, so opening signup without SMTP
works while he tests it and fails silently at real volume. **Deal with email before opening signup.**

## 6. What round 38 must not undo

- **The consent checkbox is one required box with no decline option.** He decided that twice, after
  hearing the argument against it twice. The reasoning is preserved in the source; do not re-open it.
- **The consent input carries no `required` attribute, on purpose.** Native validation is what made
  the footer form fail silently. The form owns the check and shows a visible error. The test asserts
  the absence of `required` and explains why.
- **New Listings does not drift.** Only Featured does, and the asymmetry is the point.
- **No new scroll-motion system.** Eleven routes already run the Reveal system; parallax and
  scroll-pinning were rejected on merit in round 37.
- **`OUTBOUND_FOLLOW_UP_LIVE` stays `false`** until the n8n flow is actually live.

## 7. The habit that cost the most time

Across rounds 36 and 37 there were **six instrument errors and zero product defects found by those
same probes**. A confident false alarm costs more than no alarm. The rules that came out of it:

- Never send a probe's stderr to `/dev/null` — it turns "the instrument failed" into "the answer is
  none", and empty is exactly what absence looks like.
- Prove a NEGATIVE result the way you would prove a positive one.
- Group form controls by `r.form`; HTML scopes a radio group by its form owner, not the document.
- Do not trust gates run against a dev server another session is actively editing.
- Strip comments before matching source, or a guard will fail on the comment explaining it.
- **When a probe shouts, check the probe first.**
