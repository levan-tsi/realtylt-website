import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE SITE MAY NOT OFFER A DOOR THE AUTH SERVER WILL REFUSE.
 *
 * Measured on the deployment 2026-08-18: `disable_signup` was true and `external.google` was
 * false on the project, and the site offered both anyway. Pressing "Create account" spent a
 * visitor's name, email and password to earn a refusal; pressing "Continue with Google" left
 * realtylt.com entirely and landed them on
 *
 *     {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: …"}
 *
 * on supabase.co — because supabase-js does not round-trip the provider, it hands the browser
 * to /authorize, so a disabled provider is not an error the app can catch and phrase.
 *
 * Both are now gated on what the project actually reports (lib/auth/doors.ts). This is a
 * SOURCE-level ratchet, the same idiom as a11y-modals.test.ts: the behaviour lives in runtime
 * state a unit test cannot mount, and the failure mode being guarded is someone deleting the
 * guard. The browser proof is scripts/_scratch-r35-after.mjs.
 */
const read = (f: string) => fs.readFileSync(path.join(process.cwd(), f), "utf8");

describe("no account door is offered before it opens", () => {
  it("the Google button renders only when the provider is enabled", () => {
    const src = read("components/auth/SignInModal.tsx");
    expect(src).toContain("{googleEnabled && (");
    // and the button itself is inside that branch
    const gate = src.indexOf("{googleEnabled && (");
    expect(src.indexOf("Continue with Google")).toBeGreaterThan(gate);
  });

  it("signInWithGoogle refuses before it can redirect off-site", () => {
    const src = read("components/auth/AuthProvider.tsx");
    expect(src).toContain("if (!googleEnabled)");
  });

  it("the sign-up form cannot be reached while sign-up is shut", () => {
    const src = read("components/auth/SignInModal.tsx");
    // One fold, so EVERY openSignIn("signup") call site degrades, not just the ones we found.
    expect(src).toContain('modalMode === "signup" && signupOpen');
  });

  it.each([
    ["components/auth/SignInModal.tsx", "signupOpen ? ("],
    ["components/search/SavedClient.tsx", "{signupOpen && ("],
    ["components/portal/PortalShell.tsx", "{signupOpen && ("],
  ])("%s gates its account-creation offer", (file, marker) => {
    expect(read(file)).toContain(marker);
  });

  it.each([
    "components/auth/SignInModal.tsx",
    "components/search/SavedClient.tsx",
    "components/portal/PortalShell.tsx",
  ])("%s gives a closed-door visitor a way to reach a person", (file) => {
    const src = read(file);
    expect(src).toContain("New accounts aren&rsquo;t open yet");
    expect(src).toContain("SITE.phoneHref");
  });

  it("the config route carries the doors to the browser", () => {
    const src = read("app/api/auth/config/route.ts");
    expect(src).toContain("getAuthDoors");
    expect(src).toContain("signupOpen: doors.signupOpen");
    expect(src).toContain("google: doors.google");
  });

  it("the provider defaults both doors to shut, so an unanswered config hides them", () => {
    const src = read("components/auth/AuthProvider.tsx");
    expect(src).toContain("useState(false)");
    expect(src).toContain("setSignupOpen(cfg.signupOpen === true)");
    expect(src).toContain("setGoogleEnabled(cfg.google === true)");
  });
});
