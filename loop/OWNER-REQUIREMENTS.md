# OWNER REQUIREMENTS — 2026-07-13 (TOP PRIORITY — main reads this EVERY cycle and passes the relevant section to each sub-agent)

Direct owner directives. They OVERRIDE earlier phase notes where they conflict. The job now: make the CRM
(primary focus) + website + AI page work PERFECTLY — Brivity-accurate in FUNCTION, with OUR polished design —
everything proven by real clicking (Playwright), data saved to the DB and displayed correctly.

## HARD EXECUTION RULES (every cycle, no exceptions)
- **MAX 3 sub-agents running at once** (1 main + ≤3 subs). More may FREEZE the machine. If more than 3 pieces
  of work exist, run them in BATCHES of ≤3 — finish a batch, then spawn the next.
- **Never two agents on the SAME repo/tree at once** (they collide). So ≤1 sub-agent per property at a time; a
  property's sub works its pages STEP BY STEP within its deep session. (Use git worktree isolation only if you
  genuinely need parallel same-repo page work.)
- **VISUALLY study Brivity — do NOT guess from text maps.** Use Playwright/Chrome to OPEN and SEE the real
  Brivity page, copy its functionality + layout, THEN build ours. (Brivity auth: owner is logged into
  app.brivity.com in the Chrome extension. NOTE: a headless loop sub-agent may NOT be able to reach the
  interactive Chrome MCP — if so, use the committed screenshots in `docs/brivity-ref/` that an interactive
  session captured, and FLAG any page still lacking a real screenshot as "needs interactive Brivity capture".)
- **DESIGN: keep OUR current dark theme with PURPLE accent details — the owner LIKES it.** Do NOT switch to
  Brivity's black/white. Just POLISH: better color balance, spacing, hierarchy, hover/focus/empty/loading/error
  states. Match Brivity's FUNCTIONALITY + LAYOUT/structure, NOT its colors.
- **TEST EVERYTHING by real interaction** (Playwright clicking every control) and VERIFY the data saves to the
  DB and displays correctly. Fix what's broken before moving on.

## REFERENCE MATERIALS (captured 2026-07-13 — BUILD to match these, then do a FINAL comparison check)
Real visual + functional references are now on disk. STUDY them before/while building the matching page, and at
the end compare your result against them to confirm it's the same + right.
- **Brivity CRM reference** (CRM clone `/root/realtylt-crm-fix/docs/brivity-ref/`):
  - `crm/` — `crm-visual-functional-reference.pdf`, `crm-functionality.html` (contacts, leads, phone, email
    timeline, tasks, transactions, automations, Gabbi, reporting, client-activity view).
  - `cma/` — `brivity-cma-market-reference-complete.htm`, `cma-example-report.pdf`, `market-report-example.pdf`,
    `brivity-open-and-view-reports.gif` (the CMA + market-report design, example outputs, and the view flow).
  - `settings/` — `brivity-website-reference.html` (Gmail/Twilio integration + website/content screens).
  - Plus the existing `BRIVITY_REFERENCE.md`.
- **realtylt.com reference** (website repo `docs/reference/live-2026-07-13/`): `realtylt-full-reference-part1.pdf`,
  `realtylt-full-reference-part2.pdf`, `realtylt-functionality.html` (full live-site design + functionality,
  public + client-account experience).
Note: these are large PDFs/HTML/GIF — read the FUNCTIONALITY html/md for text, open the PDFs/GIF for the visuals;
don't dump entire binaries into context.

## CRM — THE MAIN FOCUS (isolated clone `/root/realtylt-crm-fix`, previews only; NEVER touch `/root/realtylt-crm`)

### 1. Email — DIRECT Gmail integration IN CODE (NOT n8n)
Build a real Google/Gmail connection in the CRM (Gmail API + OAuth "Connect your Google account" flow),
**not routed through n8n.** WHY: a direct connection lets the CRM SHOW the full email history/thread with each
contact (what was sent to & received from that person) — exactly like Brivity. n8n-only send gives no
per-contact email visibility. Send from the connected Gmail; store + display the per-contact email timeline
(sent + replies). Owner-gated piece: the Google OAuth consent/credentials (owner clicks "Connect") — build the
flow so the owner can authorize.

### 2. Twilio — DIRECT integration IN CODE (NOT n8n)
Build Twilio directly in the CRM: SMS + voice/calls, inbound-reply + status webhooks, call recordings + history
stored and SHOWN per contact. Use n8n ONLY where a direct build isn't possible or would over-complicate — keep
it simple, don't break things. (The existing n8n Twilio/Gmail creds can seed config, but the integration lives
in CRM code.)

### 3. Phone section (calls / recordings / history) + channel choice
In the phone section (or Settings): an option to CHOOSE the call/text channel — **Twilio** OR **iMessage /
FaceTime** (Apple) — owner picks which to use; OR "use iMessage always, and if the recipient has no iPhone,
fall back to regular SMS." Show call recordings + call history per contact.

### 4. CMA report — exactly like Brivity (function + layout), OUR design
Make the CMA match Brivity's CMA exactly in functionality + layout/sections. **Reference pics + example reports
ARE NOW CAPTURED** — see REFERENCE MATERIALS below (docs/brivity-ref/cma/: the full HTML reference, an example
CMA report PDF, an example market-report PDF, and a GIF of the open-and-view flow). Build to match them, then do
a FINAL comparison check against them. Keep OUR dark/purple design.

### 5. Market report + sending
Brivity has a combined CMA + Market-Reports page that GENERATES reports and SENDS them from the CRM. Build both
here (CMA + market report) with generate + send-from-CRM. Same function as Brivity, our design.

### 5b. CMA + Market reports are CLIENT-FACING too (owner update — ties to client accounts)
CMA and market reports are connected to realtylt.com: **a logged-in CLIENT can see their CMA + market reports,
generate/run them themselves, RECALCULATE / adjust things inside the report, "RAISE THEIR HAND" (request the
agent / express interest), and open a DIRECT CHAT.** So the CMA/market-report feature has two sides: the CRM
(agent generates + sends + sees engagement) AND the website client portal (client views + self-serves +
recalculates + raises hand + chats). Build both; the client's report activity flows back to the CRM (see the
client-accounts requirement).

### 6. Website / blog section in the CRM panel — DEFERRED (do LAST, near the end)
Owner update 2026-07-13: **leave blogs for now, build at the very end.** The owner has blog content files on
Google Drive to import later. The marketing-site `/blog` display half already exists (keep it, don't expand).
Do NOT spend loop budget on the CRM blog-authoring section yet — it's the last thing. Skip this until the CRM
is otherwise operational.

### 7. AI Agent page + AI ASSISTANT ("our Gabbi") — match or beat Brivity's Gabbi
Brivity has an AI assistant called **Gabbi**. Build OUR own CRM AI assistant/agent, LLM-connected (default to the
latest Claude), **same or better than Gabbi.** First: study what Gabbi can DO (its abilities — drafting replies,
lead follow-up, summarizing a contact, suggesting next actions, answering questions about the pipeline, etc.) via
the Brivity visual study, then design ours to match/exceed. Two related surfaces:
  (a) **AI assistant** — an in-CRM chat/assistant (like Gabbi) the owner talks to: ask about contacts/pipeline,
      draft messages, summarize a lead, suggest next steps. LLM-connected.
  (b) **AI Agent page** — configure autonomous behavior: owner sets instructions/goals + triggers (manual /
      scheduled / on-event e.g. new lead), it drafts/sends or takes CRM actions — TEST MODE first (drafts only,
      nothing auto-sent) until approved.
Write the design to a doc, build v1, report what it does. (The orchestrator/main can be "connected to it" as the
LLM backend, or use the Claude API directly — pick the clean path.)

### 8. FIX + TEST the core CRM (highest urgency — it's buggy)
- **Creating new leads is BROKEN** — fix + verify (Playwright: fill new-lead form → saves → appears in
  leads/people with correct data).
- **Filters, automations, tags must WORK** — test every one, fix, verify the data flows and displays.
- Go PAGE BY PAGE: every control clicked, every save verified in the DB, every list/detail shows correct data,
  optimized. This is a huge task — do it step by step, one page perfected at a time.

## WEBSITE (own loop) — data display + design polish + CLIENT ACCOUNTS
Proper data display everywhere (IDX listings, prices, photos, filters), design polish + color balance (keep our
dark/purple identity), responsiveness, every page/flow tested by real Playwright clicking. Stays private/noindex +
secure. The CRM "Website" blog section's marketing half (/blog display) is built — keep it correct.

### CLIENT ACCOUNTS + ACTIVITY → CRM (owner priority — big feature, like Brivity's consumer portal)
realtylt.com has a **client login/account** (visitors register + sign in). Logged-in clients can **save/favorite
listings, save searches**, and their **behavior is tracked** (which listings they viewed, what they opened, when,
what they liked/saved). All of this must flow to the **CRM**: on a contact/lead's page the owner sees **that
client's saved + liked listings, saved searches, viewed properties, and engagement timeline** — so the owner
knows what each client actually wants + how active they are. The website client account is **linked to the CRM
contact** (same person — "the login matches the CRM"). Build BOTH halves: (a) website side — register/login,
save/favorite/saved-search, activity capture; (b) CRM side — per-contact activity/engagement view. Study how
Brivity does it (agent-side view = CRM screenshots; consumer side = the realtylt.com logged-in capture).

## AI PAGE (own loop) — polish + responsiveness + the lead pipeline
- **FIX THE SCROLL BUG (owner-reported, annoying):** on the AI page, scrolling DOWN sometimes "shoots back to the
  START instead of scrolling down"; after several tries it finally goes down. The scroll-driven journey is
  hijacking/fighting native scroll. Make scrolling smooth + predictable (down = down, first try) at desktop AND
  mobile — this is a real UX defect, fix it properly (research mobile/scroll-driven WebGL scroll handling if needed).
- **Polish design + responsiveness** (mobile-first, 390 portrait, touch, 60fps); keep the galaxy→brain journey +
  camera rig intact; golden re-baseline is owner-gated.
- **Lead pipeline (cross-cutting — see below):** the "Work with me" / "Book" CTAs must create a CRM lead + fire a
  notification.

## CROSS-CUTTING — new lead → CRM + NOTIFICATION (owner priority)
When a visitor clicks **"Work with me" / "Book"** on the AI page (and any website lead), it must arrive in the CRM
as a **new lead** (via the lead→contact pipeline — already wired: /api/lead → public.leads → mirror trigger →
public.contacts) AND the owner must get a **NOTIFICATION that a new lead came in** (in-CRM notification/badge, and/
or email/SMS to the owner). Build the notification path + verify end-to-end (safe test lead, then delete).

## OWNER-GATED (surface in CHECKPOINT under OWNER ACTION — do NOT do unattended)
Google OAuth consent + credentials (owner connects Gmail); Twilio A2P + owner's cell; the app.brivity.com
Chrome per-site permission (grant it so agents can visually study Brivity); Apple iMessage/FaceTime feasibility
(needs a Mac/Apple ID — likely a routed/owner-side piece); merge/promote/DNS; prod Supabase decision; MLS prod key.
