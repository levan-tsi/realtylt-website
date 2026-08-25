# ROUND B — the first two new flagship posts, and the numbers that did not survive

**Built 2026-08-25.** Scope: `review-automation` and `ai-appointment-booking` written to the
ratcheted flagship standard, their service pages synced, and the unsourced-claim kills Round A
carried forward. Commits on `main`, not pushed: the orchestrator verifies and pushes.

---

## B0 — the ratchet, run FIRST, and the one thing it did that a ratchet is not supposed to do

`node scripts/flagship-standard.mjs --ratchet`, before any content was touched:

```
ratcheted 3 metric(s) -> docs/blog-flagship/standard.json
  proseWords: 3320 -> 3587
  sections: 18 -> 19
  siblingOverlap: 0 -> 2
```

**The gap it opened, measured on production:**

| post | proseWords | owes | sections | owes |
|---|---|---|---|---|
| ai-chat | 3597 | ok | 19 | ok |
| ai-voice | 3587 | ok (exactly the bar) | 21 | ok |
| database-reactivation | 3408 | **179 words** | 18 | **1 section** |
| ai-lead | 3653 | ok | 21 | ok |
| workflow-automation | 3375 | **212 words** | 18 | **1 section** |

Both gaps are well under the 500-word threshold in the brief, so both were closed by WRITING a
section each post genuinely lacked rather than by padding. What was written is recorded under B5.

**`siblingOverlap` went the wrong way and it is not a typo.** The recorded bar was 0 and the
ratchet raised it to 2, which is a relaxation on a metric where lower is better.
`scripts/flagship-standard.mjs:210` sets `OVERLAP_NOISE_FLOOR = 2` and line 221 applies it as
`Math.max(floor, Math.min(prev, proven))`, so the clamp fires unconditionally and cannot help
pulling a recorded 0 up to 2. The comment above it argues the floor honestly (a ceiling of 0
demands rewording the vocabulary of the business forever), but the clamp was written when the
bar was above 2 and it has never met a bar below it before now.

Resolution at the end of the round is recorded in B6.
