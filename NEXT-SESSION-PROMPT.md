# Paste this to start round 38

Run `/website` first, then paste the block below.

---

Round 38. You are the **Fable orchestrator**; spawn **ONE Opus builder** at a time (`model: "opus"`)
— one subagent only, the box freezes with more. The builder builds and reports; you scope, verify
and push. Subagents never push and never touch RLS, auth, CSP or any security control.

**Read `POLISH_CHECKPOINT.md`'s top block and `docs/parity/ROUND38-BRIEF.md` before anything else.**
They carry the measured state, and a list of five things not to undo — a fresh session's instinct
will be to "fix" three of them.

The work, in priority order:

1. **The blog.** The biggest piece. 16 posts are published and all 16 are linked, so the index is
   fine — the gap is that ~20 more are written in Drive and were never built. Read `Blog plan.docx`
   in the Drive root first, then study the flagship
   (`/blog/ai-chat-assistant-real-estate-website`) and build a reusable template from it before
   writing a single post. Facts checked, sources LINKED (that is what makes a post citable by an AI
   answer engine), internally linked, interactive and teaching like the `/ai` page. Watch for: Drive
   categories 4-7 do not exist, and four posts are duplicated across the Seller and Buyer folders.
   Publish in small batches. Volume at low quality hurts the GEO goal more than it helps.

2. **The design sweep.** Apply the `emil-design-eng` and `apple-design` skills across every page as
   a lens, not a garnish. Weakest first: /buying 52.0, /financing 52.5, / and /selling 53.5. Use
   `scripts/score-page.mjs` and prove it can fail with `--break` before quoting any number.

3. **The thank-you page photograph.** The page is good; he is objecting to the picture. Better crop,
   different licensed photo, or generated — any of them needs a licence record in ATTRIBUTIONS.md.

4. **`/connect` needs a popup lead form.** The page body has none today. Reuse the modal pattern in
   `components/leads/ListingLeadCTAs.tsx`; do not build a second modal system.

5. **Google + Apple sign-in.** The code is done and proved; the configuration is not. He asked us to
   "take over Supabase and Google Cloud". The untried route is the Claude-in-Chrome tools against
   his signed-in profile. **Confirm with him before changing any project setting**, and deal with
   SMTP before opening signup or it fails silently at real volume.

6. **The launch.** He wants to go live next week. Tell him the split honestly: the site is ready and
   needs two switches that are his (apex DNS, then remove `PRELAUNCH=1`); the blog backlog is not,
   and should not hold the launch.

First act of the round, before anything else:

    powershell -Command "Start-Process node -ArgumentList 'scripts/sold-loop.mjs' -WindowStyle Hidden"
