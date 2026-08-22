# Lead follow-up — the website/CRM contract

Written 2026-08-22 on the owner's ask: *"maybe my assistant will call them to make sure they're a
real person and find out when is the best day for the appointment ... and also it should send thank
you or welcome thank you saying the similar thing."*

Same shape as `LISTING-ALERTS.md`: **the website captures and hands over. Something else sends.**
Nothing in this repo emails or calls anybody, and nothing here should.

## What the website already gives you

Every lead POSTed to `CRM_LEAD_WEBHOOK` carries, beyond the obvious fields:

| field | who writes it | what it is |
|---|---|---|
| `phone` | visitor | the number, as typed |
| `consent.granted` | **server** | `true` only if they chose "Yes, you can call or text me". Never inferred, never defaulted |
| `consent.text` | server | the exact agreement sentence that was on screen |
| `consent.version` | server | which wording that was (`lib/leads/consent.ts`) |
| `consent.seller` | server | who was authorised |
| `consent.at` / `.ip` / `.source` | server | when, from where, on which page |
| `consent.phone` | server | the number the authorisation covers, kept on the record so it stays readable if the contact is later edited |

**`consent.granted` is the only field the client has any say in, and even that is coerced to a real
boolean rather than trusted.** Everything else is stamped server-side, because a record the
submitter can write is not evidence.

Since 2026-08-22 the question is **unskippable**: two options, neither pre-selected, both submit,
and the form will not go until one is chosen. So `consent` is now an explicit yes or an explicit no
on every lead that carries a phone number, rather than mostly-absent. That was the point of the
change.

## The draft that would do the sending

n8n workflow **`rzI7WIQhRKfrhJxH`** — "[DRAFT] Website Lead Follow-up".
**INACTIVE. `active: false`, `triggerCount: 0`. It has never run and nobody has been called.**

    Website Lead (webhook)
      -> Normalize Lead
        -> May We Call Them?          consent.granted === true AND phone not empty
             true  -> Vapi: Verify and Book -> Thank You (we will call)
             false ->                          Thank You (email only)

The two thank-you emails say different things on purpose. One tells them to expect a short call to
find a time; the other says plainly that we will not call, because they asked us not to.

### What is deliberately not filled in

- **The Vapi call body.** `assistantId` and `phoneNumberId` are the owner's and are not guessable,
  so they are a flagged placeholder rather than an invented value.
- **The trigger wiring.** The site posts to `CRM_LEAD_WEBHOOK`, which is the CRM, not n8n. Either
  fan out from the CRM or repoint that variable. That is a decision, not a default.
- The Gmail credential bound itself to the existing "Gmail account"; the Vapi one is an HTTP
  Request node and has to be bound by hand.

### Why the branch is not optional

A call placed to someone who declined is an unconsented telemarketing call. `lib/leads/consent.ts`
carries the citations; the short version is that New York GBL 399-z runs to **$20,000 per call**,
each call a separate violation, and consent is precisely what makes a call solicited rather than
cold. The `false` branch exists so that cannot happen by accident.

## What the thank-you page may and may not say

`/thank-you` must not promise a call or an email while that workflow is inactive, because a page
that describes something the system does not do is the exact defect round 10 had to walk back on
the alerts claim.

The page reads `?c=1` / `?c=0` from the redirect (set in `components/leads/LeadForm.tsx`) so it can
tell each visitor the truth about which of them applies to them. When the workflow goes live, the
page's follow-up copy is switched on in ONE place:

    app/thank-you/page.tsx
    const OUTBOUND_FOLLOW_UP_LIVE = false;

That is the whole switch. Both sides of it are written and both are honest; flipping it changes
which set of sentences a visitor reads, nothing else.

**Order of operations when the owner is ready:** fill the Vapi body, bind the credential, point the
trigger, run it once against a test lead of his own, activate, and only then flip the page's
constant. Not the other way round.
