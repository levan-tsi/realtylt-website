import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./error-message";
import { SITE } from "@/lib/site";

/** The rule these enforce: a visitor never reads a sentence about our plumbing, and never hits
 * a dead end without a way to reach a person. */

describe("auth errors — never show the provider's words", () => {
  /** The one round 20 actually caught on screen. Supabase says "instance"; a person trying to
   * save a house does not know what that is, and the sentence gives them nothing to do. */
  it("explains a disabled sign-up and offers a way through", () => {
    const m = authErrorMessage({ code: "signup_disabled", message: "Signups not allowed for this instance" });
    expect(m).not.toMatch(/instance/i);
    expect(m).toContain(SITE.phone);
  });

  it("matches on the message when no code is set", () => {
    const m = authErrorMessage({ message: "Signups not allowed for this instance" });
    expect(m).not.toMatch(/instance/i);
  });

  it.each([
    ["invalid_credentials", "Invalid login credentials", /don't match/i],
    ["email_not_confirmed", "Email not confirmed", /confirm/i],
    ["email_exists", "User already registered", /already has an account/i],
    ["weak_password", "Password should be at least 8 characters", /8 characters/i],
    ["over_request_rate_limit", "Request rate limit reached", /wait a minute/i],
    ["validation_failed", "Unable to validate email address", /doesn't look right/i],
    ["provider_disabled", "Unsupported provider: provider is not enabled", /isn't switched on/i],
  ])("turns %s into something actionable", (code, message, expected) => {
    expect(authErrorMessage({ code, message })).toMatch(expected);
  });

  /** Anything we have not seen still has to be safe: our words, and the phone number. */
  it.each([
    { code: "some_new_code", message: "pg_catalog relation does not exist" },
    { message: "new row violates row-level security policy for table portal_clients" },
    { message: "fetch failed" },
    {},
    null,
    undefined,
  ])("falls back to our own words for %j", (err) => {
    const m = authErrorMessage(err);
    expect(m).toContain(SITE.phone);
    expect(m).not.toMatch(/row-level|pg_catalog|relation|fetch failed/i);
  });

  /** House rule, and it applies to error copy too. */
  it("uses no em dashes", () => {
    for (const code of ["signup_disabled", "invalid_credentials", "unknown"]) {
      expect(authErrorMessage({ code })).not.toMatch(/[—–]/);
    }
  });

  /** Every message should be a sentence a person could read aloud, not a fragment. */
  it("always ends in a full stop", () => {
    for (const code of [
      "signup_disabled",
      "email_exists",
      "invalid_credentials",
      "email_not_confirmed",
      "weak_password",
      "over_request_rate_limit",
      "validation_failed",
      "provider_disabled",
      "anything_else",
    ]) {
      expect(authErrorMessage({ code }), code).toMatch(/\.$/);
    }
  });
});
