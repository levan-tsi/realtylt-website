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

## WEBSITE (own loop) — data display + design polish
Proper data display everywhere (IDX listings, prices, photos, filters), design polish + color balance (keep our
dark/purple identity), responsiveness, every page/flow tested by real Playwright clicking. Stays private/noindex +
secure. The CRM "Website" blog section's marketing half (/blog display) is built — keep it correct.

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
