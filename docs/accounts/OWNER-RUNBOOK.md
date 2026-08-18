# Turning on registration and Google sign-in — the owner's runbook

Written 2026-08-18. Everything in "What is true today" was measured against the live project on
that date, not assumed. Every step below is a setting only you can change; the website code is
already finished and waiting for them.

Supabase project: **`wpfmhmnceflfruhssqqb`** (dashboard name `realtylt-chatbot`). The website,
the CRM and the chatbot all share it.

---

## 0. What is true today

Read from the project's own auth server (`GET /auth/v1/settings`) on 2026-08-18:

```
disable_signup      : true      <- nobody can create an account
mailer_autoconfirm  : false     <- a confirmation email must be opened before sign-in works
external.google     : false     <- Google sign-in does not exist on this project
external.email      : true      <- email + password sign-in is on
```

Counts in the database on the same day: **1** auth user (`demo@realtylt.com`, your CRM login),
**0** portal accounts, **0** contacts tagged `website-account`. Nobody has ever registered on
the site, because nobody has been able to.

**The website is not the problem.** The account layer is built and correct: the tables, the
row-level security, the portal pages, the saved-homes sync and the CRM link all exist and were
proven working on 2026-08-18 by creating a real account through the admin API and watching it
land in the CRM (then deleting it). What is missing is one dashboard toggle, a working
confirmation email, and — if you want it — a Google OAuth credential.

**The site no longer offers what it cannot do.** Until you flip the toggle, the sign-in box
shows the email form plus one line: *"New accounts aren't open yet. Call or text
(917) 905-7923 and we'll set one up for you."* The Google button is hidden entirely, and the
"Create account" buttons on `/saved` and `/portal` are hidden. The site reads the project's
settings live and refreshes within a minute, so **the moment you finish step 1 the site turns
those controls back on by itself. No deploy, no developer.**

---

## 1. Open registration (one toggle)

1. Go to <https://supabase.com/dashboard/project/wpfmhmnceflfruhssqqb/auth/providers>
2. Open the **Email** provider row.
3. Turn **ON** "Allow new users to sign up" (this is the `disable_signup` setting; some builds
   of the dashboard show it under **Authentication → Sign In / Providers → User Signups**).
4. Leave **"Confirm email" ON** — but only after step 2 below is done, or nobody will ever
   receive the confirmation and every new account will be stuck.
5. Save.

Within about a minute the website's sign-in box grows a "Sign up" link again, and the
"Create account" buttons come back on `/saved` and `/portal`. Nothing needs to be redeployed.

**Do not do step 1 before step 2.** With confirmation on and no working mail sender, every
person who registers is left with an account they cannot use.

---

## 2. Make the confirmation email actually arrive

Two things are unresolved here and both are yours.

### 2a. A real SMTP sender

Supabase's built-in email sender is for development: it is rate-limited to a handful of
messages an hour and, on current projects, only delivers to addresses on your Supabase team.
Real visitors will not receive anything from it.

1. Go to <https://supabase.com/dashboard/project/wpfmhmnceflfruhssqqb/auth/smtp>
   (**Authentication → Emails → SMTP Settings**).
2. If "Enable Custom SMTP" is already ON with a sender on `realtylt.com`, this part is done —
   skip to 2b. **I could not read this setting from outside the dashboard, so please look.**
3. If it is OFF, create a sending account with any transactional provider (Resend, Postmark and
   SendGrid all work; Resend is the least setup) and paste in:
   - Host, port 587, username, password from that provider
   - Sender email: `noreply@realtylt.com`
   - Sender name: `RealtyLT`
4. Save, then use the dashboard's own "send test email" if it offers one.

### 2b. Domain authentication on realtylt.com

`realtylt.com` still has no SPF, DKIM or DMARC records. Without them, confirmation emails that
do send will land in spam, which looks identical to "registration is broken" from a visitor's
side. Your SMTP provider will give you three DNS records to add at your domain host. Add all
three before you announce registration to anyone.

### If you would rather skip email entirely

You can turn **"Confirm email" OFF** in the Email provider (that is `mailer_autoconfirm = true`).
Registration then works instantly with no email at all. The cost is real: anyone can register
using someone else's email address, and you lose the only proof that the address belongs to
them. My recommendation is to do 2a and 2b and keep confirmation on. If you want to launch
before the DNS is sorted, turning confirmation off temporarily is a defensible trade — just put
it back afterwards.

---

## 3. Google sign-in

### 3a. FIRST — a database fix that is not optional

Measured on 2026-08-18 by creating both kinds of account and watching where they landed:

| account created with | portal profile | CRM contact | CRM **staff user** |
|---|---|---|---|
| the website's sign-up form (carries `account_type: "portal"`) | yes | yes, tagged `website-account` | no |
| a Google sign-in (cannot carry that marker) | **no** | **no** | **yes, role `agent`** |

The database trigger `handle_new_user` treats any account without the marker `account_type =
'portal'` as CRM staff. The website's own form sets that marker; **Google sign-in has no way to
set it** — Google supplies the name, email and avatar and nothing else. So with Google enabled
as things stand, every visitor who signs in with Google would be written into your CRM's staff
users table as an agent, and would get no portal profile and no contact record. That is
backwards in both directions.

This is a change to the shared CRM database, so it belongs to the CRM workstream, not to the
website. Ask that session to change `public.handle_new_user` so the **default** is a portal
client and only an explicitly-marked staff signup becomes staff, and to make
`handle_new_portal_user` match. Then re-run the table above and confirm a marker-less signup
produces a portal profile plus a contact and **no** staff row.

**Do not enable Google in Supabase until that is done and re-tested.**

### 3b. Create the Google credential

1. Go to <https://console.cloud.google.com/> and pick (or create) a project. The Maps keys
   already live in a project called **RealtyLT CRM** under `levan@realtylt.com`; using the same
   one is fine.
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `RealtyLT`
   - User support email: `levan@realtylt.com`
   - App logo: optional
   - Authorised domains: add **`supabase.co`** and **`realtylt.com`**
   - Developer contact: `levan@realtylt.com`
   - Scopes: leave the defaults (`email`, `profile`, `openid`)
   - Publish the app (**Publishing status → In production**). While it is in "Testing" only
     addresses you list by hand can sign in.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `RealtyLT website`
   - **Authorised JavaScript origins:**
     ```
     https://realtylt-website.vercel.app
     https://www.realtylt.com
     ```
   - **Authorised redirect URI — this is the one that matters, it is Supabase's, not ours:**
     ```
     https://wpfmhmnceflfruhssqqb.supabase.co/auth/v1/callback
     ```
     Exactly that, no trailing slash. A wrong value here is the single most common reason
     Google sign-in fails with `redirect_uri_mismatch`.
4. Press **Create** and copy the **Client ID** and **Client secret**.

### 3c. Paste it into Supabase

1. <https://supabase.com/dashboard/project/wpfmhmnceflfruhssqqb/auth/providers>
2. Open **Google**, toggle it **ON**.
3. Paste the **Client ID** into "Client IDs" and the **Client secret** into "Client Secret".
4. Save.

### 3d. Tell Supabase where it is allowed to send people back

1. <https://supabase.com/dashboard/project/wpfmhmnceflfruhssqqb/auth/url-configuration>
2. **Site URL:** `https://realtylt-website.vercel.app` (change to `https://www.realtylt.com`
   when the site goes live on the real domain).
3. **Redirect URLs** — add each of these on its own line:
   ```
   https://realtylt-website.vercel.app/auth/callback
   https://www.realtylt.com/auth/callback
   https://realtylt-website-*.vercel.app/auth/callback
   http://localhost:3100/auth/callback
   ```
   The third line covers preview deployments; the fourth is for development.
4. Save.

Within a minute the "Continue with Google" button appears on the website by itself. No deploy.

---

## 4. What a registration does, once it is open

The website and the CRM are the same database, so a registration is not emailed anywhere or
posted through a webhook — it appears in the CRM directly. Proven on 2026-08-18 with a real
account, since deleted:

```
someone registers on realtylt.com
  -> auth user created
  -> portal profile row (portal_clients): their name, email, phone
  -> CRM contact created automatically:
        Source  : "Website Account"
        Tag     : website-account
        Stage   : lead
        Status  : active
        Owner   : RealtyLT organisation
  -> the portal profile is linked to that contact, so their saved homes, saved searches and
     activity are readable from the CRM against the same person
```

If a contact with that email already exists, the account attaches to the **existing** contact
instead of creating a duplicate.

**Two things it does NOT do, and you should know both:**

1. **It does not notify you.** A lead form on the website (`/api/lead` → the n8n webhook)
   creates a `leads` row and fires a CRM notification. A registration writes the contact
   silently. If you want a ping when someone signs up, that is a small piece of CRM work —
   ask for it, it does not exist today. Until then, filter contacts by source
   `Website Account` to see them.
2. **A registration is not a lead.** Lead forms and registrations are two separate paths.
   The lead forms work today and always have; registration is the one that has been shut.

---

## 5. How to check it actually worked

After steps 1 and 2, from any browser that is not signed in:

1. Open the site, click **Sign In** (top right). You should now see a **"Sign up"** link at the
   bottom of the box. If you do not, the toggle in step 1 did not save — reload after a minute
   and look again.
2. Click **Sign up**, register with a real address you can read.
3. The box should say *"Check your email to confirm your account, then sign in."* If that email
   does not arrive within two minutes, step 2 is not finished — check the spam folder first,
   then the SMTP settings.
4. Open the link, sign in.
5. In the CRM, open Contacts and filter to source **Website Account**. Your new registration is
   there, as a lead.

If Google was enabled too, repeat with **Continue with Google** and confirm in the CRM that the
person arrived as a **contact**, not as a staff user — that is the check for 3a.

---

## Summary of what is yours

| # | What | Where | Blocking |
|---|---|---|---|
| 1 | SMTP sender for confirmation emails | Supabase → Authentication → Emails → SMTP | registration |
| 2 | SPF / DKIM / DMARC on realtylt.com | your DNS host | emails not landing in spam |
| 3 | "Allow new users to sign up" ON | Supabase → Authentication → Sign In / Providers → Email | registration |
| 4 | Fix `handle_new_user` so a marker-less signup is a client, not staff | CRM workstream (shared database) | Google sign-in |
| 5 | Google OAuth client + redirect URI | Google Cloud Console | Google sign-in |
| 6 | Google client ID + secret pasted in | Supabase → Authentication → Sign In / Providers → Google | Google sign-in |
| 7 | Site URL + redirect URL allow-list | Supabase → Authentication → URL Configuration | Google sign-in |

Nothing on this list needs a website deploy. The site reads all of it live.
