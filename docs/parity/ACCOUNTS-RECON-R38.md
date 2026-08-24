# Accounts recon, round 38 — the browser route works (2026-08-23)

Round 38 tried the one untried route: the Claude-in-Chrome browser tools against the owner's
signed-in Chrome profile. **It works.** Everything below was read from the real dashboards today.
Nothing was changed — every switch here is outward-facing and waits for the owner's explicit
go-ahead, per the standing rule.

## Supabase — signed in, full access confirmed

Project: **realtylt-chatbot** (`wpfmhmnceflfruhssqqb`), org **RealtyLT (Pro plan)**, env main
PRODUCTION. Four orgs exist on the account (RealtyLT Pro + two RealtyLT Free + Realtylt-crm Free);
the website's project is the Pro one.

**Auth state, read from Sign In / Providers:**
- Allow new users to sign up: **OFF** (matches the API-measured `disable_signup: true`)
- Allow manual linking: OFF · Allow anonymous sign-ins: OFF
- Confirm email: **ON**
- Providers: **Email enabled; everything else disabled** (Apple, Azure, Google, Facebook, ...)

**SMTP (Auth > Emails > SMTP Settings): custom SMTP is OFF.** The trap from the round-38 brief is
confirmed on the real dashboard: with confirm-email ON and no custom SMTP, opening signup rides
Supabase's built-in mailer, which is rate-limited to a handful of mails an hour — it works while
one person tests it and fails silently at real volume. **Email must be dealt with before signup
opens.**

## ⚠ Two things the owner needs to see regardless of auth

1. **The RealtyLT org exceeded its quota in the previous billing cycle.** The dashboard banner
   says projects will be **restricted from 22 Sep 2026** if the org remains over quota, a grace
   period started today (2026-08-23), and a separate notice says the Disk IO budget is being
   consumed on realtylt-chatbot. This is a billing/usage decision only the owner can make
   (Review usage / billing in the dashboard), and it sits under the website AND the chatbot.
2. **Four CRITICAL security advisors** on the project: Security Definer Views on
   `public.chatbot_transcript_by_phone`, `public.chatbot_sessions_overview`,
   `public.chatbot_transcript_by_session`, and `public.zip_centroids`. Security-control changes
   are out of scope for a website round (and some of these views belong to the chatbot/CRM
   surface), so this is reported, not patched. It deserves a paired review with the CRM project.

## Google Cloud — signed in, empty slate

Console opens on project **"My First Project" (`astute-zephyr-410321`)**: no API keys, **no OAuth
clients**, no service accounts, and the **OAuth consent screen is not configured**. The free trial
is over; creating a consent screen and an OAuth client costs nothing.

## The click-path when the owner says go (all in his browser, ~10 minutes)

1. **Email first.** Pick an SMTP provider (Resend, SES, Postmark...), create the credential, and
   turn on custom SMTP in Auth > Emails > SMTP Settings. Without this, step 4 is a silent failure.
2. Google Cloud: configure the OAuth consent screen (External; app name RealtyLT; authorized
   domain realtylt.com; support email his), then Credentials > Create credentials > OAuth client
   ID > Web application with redirect URI
   `https://wpfmhmnceflfruhssqqb.supabase.co/auth/v1/callback`.
3. Supabase: Auth > Sign In / Providers > Google > paste client ID + secret, enable.
4. Supabase: turn ON "Allow new users to sign up".
5. **Apple sign-in is a separate decision**: it requires a paid Apple Developer account ($99/yr)
   and Service ID setup. The site's code already shows both buttons the moment the project
   reports the providers; nothing ships until the project does.

`docs/parity/OPENING-ACCOUNTS.md` remains the detailed runbook; this doc records what is true on
the dashboards as of today and that the browser route is viable for a supervised session.
