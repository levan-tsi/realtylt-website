import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE RESET EMAIL MUST LAND ON A PAGE THAT TAKES A PASSWORD.
 *
 * Measured 2026-08-24: "Forgot your password?" sent a working recovery link whose landing
 * page (/portal/profile) had no password field — the visitor arrived holding a valid
 * recovery session and nowhere to spend it. The flow is three files that only work while
 * they agree with each other, and nothing but this test holds them together:
 *
 *   SignInModal      → aims the email at /auth/callback?next=/auth/reset
 *   app/auth/reset   → the page that link lands on
 *   ResetPasswordForm → the updateUser({ password }) write, and the expired-link state
 *
 * Source-level, in the a11y-modals idiom: the behaviour lives in a browser redirect chain
 * a unit test cannot drive, but the contract between the files is plain text.
 */

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("password reset flow", () => {
  it("the sign-in modal aims the reset email at /auth/reset", () => {
    const modal = read("components/auth/SignInModal.tsx");
    expect(modal).toMatch(/resetPasswordForEmail/);
    expect(modal).toContain("/auth/callback?next=/auth/reset");
    // The old dead-end landing must not come back.
    expect(modal).not.toContain("next=/portal/profile");
  });

  it("the landing page exists, is noindex, and renders the form", () => {
    const page = read("app/auth/reset/page.tsx");
    expect(page).toContain("ResetPasswordForm");
    expect(page).toMatch(/index:\s*false/);
  });

  it("the form takes the password, in the sign-up form's own terms", () => {
    const form = read("components/auth/ResetPasswordForm.tsx");
    // The one write the page exists for.
    expect(form).toMatch(/updateUser\(\{\s*password\s*\}\)/);
    // An expired link is a designed state, not a crash: no user → explain + a way back in.
    expect(form).toMatch(/!user/);
    expect(form).toMatch(/openSignIn/);
    // The two doors to the same account must not disagree about what a password is.
    const modal = read("components/auth/SignInModal.tsx");
    expect(form).toContain("minLength={8}");
    expect(modal).toContain("minLength={8}");
    expect(form).toContain('autoComplete="new-password"');
  });

  it("the callback route still refuses off-origin next targets the reset link rides on", () => {
    const route = read("app/auth/callback/route.ts");
    expect(route).toMatch(/startsWith\("\/"\)/);
    expect(route).toMatch(/startsWith\("\/\/"\)/);
  });
});
