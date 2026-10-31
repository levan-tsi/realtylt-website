# Round 17 website lane: the one-hour AI assessment, the word, the footer

2026-10-31 evening, branch `r14-blog-preview`, from eb17556. The owner's verdict of tonight: the
call is one hour with the owner (or the owner and the manager), no separate 20-minute talks with
each person who does the work, a written plan after the call, the assessment included if he
builds and runs it, the plan as their map if they build it themselves, and why build-and-manage
beats training someone. The SEO decision: the offer is the **AI assessment**; "AI readiness
assessment" where the phrase matters; "AI audit" once per page as the synonym. Footer and header
show only info@. The seller post's text is untouched.

## Preview URLs

- https://realtylt-website-git-r14-blog-preview-levans-projects-a543d940.vercel.app/blog/ai-assessment-small-business-what-not-to-automate
- https://realtylt-website-git-r14-blog-preview-levans-projects-a543d940.vercel.app/services/ai-readiness-assessment
- The old addresses answer 308 to these (measured on the production build).

## The numbers

| | Before (eb17556) | After |
|---|---|---|
| `AI_AUDIT_POST` words (`readingTime`'s count) | 3,878 | 3,879 |
| Reading time on the rendered page | 19 min | 19 min ("19 min read" in the cold open) |
| Rendered words in `#article-root` (1680) | 6,174 | 6,174 |
| H2 / H3 in the markdown | 15 / 28 | 15 / 28 ("Who this fits" folded into the roadmap intro; "Two routes from the plan" added) |
| Rail rows | 18 | 18, none twice; the phone sheet matches |
| "audit" on the rendered AI post | many | 1 (the FAQ synonym clause) |
| "audit" on the rendered service page | many | 1 (the synonym clause in "why") |
| "75" / "20 minute" on the AI post | in the steps, "What you get", the FAQ, the scene and quiz 9 | 0 / 0 |

The words held because the additions (the plan's contents, the two routes, the retainer paragraph,
about 195 words) were paid for by cuts: the 20-minute step, the readout line, the questions
section's group-by-group summary sentence, the "Who this fits" H3 (its one rule moved into the
roadmap intro), two explanatory clauses in the one-evening steps, the agency section's last
sentence, the "so about one firm in five" summary sentence (the "In short" scene still says it),
and one sentence each in "What an assessment is for", the not-to-automate section and "What an
assessment does not do".

## The flow, as written

- **How it runs:** before the call, the written answers and the four things to send, and the
  manager if someone else runs the admin; the call, one hour on the last real week, nothing
  pitched; the notes within two business days; the scoring (impact and risk with reasons, one
  verdict per job); the plan, about three business days after the call, then **a short call to walk
  through it** (my call: the "30-minute readout" became this, with no length named); the route.
- **What you get:** the plan says what we would build and in what order, how, how long each piece
  takes, which system does which job, and the precautions (what stays with a person, what is
  checked before anything reaches a customer, how a failure shows), plus the per-job scores and
  verdicts, what was crossed off and why, and the open questions. "The notes" kept in one line.
- **Two routes from the plan** (new H3): we build and run it, the assessment is included in that
  work, and only then do we talk with each person who does the jobs being built; or they build it
  themselves, the plan is their map and the page's method is open. Then four sentences on why a
  monthly retainer to build and manage is safer and more efficient than finding or training
  someone. No price, fee, percentage, payment term or attorney line anywhere.
- **FAQ:** "How long does an AI assessment take?" = one hour on the call, the plan about three
  business days later. **Next step:** "The offer is the one-hour assessment ..."; (914) 875-2424
  and levan@realtylt.com unchanged.
- **The audit-day scene:** label "How the assessment runs"; facts One hour / Two business days /
  One plan; six steps (the "people who do the work" step is gone); the route step names the two
  routes. Quiz question 9 is "What happens on the assessment call?" with "one hour on the last
  real week"; the pass line and the pass link say "assessment".

The quiz as the test that nothing was lost (checked against the new text): 19.8 percent and the
wider 46 percent; the first question; the rule never decided; the third question removes the most
and is a fact about the business; 2.0 percent down and 2.3 up; containment first and the saving
last; read from the record or say there is none; the send step cannot run without approval, built
into the system; one hour on the last real week, nothing pitched; no 2026 survey and a number whose
method nobody can check. All ten still taught.

## Files changed

- `content/blog/ai-posts.ts`: the AI post's flow and word (above); ROUND 17 comment; in four other
  posts the `[AI audit](/services/ai-audit)` links became `[AI assessment](/services/ai-readiness-assessment)`,
  and the two that said the audit builds the first one now say the plan says what to build first.
- `content/blog/audit-scenes.ts`: rail and heading labels, the audit-day scene, alts, quiz Q9, pass line.
- `content/blog/posts.ts`: slug `ai-assessment-small-business-what-not-to-automate`, excerpt and
  seoDescription say "assessment", ROUND 17 comment. Title unchanged.
- `content/services/ai-audit.ts`: slug `ai-readiness-assessment`, name "AI Assessment", eyebrow,
  H1 "An AI readiness assessment: see where AI pays off first", lede, specs, why (with the one
  synonym), keywords, seo title "AI Readiness Assessment: Find Where AI Pays Off First", seo
  description; related post slug. File name and `aiAudit` identifier kept (code); `aiKey: "consult"` kept.
- `next.config.ts`: two permanent redirects (the post, the service).
- `app/redirects.test.ts`: the destination check now accepts a real post or service slug on the
  two dynamic routes; new tests that both moves redirect permanently and that no post or service
  is still published at an old slug (+3 tests).
- `app/services/page.tsx`: both buttons point at the new service; "Start with an assessment",
  "Read about the assessment"; the close paragraph says the assessment is an hour and ends in the plan.
- `content/services/custom-automation.ts`, `workflow-automation.ts`: related slug; "the AI assessment is the place to start".
- 14 scenes files (`agent-workforce`, `booking`, `clone`, `crm-sync`, `custom`, `document`,
  `enrichment`, `geo-pages`, `invoicing`, `local-seo`, `marketing-automation`, `review`,
  `scheduling`, `workflow`): "The AI audit is an hour, done with you" became "The AI assessment
  ...". Seven of them ended "rather than with a document" or "ends with X built/live", which the new
  flow contradicts (the assessment ends in a written plan); those now read "the plan it leads to
  starts with X".
- `components/blog/AuthorCard.tsx` (+ test): "Runs RealtyLT and the AI assessments for small
  businesses"; "I run the assessments myself: I sit with the owner, find the hours a system can
  give back to the team, and write the plan."
- `components/blog/scenes/primitives/Quiz.tsx`: the AI pass link reads "Talk to us about an AI assessment".
- `components/site/Footer.tsx`: the levan@ line removed; the comment carries tonight's word.
- `components/leads/LeadForm.tsx` (+ `components/listing/nojs.test.ts`): the no-script fallback
  line, which sits in the footer of every page, prints info@ instead of levan@.
- `lib/blog/flagship.test.ts`, `lib/blog/related.test.ts`, `components/blog/AuthorCard.test.ts`: new words and slug.
- `scripts/check-svg-crop.mjs`, `scripts/flagship-standard.mjs`, `docs/blog-r16/probe.mjs`,
  `console-404.mjs`, `tone-drive.mjs`: the new slug; the probe also records the moves, the service
  page, the "audit" lines, "75", "20 minute", levan@ in the footer and on the author card, and the
  header's mailto links. (`scripts/_scratch-r14-blog.mjs` is git-ignored; updated locally only.)
- `docs/blog-r17/shots.mjs`: two frames (service hero, the two routes). `shots/` is git-ignored.

## "Audit" left in reader-facing files

- Our offer: exactly two, the synonym clauses: the AI post's FAQ ("some firms call this an AI
  audit") and the service page's "why" ("Some firms call this an AI audit.").
- Other meanings, left as they are: the marketing automation post (a do-it-yourself check of your
  own sending: "run the audit below", "How to audit your own sending", rail "Audit your sending");
  the CRM sync post ("the one you can audit instantly", "more useful than any audit"); the voice
  agent post and its scenes and services (the 2011 HBR audit of 2,241 companies); the workflow post
  (its audit grid and two quiz hints); the enrichment post's rail "Audit your rows"; the invoicing
  scene's "audited figure"; lead qualification's "no audit of the inputs"; the homeowner and seller
  posts' checklists ("Audit your routine", "Audit your own house", "Audit before you list", "Audit
  your marketing"; the seller post is untouched).
- Code names kept: `AI_AUDIT_POST`, `AUDIT_FLAGSHIP`, `audit-scenes.ts`, `content/services/ai-audit.ts`,
  `aiAudit`, the scene keys `audit-path` and `audit-day`.

## Gate (as run, 2026-10-31 evening)

- `npx tsc --noEmit`: no errors.
- `npx vitest run`: 171 files, 2,454 tests passed (2,451 before, +3 redirect tests).
- `next build`: exit 0, 129/129 static pages; `ai-assessment-small-business-what-not-to-automate`
  and `services/ai-readiness-assessment` prerendered, no `ai-audit` page.
- On `next start` at 127.0.0.1:3108: `/blog/ai-audit-small-business-what-not-to-automate` 308 to
  the new post; `/services/ai-audit` 308 to `/services/ai-readiness-assessment`; both new pages 200.
- Probe (`node docs/blog-r16/probe.mjs http://127.0.0.1:3108 docs/blog-r17/shots`): both posts at
  320, 390, 768, 1024, 1280, 1440 answer 200 with no overflow, no hidden reveals, smallest scene
  text 11px; console only the `/_vercel/insights` 404 off Vercel; quiz at 390 fail 1 of 10 (focus
  "The black hole: try again"), pass 10 of 10 (focus "The galaxy is out and the brain is lit", link
  "Talk to us about an AI assessment -> /connect"), pass at 1440 and with reduced motion 10 of 10;
  JavaScript off 10 items, 10 details; AI post "19 min read", 18 rail rows, none twice, sheet
  matches; seller post "10 min read", 12 rows; "audit" lines on the AI post: the one synonym; "75"
  0; "20 minute" 0; footer levan@ 0; author card levan@ 1 on both posts; header mailto only info@;
  the tone drive 0 steps under 4.5:1 at 390, 1440 and 1680 on both posts; sitemap 104 URLs.
- Static HTML after the lead form fix: footer levan@ 0 on `/`, `/connect`, both posts and the
  service page; `/connect` still shows levan@realtylt.com; the author card's mailto is levan@ on both posts.
- Frames looked at: `ai-390-scene-audit-day.png` (One hour / Two business days / One plan, six
  steps), `quiz-390-pass-result.png`, `service-1440-top.png`, `service-390-top.png`, `ai-390-two-routes.png`.

## Beyond the brief

- The service page's "We build the first win" step, its limit "It ends with one automation built
  and running" and two FAQ answers promising "one automation built and running" contradicted the
  owner's flow, so they now describe the plan and the two routes.
- The seven scenes footers and two in-post links that promised a build at the end of the audit
  (above).
- The lead form's no-script line in the footer showed levan@; it now shows info@ (it only shows
  with JavaScript off; info@ delivers into his inbox the same day, per `lib/site.ts`).
- The `/services` index buttons and close paragraph (named in the brief only as a file to check).

## Not changed, and why

- The structured data (`RealEstateAgent` and the service's `provider`) still carries
  `email: levan@realtylt.com`. It is not printed on the page; it is the business's contact record.
  Say if it should be info@.
- The /ai page (another repo) still names the offer in its `consult` COPY; its links to
  `/services/ai-audit` now redirect.
- Heading "you" in pre-existing H3s ("You are almost certainly not behind", "What you want to
  build" ...) were approved in round 16 and are not new.
