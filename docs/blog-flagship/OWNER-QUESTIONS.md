# The questions only the owner can answer

---

## 0. THE ONE THING BLOCKING A CLEAN DOMAIN — one `git push`, yours to give

**realtylt.com/ai is still serving every claim this rollout spent eight rounds killing**, and the
worst of it is in machine-readable form. Measured on the live deployment on 2026-08-26:

| where | what is live right now |
|---|---|
| **two FAQPage JSON-LD answers** | "78% of deals close with whoever responds first" |
| **`/ai/llms.txt`** | the same figure, on the file written specifically for AI answer engines |
| visible page copy | the same figure, x5 in the served HTML |
| the runtime service copy | the unsourceable 73%, "unlimited parallel agents", and the review-gating sentence SERVICES-CRITIQUE called the most serious item on the whole surface |

Three things make this the top item rather than a loose end:

1. **JSON-LD and `llms.txt` are the two most liftable surfaces on the domain.** This is precisely
   the form an AI answer engine quotes verbatim. The number has no published report, no stated
   sample and no methodology, and this site's own flagship post says so.
2. **This repo links into it 29 times** from 20 scene files. A reader who follows our own link out
   of the article that debunks 78% is shown 78% two clicks later.
3. **`next.config.ts` is what puts it on the domain** — `/ai` is a rewrite to the separate
   `realtylt-ai-page` project. So this is not another team's problem; this repo publishes it.

**The fix is already written, verified and committed** in the `realtylt-ai-page` repo (stamp
`20260825g`): all seven claims corrected, the reviews panel rewritten to the compliant mechanic,
rendered and read at desktop and phone, sweep 72/0 and cursor law 13/0. It has never been
deployed because the standing rule on that repo is that **you review the /ai page before it goes
out**, and that rule has been kept.

**It needs one word from you.** Deploying it also fixes the same claims on this domain, because
of the proxy.


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
New York is one-party consent (the telephone definition is Penal Law 250.00(1), "wiretapping",
and the offense is 250.05); California is all-party (Penal Code 632). If it records, the page has
to say so and say what it does when the caller is out of state. **If it only stores a transcript,
saying that plainly is a selling point** and the question goes away.

> **ROUND I, and this one is now urgent rather than tidy.** Two things changed around this
> question while it sat open for eight rounds.
>
> **First, the flagship post has been answering it since before the rollout began, and nobody
> noticed.** `content/blog/ai-posts.ts` states as OUR POSITION that *"the agent says that it is
> an assistant and that the call is recorded, at the start of the call rather than in a rushed
> sentence at the end"*, and the post's illustrated transcript
> (`content/blog/voice-agent-scenes.ts`) has the agent saying *"I record calls so nothing gets
> lost between now and the morning."* So the site already tells a reader that the product records
> audio, on the article the voice service page links to first, while this list records the same
> fact as unknown. Round A's rule ("unknown product facts are REPORTED, never written") was
> written for the services surface and never swept the five ORIGINAL posts, which is how the
> claim survived. **Round I did not touch it**, because deleting a claim that may simply be true
> is as much an owner decision as writing one, and because the answer to this question settles it
> either way. If the build records, both sentences are correct and the only work is on the
> service page. If it does not, two sentences on the flagship post are wrong and one of them is
> in a transcript a visitor reads as a demonstration.
>
> **Second, the service page is no longer silent.** `content/services/ai-voice-agents.ts` now
> carries a `limits` entry and a FAQ that state the RULE without asserting which side of it we
> are on: the caller's state governs, New York is one-party and California is all-party, an
> inbound line that takes out-of-state calls has to be built for the stricter rule, and whether a
> given build keeps audio or only the transcript is a setup decision. That closes the silence
> SERVICES-CRITIQUE §5 raised. It does not close this question, and it is deliberately written so
> that either answer can be dropped into it in one sentence.

**1.4 Does the skip-tracing pipeline scrub the DNC registry before anything dials?**
And **what permitted purpose is our own enrichment account established under?** The skip-tracing
page and post are built on the DPPA and the FCRA. These two answers decide whether what the page
describes is what runs.

**1.5 Does anything we build ever touch a client or escrow account?**
The invoicing page deliberately says nothing about how commission is disbursed because no primary
source established it. If a build touches funds at all, that changes what the page must disclose.

**1.6 Is there a written consent document for a clone, and what does it say?** (added round H)
New York Civil Rights Law section 50 makes it a **misdemeanour** to use a living person's likeness
or voice for advertising or trade without written consent obtained FIRST. When the person is you
that is a document you sign once, and the clone page and post now both describe it: it should name
the person, say what may be made from the recording, say how long the permission lasts and say
what happens when they revoke it. **If no such document exists, the first step on that page is
aspiration.** The same question with more teeth: **what happens to a colleague's model when they
leave the brokerage?** Their likeness is theirs, and section 50 does not stop applying on the day
somebody changes firms.

**1.7 Does every clone video carry a spoken line saying it was made with an AI avatar?**
(added round H) This is the single most load-bearing product claim added to any page this round.
The page now says every video says it. The reason it is under legal exposure rather than under
positioning is that the FTC has **proposed** a rule making it a violation to provide goods or
services knowing they will be used to impersonate, which would reach the people who build one as
well as the people who publish one. That proposal is not law today, checked in the eCFR itself.
It is also the only control that works, because published research says the viewer cannot tell.

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

**AI clone** (added round H)
- Is there a **list of sentences the script layer may never generate**? School districts, tax
  figures, boundaries, permit status. The page says these are decided by a person in advance.
- Is there a **review step before a video sends, and who is named for it**? The whole calculator on
  that post rests on the answer being yes and on somebody owning it.

**AI audit** (added round H)
- Does the audit actually produce a **written list of what NOT to build**? That is the fourth card
  of the post's main scene and the argument of the whole article. If the deliverable is only the
  shortlist, the page describes a better product than the one that ships.
- Does it end with **one automation built and running**? Claimed before this round and kept.
- **What does it cost, and is a "no" genuinely cheap?** The post says it is priced so that the
  answer being no costs you almost nothing. That is a commercial fact only you can confirm.

**Custom automation** (added round H)
- Do builds **fail loudly**, and where does the alert go? The post names this as the highest-return
  item in the whole subject and the page now says the chain does it.
- Is there a **written handover document** with each build, in the language of the business? Added
  as a step on the page this round. If it is not produced, that step should come back out.
- Does a client's build run in an **environment and on credentials they control**?
- Is there a **review date** on anything we have already built? The post says nothing retires
  itself and a date in a calendar is the only mechanism that ever switches one off.

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

**3.4 The /ai COPY drift is now thirteen keys wide.** (added round H) Round G recorded nine.
Round H changed four more, all on pages whose own articles contradicted them: `ai-audit`'s `lede`,
`specs` and `why` all promised a list "ranked by payback", and `custom-automation`'s `why` said a
build is done "Once, then forever". Every change was made because the page could not support the
claim. Reconciling thirteen keys between `content/services/*.ts` and the COPY object in
`realtylt-ai-page` is a decision rather than a task, and it gets less optional each round.

**3.5 Two vendors are named as a quality benchmark on the clone page, and it was left alone.**
(added round H) `ai-clone.lede` and `ai-clone.specs` say "A HeyGen-class video avatar plus an
ElevenLabs-class voice clone". That is a claim about how good our avatar is, made by comparison,
about a pipeline this round was instructed not to touch. **Flagged rather than changed**, because
changing it would be both a widening of the drift above and a statement about the avatar.

---

## 4. Not a question — a deploy waiting on you

The **ai-page** repo has two commits sitting local: the dive-beat graphics fix and a copy
realignment that kills seven claims which contradict the services surface (including a reviews
panel that literally described review gating). `next.config.ts` rewrites
**realtylt-website.vercel.app/ai to that project**, so those seven claims are currently visible
on the website too — **deploying the ai-page cleans both surfaces at once.**
