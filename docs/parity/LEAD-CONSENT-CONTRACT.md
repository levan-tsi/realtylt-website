# Lead consent — the contract between this site and the CRM

Written 2026-08-03 (website round 19). **The CRM session needs to read this before it dials or
texts anyone.** Written down first, on purpose: two sessions building against an unwritten
contract invent two schemas and one gets thrown away.

## What changed

Every lead this site posts to `CRM_LEAD_WEBHOOK` that carries a phone number now also carries a
`consent` object. Nothing else about the payload changed.

```jsonc
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "phone": "917-555-0142",
  // ... the existing fields, unchanged ...
  "consent": {
    "granted": true,                       // the ONLY field the visitor controls
    "text": "Yes, RealtyLT can call or text me at this number. This includes automated dialing and prerecorded or artificial voice messages about my request and about homes. Agreeing is not a condition of buying or selling a home. Message and data rates may apply, message frequency varies, and you can reply STOP at any time to stop the messages.",
    "version": "2026-08-03.v1",
    "seller": "RealtyLT (Levan Tsiklauri, United Real Estate)",
    "at": "2026-08-03T12:41:07.221Z",      // server clock
    "source": "/listing/KEY1033853",       // the page they were on
    "ip": "203.0.113.7",                   // their IP at submission
    "phone": "917-555-0142"                // the number the authorisation covers
  }
}
```

## The three rules that matter on the CRM side

1. **`consent` absent ≠ consent declined.** Absent means the lead had no phone number at all.
   Declined is `"consent": { "granted": false, ... }` — they were asked and said no. Those are
   opposite facts and only one of them is safe to act on, so store them differently.

2. **Show `text` on the lead, next to the dial button.** Not "consent: true". The agent about to
   press call should be able to read the exact sentence that person agreed to. That is the whole
   reason the wording is stored rather than a flag.

3. **`granted: false` still allows a human callback about *their own* request.** What it forbids
   is automated dialing, prerecorded voice and marketing texts. Someone who filled in a form
   asking about a house has asked to be contacted about that house; they have not agreed to be
   put on a dialer.

## Why the fields are what they are

`version`, `at`, `source`, `ip` and `text` are all stamped **server-side** in
`lib/leads/index.ts` and are never read from the request body — a record the submitter can write
is not evidence. There is a test for this (`lib/leads/consent.test.ts`).

The legal reasoning behind the wording, with what was verified and when, is in
`lib/leads/consent.ts`. The short version:

- The FCC's **one-to-one consent rule is not in force** — vacated by the Eleventh Circuit in
  *Insurance Marketing Coalition v. FCC* (Jan 2025), and the FCC then deleted the language. The
  governing federal standard is the older **prior express written consent**, 47 CFR 64.1200(f)(9).
  Do not build to the vacated rule.
- **New York is the sharper edge.** GBL §399-z(5)(a) makes an *unsolicited* telemarketing call to
  someone in an area under a declared state of emergency unlawful, and New York runs rolling
  states of emergency — which is why NYSAR keeps telling members cold calling is still
  prohibited. Up to **$20,000 per call**, each call a separate violation. Consent is what makes a
  call solicited.

## Still open, and they belong to the CRM

- **Revocation.** A "STOP" reply, or a verbal "don't call me", has to flip `granted` to false and
  stop the dialer. The website cannot do this; it never sees the conversation.
- **The DNC list.** New York's state Do-Not-Call registry and the federal one are a check the
  dialer must make, not something a web form can answer.
- **Bumping the wording.** If `CONSENT_VERSION` changes, old leads keep their old `text`. Do not
  migrate them — the point of the record is what *that* person actually read.
