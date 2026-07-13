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
Make the CMA match Brivity's CMA exactly in functionality + layout/sections. We mapped it but have NO pics —
OPEN CHROME, SEE Brivity's CMA, replicate section-by-section (screenshot each page and build to match). Keep
OUR dark/purple design.

### 5. Market report + sending
Brivity has a combined CMA + Market-Reports page that GENERATES reports and SENDS them from the CRM. Build both
here (CMA + market report) with generate + send-from-CRM. Same function as Brivity, our design.

### 6. Website section in the CRM panel
Add a "Website" section in the CRM that lets the owner post blogs to the marketing website (and other simple,
useful things). Keep it SIMPLE — no fragile/complex things that break.

### 7. AI Agent page (DESIGN QUESTION — brainstorm + propose a design doc, then build v1)
Owner is deciding HOW it should work: scheduled? prompt-triggered? connect to an LLM and configure what it
does? RECOMMENDED v1 (loop confirms/refines first): an LLM-connected AI-assistant page where the owner sets
instructions/goals + picks triggers (manual run / scheduled / on-event e.g. new lead), and it drafts/sends
messages or takes CRM actions — running in TEST MODE first (drafts only, nothing auto-sent) until the owner
approves. Write the design to a doc, get it coherent, build v1, report the design + what it does.

### 8. FIX + TEST the core CRM (highest urgency — it's buggy)
- **Creating new leads is BROKEN** — fix + verify (Playwright: fill new-lead form → saves → appears in
  leads/people with correct data).
- **Filters, automations, tags must WORK** — test every one, fix, verify the data flows and displays.
- Go PAGE BY PAGE: every control clicked, every save verified in the DB, every list/detail shows correct data,
  optimized. This is a huge task — do it step by step, one page perfected at a time.

## WEBSITE + AI PAGE (keep converged; watch regressions)
Website is ship-ready (private/noindex) — blog-from-Drive is separate/owner-gated except the CRM "Website"
section (#6). AI page: keep the galaxy→brain journey + mobile; don't re-baseline goldens (owner-gated).

## OWNER-GATED (surface in CHECKPOINT under OWNER ACTION — do NOT do unattended)
Google OAuth consent + credentials (owner connects Gmail); Twilio A2P + owner's cell; the app.brivity.com
Chrome per-site permission (grant it so agents can visually study Brivity); Apple iMessage/FaceTime feasibility
(needs a Mac/Apple ID — likely a routed/owner-side piece); merge/promote/DNS; prod Supabase decision; MLS prod key.
