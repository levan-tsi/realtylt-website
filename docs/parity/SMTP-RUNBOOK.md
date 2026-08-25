# SMTP for Supabase Auth — the runbook (round 39, 2026-08-24)

## RESOLVED MID-ROUND: custom SMTP is ALREADY ON — proven by experiment, not settings

The r38 handoff said "Custom SMTP is OFF + confirm-email ON". Measured 2026-08-24 evening by
a REAL sign-up (levan+r39test@realtylt.com through the live auth API): the confirmation email
arrived within a second, **sender levan@realtylt.com, carrying Gmail's SENT label** — i.e. it
went out through his own Workspace SMTP, which the built-in mailer cannot do. The template is
already customized ("finish setting up your RealtyLT account", house voice). The full loop
ran: sign up → confirm link → 303 with session → password sign-in `email_confirmed: yes`.
Someone (likely the CRM workstream) configured this between the r38 measurement and now.

**What remains of this runbook:** the options below are kept as REFERENCE in case the Gmail
sender ever hits its ~2,000/day cap or needs replacing. Two follow-ups still worth doing:
- Supabase Auth → Rate Limits: confirm "emails per hour" got raised past the built-in floor.
- Reset-password leg: re-test once /auth/reset deploys (this round's build).

The original brief, for context:
Sign-up confirmations and password resets must not ride Supabase's built-in mailer (a
handful of emails per hour, silent failures). Everything below was measured so the owner's
ten minutes would be real.

## What DNS already says (measured 2026-08-24 over Google DoH)

The picture CHANGED since the 07-31 audit — the domain now authenticates properly:

| record | value | meaning |
|---|---|---|
| SPF (TXT @) | `v=spf1 include:_spf.google.com include:sendgrid.net ~all` | Google **and SendGrid** may send as realtylt.com |
| DMARC | `v=DMARC1; p=none; rua=mailto:levan@realtylt.com; adkim=r; aspf=r` | present, monitor mode |
| DKIM `google._domainkey` | RSA key present | Workspace mail is signed |
| DKIM `s1/s2._domainkey` | CNAME → `…u39707088.wl089.sendgrid.net` | SendGrid domain auth complete |

**Consequence: two senders need ZERO new DNS records.** Resend (the earlier suggestion) is
the only option that would send Levan back to Namecheap.

## The recommendation, in order

### Option A — SendGrid, if the account still opens (fastest, purpose-built)
The DNS above belongs to SendGrid account **u39707088** — likely from the old IDX-vendor era.
1. Try logging in at app.sendgrid.com. If the account is alive and free-tier (100 emails/day —
   plenty for auth mail): Settings → API Keys → Create API Key (Mail Send permission only).
2. Supabase dashboard → project `wpfmhmnceflfruhssqqb` → Authentication → Emails →
   **SMTP Settings** → Enable custom SMTP:
   - Host `smtp.sendgrid.net` · Port `465` · Username `apikey` (that literal word)
   - Password = the API key · Sender email `levan@realtylt.com` · Sender name `RealtyLT`
3. Send a test (Supabase has a "send test email" on that screen). Check it arrives NOT in spam.

### Option B — Google Workspace SMTP (no third party at all)
His own domain, already DKIM-signed, ~2,000 recipients/day cap — far above pre-launch needs.
1. myaccount.google.com (as levan@realtylt.com, 2-Step Verification must be on) → Security →
   App passwords → create one named "Supabase auth".
2. Same Supabase screen: Host `smtp.gmail.com` · Port `465` · Username `levan@realtylt.com` ·
   Password = the app password · Sender `levan@realtylt.com` / `RealtyLT`.

### Option C — Resend (only if A is dead and B is unwanted)
Free 3k/mo, but requires: create account → Domains → add `realtylt.com` → add the 3 records
Resend generates (their DKIM TXT + return-path MX/TXT on a subdomain) at Namecheap → wait for
verify → API key → Supabase SMTP (`smtp.resend.com`, 465, user `resend`, password = key).
The records are account-specific — they cannot be prepared in advance.

## After SMTP is on (any option)
1. Rate limits: Supabase Auth → Rate Limits — raise "emails per hour" from the built-in
   mailer's floor to something real (30/hour is fine pre-launch).
2. Run the full loop with a real mailbox: sign up (levan+test@realtylt.com aliases to his
   inbox) → confirm → sign out → Forgot password → email → set new password at /auth/reset →
   sign in. The website side of this loop is built and unit-pinned (reset-flow.test.ts).
3. Tighten DMARC later (p=quarantine) once a few weeks of rua reports look clean — unrelated
   to Supabase but the same Namecheap visit if Option C was taken.

## Also noticed while verifying (owner call, cosmetic)
Google's OAuth consent screen says "Sign in to wpfmhmnceflfruhssqqb.supabase.co" instead of
RealtyLT. Fix = either Google app verification (needs the production domain live) or a
Supabase custom auth domain (auth.realtylt.com, paid add-on). Post-launch decision.

## The auth-user <-> lead contract (recorded for the CRM build, round 39)

Site accounts (auth.users) and leads (form submissions) are SEPARATE tables by design — a
sign-in never creates a lead, so no duplicate lead can exist. What the CRM build implements
on its side, matching by email:

- `auth.users.email` ↔ lead email, case-insensitive. Show on the lead: "has a site account,
  last signed in {last_sign_in_at}".
- New-account awareness already exists OUTSIDE the CRM: trigger `trg_notify_site_signup` on
  `auth.users` (function `public.notify_site_signup`, exception-swallowing by design) POSTs
  {email, name, provider, created_at} to the n8n workflow "Website Sign-up Notification"
  (3RLrnY2SMcZ5ZMDL), which emails levan@realtylt.com. Secret + path live in the function
  body; rotate both together if ever needed.
- The CRM must NOT remove or replace that trigger; if the CRM later wants richer routing,
  point the n8n workflow somewhere new instead of touching auth schema again.
