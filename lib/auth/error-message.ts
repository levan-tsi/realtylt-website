import { SITE } from "@/lib/site";

/** AUTH ERRORS, IN OUR OWN WORDS.
 *
 * Every auth call returned Supabase's `error.message` straight to the screen. Round 20 caught
 * what that actually reads like: a visitor who tries to create an account gets
 *
 *     "Signups not allowed for this instance"
 *
 * in a red alert on a real estate site. "Instance" is not a word about them, it describes our
 * plumbing, and it gives them nothing to do next. It is the same mistake the lead route already
 * fixed on its own side, where an internal "CRM webhook responded 500" is logged but never shown.
 *
 * So: known conditions get a sentence that says what happened and what to do about it, and
 * anything unrecognised falls back to the line the lead form already uses, WITH the phone
 * number. Nobody should ever hit a dead end on this site without a way to reach a person.
 *
 * Matched on `code` first (supabase-js sets it from the API's error_code), then on the message
 * text, because older releases and some endpoints only populate the message.
 */
export function authErrorMessage(err: { code?: string; message?: string } | null | undefined): string {
  const code = (err?.code ?? "").toLowerCase();
  const msg = (err?.message ?? "").toLowerCase();
  const is = (c: string, ...text: string[]) => code === c || text.some((t) => msg.includes(t));

  // Accounts are switched off at the project level. This is the one a visitor is most likely to
  // hit right now, and the least likely to understand.
  if (is("signup_disabled", "signups not allowed", "signup is disabled"))
    return `New accounts aren't open yet. Call or text ${SITE.phone} and we'll set one up for you.`;

  if (is("email_exists", "already registered", "already been registered") || is("user_already_exists"))
    return "That email already has an account. Sign in instead, or reset your password.";

  if (is("invalid_credentials", "invalid login credentials"))
    return "That email and password don't match. Try again, or reset your password.";

  if (is("email_not_confirmed", "email not confirmed"))
    return "Check your email and open the link we sent to confirm your account first.";

  if (is("weak_password", "password should be at least"))
    return "Use a password of at least 8 characters.";

  if (is("over_email_send_rate_limit", "over_request_rate_limit", "rate limit", "too many requests"))
    return "Too many attempts just now. Wait a minute and try again.";

  if (is("validation_failed", "unable to validate email", "invalid email"))
    return "That email address doesn't look right. Check it and try again.";

  if (is("provider_disabled", "unsupported provider", "provider is not enabled"))
    return `That sign-in option isn't switched on yet. Use your email, or call or text ${SITE.phone}.`;

  return `Something went wrong on our end. Call or text ${SITE.phone} instead.`;
}
