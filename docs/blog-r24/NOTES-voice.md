# Round 24 page lane: the AI voice agent for real estate and small business (approval 23)

2026-11-03, branch `r24-voice-agent` from `origin/main` 3aabe4a, worktree `realtylt-website-r24p`.
One branch per page. Source: the Nov 2 refresh draft
`realtylt-agents/company/agents/seo/drafts/2026-11-02-ai-voice-agent-missed-calls-real-estate.md`,
its second reader's 33 notes (approval 23 through the panel), the brief
`company/pieces/ai/ai-voice-agent-missed-calls-real-estate/brief.md`, and its four `*Editor:`
lookups (no 2025 or later source on reply speed; the four statute pages 403; the closing line's
link; the turn-taking paper's title and authors).

## What changed

| Piece | Where | What |
|---|---|---|
| The post | `content/blog/ai-posts.ts` `AI_VOICE_AGENTS_POST` | Rewritten in place: the opener says what we do (F10) and what the reader learns; real estate offices and small businesses; the live post's vendor name ("Ours runs on Vapi") gone; every story labelled invented; HBR's denominators exact (23 percent of the 2,241; 42 hours among those that replied within 30 days) and its use stated as a reason to measure your own times; the voicemail section without the unsourced behaviour claims (a missed call "may not tell you who called or why"); the four capabilities in the body with our service page as the source and the connections as the condition; outbound: an artificial-voice call needs prior express consent (FCC 24-17), telemarketing hours 8 a.m. to 9 p.m. (47 CFR 64.1200(c)(1)), the consent and hours checks before the agent dials, else a person calls; the turn-taking paper's own finding (about two tenths of a second, face to face, nothing about machines) and response delay as a design goal; the release checks beside latency; "AI assistant" disclosure, recording announced only where it happens, what happens when a caller refuses; the legal section with read dates and the refusing official pages named; New York's 250.00 definition quoted in full, "the consent of one party to the call can be enough in New York", the stricter state and federal law named; AB 2905 with its chapter, effective date and the device it applies to; the three failure modes named in the body; a named person reads every call in the trial and the agent stops after a failure that reached a caller; four new sections; a Sources section. |
| Its scenes | `content/blog/voice-agent-scenes.ts` | 15 kept (copy fixed: the call path's vendor name, "AI assistant" in the teardown, outbound only on consented lists approved by a person, the capability lines conditional, the unsourced prevalence lines gone), 5 added: never (tiles), fits (grid), worth-it (flow), roadmap (steps), quiz. The film is kept as rendered. |
| Its quiz | `content/blog/voice-quiz.ts` (+ test) | Ten questions; the test also holds that no right answer teaches unconditional recording permission or "a form is permission", and that the post carries neither the vendor name nor the old New York sentence. |
| Registration | `content/blog/posts.ts` | Title "AI voice agent for real estate and small business: answering the calls you miss" (the target phrase), search title, excerpt, description, `updated: 2026-11-03`. Slug unchanged. |
| Tests | `app/redirects.test.ts` | The three slow checks get 30 s, as on the other two branches. |

## B18

| | Live (origin/main 3aabe4a) | Page |
|---|---|---|
| Words | 2,587 | 4,572 |
| H2 / H3 | 10 / 5 | 14 / 6 |
| Scenes | 15 | 20 |

The brief's 4,000-word cap is passed by 572 words: the legal precision the second reader asked for (consent, hours, recording, the state law's scope) is most of it.

## Sources read on 2026-11-03

- FCC 24-17 (docs.fcc.gov PDF, read with pypdf): adopted February 2, 2024, released February 8, 2024, CG Docket No. 23-362; "we confirm that the TCPA's restrictions on the use of 'artificial or prerecorded voice' encompass current AI technologies that generate human voices"; "therefore require the prior express consent of the called party to initiate such calls absent an emergency purpose or exemption"; the identification of the business responsible and the opt-out for telemarketing (paragraph 28 and after).
- 47 CFR 64.1200(c)(1) (eCFR): no telephone solicitation "before the hour of 8 a.m. or after 9 p.m. (local time at the called party's location)".
- HBR, "The Short Life of Online Sales Leads", March 2011: 2,241 companies; 37 percent within an hour, 16 within one to 24 hours, 24 more than 24 hours, 23 never; "The average response time, among companies that responded within 30 days, was 42 hours"; 1.25 million leads, 29 B2C and 13 B2B companies, nearly seven times, "a meaningful conversation with a key decision maker".
- NY Penal Law 250.00 (FindLaw copy, current as of January 1, 2026): "'Wiretapping' means the intentional overhearing or recording of a telephonic or telegraphic communication by a person other than a sender or receiver thereof, without the consent of either the sender or receiver, by means of any instrument, device or equipment." 250.05 kept as the live post quoted it (read in round 48; not re-read today).
- California Penal Code 632 (FindLaw copy, current January 1, 2026): "without the consent of all parties to a confidential communication"; the confidential-communication definition and its exclusions.
- AB 2905 (Low): Chapter 316, Statutes of 2024, chaptered 2024-09-20, effective January 1, 2025 (amending Public Utilities Code 2874); the Assembly Committee on Privacy and Consumer Protection analysis of April 23, 2024: "Requires that a natural voice announcement be used to disclose whether an automatic dialing-announcing device's prerecorded message uses an artificial voice."
- Stivers and others, PNAS 2009 (as in round 48; the live turn-gap scene's figures unchanged).
- Our own: `content/services/ai-voice-agents.ts` (the capabilities, "answers in under a second" as our claim) and the assessment's scoring (the four checks and floors).

## The gate (2026-11-03, on 7a97374; the push adds only this NOTES file)

- `npx tsc --noEmit`: exit 0.
- `npx vitest run`: exit 0, 172 files, 2,472 tests passed, 0 failed.
- `next build`: exit 0, 129 of 129 pages.
- The probe (`PROBE_SLUGS=va:ai-voice-agent-missed-calls-real-estate`, exit 0, `shots-va2/report.json`): HTTP 200 at 320, 390 and 1440; scrollWidth equals innerWidth at all three; 20 scenes, 0 hidden reveals; smallest scene text 11 px (the in-short eyebrow, the template's); the first paragraph is the opener; console only the `/_vercel/insights` 404; the quiz at 390 "1 of 10", a wrong run fails 0 of 10, the right run passes 10 of 10 (the AI brand's state, link to /connect), JavaScript off 10 items and 10 `<details>`; the calculator headline moved $27,000 to $129,600 with the first slider; "23 min read", 26 rail rows, none twice, the sheet matches; one author card; footer info@ and (914) 415-7185; vendor names 0 (the live post had "Vapi" twice), em dashes 0, "Editor:" 0, the AI line present; rail tone 0 under 4.5:1 at 390, 1440 and 1680; 7,417 rendered words.
- `overflow.mjs ... 320`: exit 0; only the call-path diagram's SVG nodes inside its own horizontal scroller (the live template's design); the page does not scroll sideways.

## The frames (looked at, `shots-va/`, git-ignored)

The 390 top ("9:42 pm", the H1 in sentence case, the dek), the never tiles, the outbound grid, the fits grid at 390. What looking changed: the outbound scene's heading counted "Four ways it calls out" while its fourth card is the approval rule; it reads "Calling out, and the rules it follows" (commit 7a97374, re-gated in full).

## What needs the orchestrator's Chrome read

- https://www.nysenate.gov/legislation/laws/PEN/250.00 and https://www.nysenate.gov/legislation/laws/PEN/250.05 (the official text; the page quotes 250.00 from FindLaw's copy).
- https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=632 and https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PUC&sectionNum=2874 (AB 2905's section as enacted).
Saved beside the piece in `sources-browser/`, then the "refused our automated reader" lines can name the official read.

## The second reader's 33 notes

Applied: 1 to 16, 18 to 25, 27 to 32 (each in the table of changes above: the invented-example labels, the denominators, the measure-your-own framing, the call-log list, the behaviour claims, the narrow missed-call point and quiz question 2, the capability source and conditions, the inquiry channels, the TCPA consent and hours, the consent-checked callback example, the turn-taking inference removed, response time as a design goal, the release checks, the transcript's limits, the claims about other providers, the disclosure policy without caller-preference claims, AB 2905's scope and date, "AI assistant", the conditional outbound FAQ, the attorney review without an hour, the three failure modes, only settled and approved rules become defaults (quiz question 7), the floors 3 and 4, the approval gate for binding actions and outbound lists, the trial schedule labelled, the review owner and the stop rule, the conditional calendar and CRM answer, the self-call without a duration or a majority claim, the slogans replaced, the mid-post booking ask: the offer scene is a free script, not a booking, kept; the closing link is the assessment page).
- 17 (New York recording): applied with the definition quoted from a publisher's copy and the conclusion narrowed to "can be enough", the stricter state and federal law named; the official page is a Chrome-read question.
- 26 (impact 1 or 2): applied as our method's verdict rule, named as ours, the assessment post linked.
- 33 ("checked by Levan"): as on every page, his desk step before main.

## Open for him or the orchestrator

- The Chrome reads above.
- A legal reading for him or his attorney: the page says one party's consent "can be enough" in New York and to plan for California's rule on a California caller; whether he wants that line at all, or only "ask your attorney".
- Our service page says the agent answers "in under a second"; the page calls it a design goal and our page's description. His confirmation from a real test, or the page drops the figure.
- The calculator keeps the live post's commission input and its 5 percent close rate (labelled as our assumption); a per-deal figure on a page is on the brand's never list. Keep (the reader's own number), or replace with an hours-based calculator.
- The film (45 s, his licensed voice clone) is kept as rendered and was not re-heard this round; its caption and description are unchanged. If its staged call says "assistant" without "AI", a re-render is a paid generation and his word.
