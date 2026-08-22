# Round 37 — the orchestrator's lane

The owner sent four things on 2026-08-22: a question about the moving listings, the consent box, the
thank-you page, and registration with Google and Apple sign-in. The thank-you page is the design
agent's (`DESIGN-ROUND37.md`). This is the rest, measured.

## 1. "Should New Listings move too, or is this enough?" — keep the asymmetry

**Recommendation: do not add motion to New Listings.** Three reasons, and none of them is effort:

1. Round 31 gave the two rails deliberately different WEIGHT so a visitor can tell they have moved
   down the page. Give both ambient motion and that collapses straight back into one repeated
   shape, which is the defect the decision existed to fix. Round 35 protected the same thing.
2. They are different GESTURES. Featured is a small curated set you browse past, which is what
   drift suits. New Listings is a 4x2 grid with a pager, which is scan-and-choose, and motion
   fights that.
3. Ambient motion everywhere stops being motion and becomes wallpaper. One moving rail says "these
   are the ones we are pointing at". Two say nothing.

## 2. The consent box — he is right about the problem, and the literal fix would have hurt him

His report: *"it will let you fill the form without checking the box of the calls and text and it
has to be a must box."* True, and the consequence was real: most leads arrived with no permission
attached while the CRM has a live dialer and an AI caller pointed at those numbers.

**A required box is not consent.** Prior express written consent is only valid if agreeing is not a
condition of getting the thing (47 CFR 64.1200(f)(9)); `lib/leads/consent.ts` already carried the
citations and the New York exposure, which runs to $20,000 per call with consent being precisely
what makes a call solicited. Forcing the tick would have turned every stored record from evidence
into decoration while authorising real automated calls. It would look like protection and be the
opposite.

**So the question is neither optional nor required. It is UNSKIPPABLE.** Two options, neither
pre-selected, both submit, and the form will not go until one is chosen. Every lead now carries an
explicit yes or an explicit no, which is what he was actually after.

### Driven, not assumed

On the real home form, `/api/lead` intercepted so nothing reached the CRM:

| width | question unanswered | after declining |
|---|---|---|
| 1440 | BLOCKED, browser says "Please select one of these options." | SENT, `consentToContact=false` in the payload |
| 390 | BLOCKED, same message | SENT, same |

Then all four call sites, since the component is shared:

| call site | result |
|---|---|
| home / footer form | 2 radios, required, none pre-selected |
| listing sheet, form 1 | same |
| listing sheet, form 2 | same |
| /plan quiz | same |

### The false alarm, recorded because it nearly became a bug report

The first version of that probe counted every `input[name="consentToContact"]` in the DOCUMENT and
reported **"radios=4 FAIL"** on a listing page, which reads exactly like a real defect: four radios
sharing one name would be a single group, and answering one sheet would silently satisfy and then
fight the other.

It is not a defect. HTML scopes a radio group by its **form owner**, not by the document, and that
page renders two lead sheets. Settled by EXPERIMENT rather than by reading the spec: checked "true"
in each form, confirmed the first stayed checked. `distinctForms: 2`, `interference: INDEPENDENT`.

The probe now groups by `r.form`. Worth writing down because the wrong version was convincing.

## 3. Registration, Google and Apple

Measured before touching anything, from the project's own `/auth/v1/settings`: `disable_signup`
**true**, `external.google` **false**, `external.apple` **false**. The site was not hiding working
buttons; there is nothing behind them. Those are Supabase dashboard settings plus Google Cloud and
Apple Developer accounts, and this box holds no Supabase management token, so they are the owner's
to flip. `docs/parity/OPENING-ACCOUNTS.md` is the runbook, including the trap in the middle of it
(email confirmation is on and the built-in mailer is rate-limited, so opening signup without SMTP
works while he tests it and fails silently at about the third real person).

What this round did do is make the site ready and prove it. Apple was added the way Google already
worked rather than beside it: read from the same live settings call, defaulting false, with
`signInWithGoogle` generalised to `signInWithOAuth(provider)` so the guard and the comment
explaining it are not duplicated.

Proved by intercepting ONLY `/api/auth/config` and serving the shape the project would send, so
every component below it is real and the project was never touched:

| project reports | modal renders |
|---|---|
| nothing open (today) | no provider buttons, "New accounts aren't open yet" + the phone number |
| signup open only | no provider buttons, closed notice correctly gone |
| google only | Continue with Google |
| apple only | Continue with Apple |
| google + apple | both, matched geometry, one stack |

A new ratchet parses the `OAuthProvider` union and fails if any provider in it lacks a door read
from the live settings and carried to the browser, so adding one to the union is not enough to make
it appear.

**Not verified, stated plainly:** nobody has completed a real OAuth round trip, because that needs
a real Google or Apple account consenting to a real screen.

## 4. The assistant call and the thank-you email

He asked for both. **Neither happens today** — searched n8n first, and the only active lead workflow
is the chatbot's capture. That is not a detail: it decides what `/thank-you` may say, and a page
promising a call nobody makes is the defect round 10 had to walk back on the alerts claim.

Everything needed was already connected to his n8n (Vapi, Gmail, Twilio, Google Calendar), so the
flow is built and left OFF: workflow `rzI7WIQhRKfrhJxH`, verified `active: false`,
`triggerCount: 0`, never run, nobody called.

    Website Lead -> Normalize -> May We Call Them?   (consent.granted true AND phone present)
                                   true  -> Vapi verify/book -> "we will call" email
                                   false ->                     "email only" email

Three things deliberately left blank rather than invented: the Vapi `assistantId` and
`phoneNumberId`, the trigger wiring (the site posts to the CRM, not to n8n), and the Vapi
credential binding. The contract and the order of operations are in `docs/LEAD-FOLLOW-UP.md` — flip
the page's copy constant LAST, after the flow is live, not before.

## 5. Gates at this point

tsc clean · npm test **1059 / 83 files** (baseline entering the round was 1056/83) ·
verify-focus-paint PASS 429 (was 419; the consent radios added ten) · verify-press-feedback 15/15 ·
verify-hero-contrast PASS · no horizontal overflow in 32 page/width combinations at 390 and 320 ·
no CSP violations across 16 pages.
