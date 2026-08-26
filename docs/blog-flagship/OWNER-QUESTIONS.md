# The questions only the owner can answer

Every one of these was surfaced by a build round that needed the answer and **wrote nothing**
rather than guess. They are collected here from ROUND-A..H-LOG.md so they can be worked through
in one sitting instead of read out of eight files.

**Why they matter more than they look.** In each case a page now describes the honest, compliant,
or checkable version. Where the BUILD does something different, **it is the build that has to
move**, not the page. Three of them carry legal exposure; those are first.

---

## 1. Legal exposure — answer these before launch

**1.1 Does review automation, as built, send the Google review link to everyone?**
The service page and the blog post now both describe: everyone gets the same link, and a low
score ALSO opens a private line to you. If the build still sends the link only to high scorers,
that is review gating, which Google's contribution policy names as something merchants may not
do ("selectively solicit positive reviews"). *Pages say the compliant thing; the build is what
changes.*

**1.2 Does the review widget on a client's own site show "best" or "recent" reviews?**
16 CFR 465.7(b) turns on **misrepresentation**, not on selection. A block labelled "a selection
of recent reviews" sits in a different position from one that implies it is all of them. The
pages now say "a selection of recent reviews". Confirm the widget matches the label.

**1.3 Does the voice agent record audio, or only store a transcript?**
New York is one-party consent (Penal Law 250.00); California is all-party (Penal Code 632). If
it records, the page has to say so and say what it does when the caller is out of state. **If it
only stores a transcript, saying that plainly is a selling point** and the question goes away.

**1.4 Does the skip-tracing pipeline scrub the DNC registry before anything dials?**
And **what permitted purpose is our own enrichment account established under?** The skip-tracing
page and post are built on the DPPA and the FCRA. These two answers decide whether what the page
describes is what runs.

**1.5 Does anything we build ever touch a client or escrow account?**
The invoicing page deliberately says nothing about how commission is disbursed because no primary
source established it. If a build touches funds at all, that changes what the page must disclose.

---

## 2. Does the build do what the page now says? (per service)

**Skip tracing / enrichment**
- Do builds record a **source and a date** on every enriched row?
- What is the **default overwrite behaviour** on an enrichment pass — does it fill blanks only,
  or does it also replace values that were already right?
- Does the BatchData response carry an **age** we could pass through to the client?

**Document processing**
- Do builds **abstain**, or always return a value with a confidence attached?
- Where does a flagged value go, and **who works that queue**?
- Do we store the **source document and page number** with every extracted value?

**Scheduling** (the two most consequential in the whole set — an article rests on them)
- When a showing needs another office's approval, does the build tell the client **a time or a
  request**?
- Does it **release a held slot** when the proposal dies?
- What does it do with a counter-offer ("not eleven, maybe two")?
- How many chases before a person is told?
- Does it re-ask for confirmation when an appointment moves?

**Booking**
- Does the booking layer send a **real calendar invitation**, and what calendar access does it
  request?

**Marketing automation**
- Do builds set up **SPF/DKIM/DMARC** on the client's sending domain, or assume it is done?
- Is **Google Postmaster Tools** set up for the clients we send for?

**Invoicing**
- Does anything in the build actually **ask whether an outside event happened** (the referral that
  closed in another office)?
- How does it decide a payment was received — a bank feed, or an email?
- Is the 3/7/14 day chase cadence a default or fixed?

**Local SEO / area pages**
- Do we **manage** the Google Business Profile, or advise on it?
- Is the **human editing step on area pages default or optional**? The geo post's entire argument
  rests on this one.

---

## 3. Product and positioning decisions

**3.1 The service tiers disagree with the blog cohort.** `skip-tracing` is tiered flagship with
(until this rollout) no post; `database-reactivation`, `workflow-automation` and
`lead-qualification` sit at core or "more" while carrying 3,400+ word researched posts behind
them. Three services have far more audited material than their page uses. Retiering is your call;
the material is already written.

**3.2 The ten consumer placeholder posts.** They are noindexed, out of the sitemap, and no longer
listed on /blog, so nothing leads a visitor to them. They still resolve by direct URL and still
render "[Placeholder draft...]". They need real articles or deletion — a decision, not a task.

**3.3 Films.** Every new post scores 17/19 rather than 19/19 because C3 wants a film and videos
are held by you. Nothing is faked. Say the word and the films become a round.

---

## 4. Not a question — a deploy waiting on you

The **ai-page** repo has two commits sitting local: the dive-beat graphics fix and a copy
realignment that kills seven claims which contradict the services surface (including a reviews
panel that literally described review gating). `next.config.ts` rewrites
**realtylt-website.vercel.app/ai to that project**, so those seven claims are currently visible
on the website too — **deploying the ai-page cleans both surfaces at once.**
