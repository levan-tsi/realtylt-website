# Opening registration, Google sign-in and Apple sign-in

Written 2026-08-22 on the owner's ask: *"we need to open the registration and then Google sign in
Apple sign in and test it properly that they are working."*

**The website side is done and proved.** Everything below is Supabase dashboard and third-party
developer-account work, which needs credentials this machine does not hold. The site reads the
project's own `/auth/v1/settings` on a 60-second cache, so **every one of these takes effect within
a minute of you saving it. No deploy, no code change, nothing to ask me for.**

## What the project reports right now

Measured 2026-08-22, straight from `https://wpfmhmnceflfruhssqqb.supabase.co/auth/v1/settings`:

| setting | value | what the site does about it |
|---|---|---|
| `disable_signup` | **true** | Hides every "create an account" offer and shows "New accounts aren't open yet. Call or text (917) 905-7923" |
| `external.google` | **false** | No "Continue with Google" button |
| `external.apple` | **false** | No "Continue with Apple" button |
| `mailer_autoconfirm` | **false** | New email signups must click a confirmation link. **Read step 2.** |

So the site is not hiding working buttons. There is nothing behind them yet.

---

## Step 1 — Open registration (2 minutes, no third party)

Supabase Dashboard -> your project -> **Authentication** -> **Sign In / Providers** -> **Email** ->
turn ON **"Allow new users to sign up"**. Save.

Within a minute the site stops saying accounts are closed and starts offering "Sign up".

## Step 2 — Before you open it, decide about email (this is the trap)

`mailer_autoconfirm` is false, so a new account has to confirm by email, and **Supabase's built-in
mailer is rate-limited to a handful of messages an hour**. That is fine for you testing it and it
falls over the moment real people arrive: the signup appears to work and the confirmation email
never comes.

Two honest options, pick one:

- **Configure your own SMTP** (Authentication -> Emails -> SMTP Settings). Resend, Postmark, SendGrid
  and Amazon SES all work. This is the right answer if accounts matter.
- **Turn on auto-confirm** (Authentication -> Sign In / Providers -> Email -> "Confirm email" OFF).
  Accounts then work instantly with no email at all. It is weaker: anyone can register a typo'd or
  someone else's address. Acceptable for a saved-homes portal, not for anything that holds money.

If neither is done, expect "I signed up and nothing happened" from about the third person onward.

## Step 3 — URL configuration (do this BEFORE testing OAuth, or the round trip bounces)

Authentication -> **URL Configuration**:

- **Site URL**: `https://realtylt-website.vercel.app` for now, `https://realtylt.com` after you
  point the apex.
- **Redirect URLs** must include BOTH, because our code sends the visitor back to
  `<their current origin>/auth/callback`:
  - `https://realtylt-website.vercel.app/auth/callback`
  - `https://realtylt.com/auth/callback`
  - `http://localhost:3100/auth/callback` (only if you want to test locally)

`app/auth/callback/route.ts` already exists, exchanges the code for a session, and refuses any
`next` that is not same-origin, so it cannot be turned into an open redirect.

## Step 4 — Google (about 15 minutes, free)

1. Google Cloud Console -> create or pick a project.
2. **APIs & Services -> OAuth consent screen**: External, app name "RealtyLT", your support email,
   your domain, and add yourself as a test user while it is unverified.
3. **APIs & Services -> Credentials -> Create credentials -> OAuth client ID -> Web application**.
   - Authorised JavaScript origins: `https://realtylt-website.vercel.app` (and `https://realtylt.com`)
   - **Authorised redirect URI:** `https://wpfmhmnceflfruhssqqb.supabase.co/auth/v1/callback`
     This is Supabase's callback, NOT ours. Getting this one wrong is the usual reason Google
     sign-in fails with `redirect_uri_mismatch`.
4. Copy the Client ID and Client Secret into Supabase -> Authentication -> Sign In / Providers ->
   **Google** -> enable, paste both, save.

The button appears on the site within a minute. Nothing to deploy.

## Step 5 — Apple (slower, and it costs money)

Apple sign-in needs a paid **Apple Developer Program** membership (99 USD a year). If you do not
have one, that is the blocker and nothing else here matters.

1. Apple Developer -> Certificates, Identifiers & Profiles.
2. **Identifiers -> App ID** for RealtyLT, with "Sign In with Apple" capability.
3. **Identifiers -> Services ID** (this is what the web uses). Enable "Sign In with Apple",
   configure it against the App ID, and set:
   - Domain: `wpfmhmnceflfruhssqqb.supabase.co`
   - Return URL: `https://wpfmhmnceflfruhssqqb.supabase.co/auth/v1/callback`
4. **Keys -> new key** with "Sign In with Apple" enabled. Download the `.p8` ONCE; Apple will not
   let you download it again.
5. Supabase -> Authentication -> Sign In / Providers -> **Apple** -> enable, and give it the
   Services ID, Team ID, Key ID and the contents of the `.p8`.

The button appears within a minute, styled to Apple's own guidance (solid black mark, not
recoloured, "Continue with Apple" beside the Google button).

## What is already proved on the website side

Driven in a real browser by intercepting ONLY `/api/auth/config` and serving the shape the project
would send, so every component below it is the real one and the project was never touched
(`scripts/_scratch-r37-authdoors.mjs`, shots in `docs/design-r37/shots/auth-*.png`):

| project reports | what the modal renders |
|---|---|
| nothing open (today) | no provider buttons, "New accounts aren't open yet" plus the phone number |
| signup open only | no provider buttons, closed notice correctly gone, "Sign up" offered |
| google only | Continue with Google |
| apple only | Continue with Apple |
| google + apple | both, matched geometry, one stack |

Guarded by `components/auth/account-doors.test.ts`, which now parses the `OAuthProvider` union and
fails if any provider in it lacks a door read from the live settings and carried to the browser.

## When you have done it, tell me and I will test it for real

What I cannot do from here is prove an actual round trip, because that needs a real Google or Apple
account consenting to a real OAuth screen. Once the providers are on, ask me and I will drive a
full sign-in on the deployed site and report exactly what happens, including the session landing in
`/portal` and the profile row being created.
