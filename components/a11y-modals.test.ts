import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** `aria-modal="true"` is a promise to assistive tech: while this thing is open, nothing
 * behind it exists. A dialog that makes that promise and then lets Tab walk into the page
 * behind it is worse than one that never claimed to be modal.
 *
 * Measured 2026-07-27: SignInModal and the ServiceToc bottom sheet both claimed aria-modal
 * with no focus trap and no scroll lock — Tab reached the footer links behind them and the
 * page scrolled under the sheet. This is a SOURCE-level guard (the same idiom the ISR-window
 * test in lib/blog/index.test.ts uses) because the behaviour lives in effects that need a
 * real browser to exercise; the browser proof is scripts/_scratch-focus.mjs.
 *
 * The two blog ToCs were first left out as another workstream's files. They carried the SAME
 * defect, that workstream was idle with a clean tree, and the fix was already proven in
 * ServiceToc — so they were fixed and pulled into scope rather than left as a known hole on a
 * launch asset.
 */
const OWNED_MODALS = [
  "components/auth/SignInModal.tsx",
  "components/blog/ArticleToc.tsx",
  "components/blog/FlagshipToc.tsx",
  "components/idx/ListingGallery.tsx",
  "components/leads/ListingLeadCTAs.tsx",
  "components/leads/QualifyingWizard.tsx",
  "components/search/SaveSearchDialog.tsx",
  "components/services/ServiceToc.tsx",
];

const read = (f: string) => fs.readFileSync(path.join(process.cwd(), f), "utf8");

describe("every modal we own keeps the aria-modal promise", () => {
  it.each(OWNED_MODALS)("%s still declares aria-modal", (file) => {
    expect(read(file)).toContain('aria-modal="true"');
  });

  it.each(OWNED_MODALS)("%s traps Tab inside the panel", (file) => {
    const src = read(file);
    // Written either as an early `!== "Tab"` bail or an `=== "Tab"` branch — both fine.
    expect(src, "no Tab handler").toMatch(/e\.key (!==|===) "Tab"/);
    // Wrap-around in BOTH directions, or the trap is one-way and Tab still escapes.
    expect(src, "no shift+Tab branch").toContain("e.shiftKey");
    expect(src, "shift+Tab does not wrap back to the last item").toContain("last.focus()");
    expect(src, "Tab does not wrap round to the first item").toContain("first.focus()");
    expect(src, "wrap does not preventDefault, so the browser moves focus anyway")
      .toContain("e.preventDefault()");
  });

  it.each(OWNED_MODALS)("%s locks body scroll while open and releases it on close", (file) => {
    const src = read(file);
    expect(src).toContain('document.body.style.overflow = "hidden"');
    // The cleanup must put back what was there, not hard-code "".
    expect(src).toMatch(/document\.body\.style\.overflow = prev/);
  });

  it.each(OWNED_MODALS)("%s closes on Escape", (file) => {
    expect(read(file)).toContain('"Escape"');
  });
});

describe("focus is handed back when a modal closes", () => {
  // Each of these owns the restore differently, so assert the mechanism each one actually
  // uses rather than one shape that would not fit all of them.
  it("SignInModal restores via AuthProvider, which captures the trigger in the click handler", () => {
    const provider = read("components/auth/AuthProvider.tsx");
    expect(provider).toContain("modalTriggerRef");
    // Captured inside openSignIn — NOT in an effect, where the modal's autoFocus input has
    // already taken focus and the real trigger is unrecoverable.
    const openSignIn = provider.slice(provider.indexOf("const openSignIn"), provider.indexOf("const signInWithPassword"));
    expect(openSignIn).toContain("document.activeElement");
    expect(openSignIn).toContain("modalTriggerRef.current =");
    expect(provider).toContain("trigger?.isConnected");
  });

  it("ServiceToc restores by selector, because its trigger unmounts while the sheet is open", () => {
    const src = read("components/services/ServiceToc.tsx");
    expect(src).toContain('document.querySelector<HTMLElement>("[data-toc-trigger]")?.focus()');
    expect(src).toContain("[data-toc-trigger]");
  });

  it.each([
    "components/search/SaveSearchDialog.tsx",
    "components/leads/QualifyingWizard.tsx",
    "components/idx/ListingGallery.tsx",
    "components/leads/ListingLeadCTAs.tsx",
  ])("%s remembers the element it opened from", (file) => {
    expect(read(file)).toMatch(/document\.activeElement as HTMLElement \| null/);
  });
});

describe("the lead form hands focus to its own success message", () => {
  it("focuses the role=status panel once the submit button is gone", () => {
    const src = read("components/leads/LeadForm.tsx");
    expect(src).toContain("successRef");
    expect(src).toMatch(/if \(status === "success"\) successRef\.current\?\.focus\(\)/);
    // The panel must stay programmatically focusable for that to land.
    expect(src).toMatch(/ref=\{successRef\}[\s\S]{0,80}tabIndex=\{-1\}/);
  });
});
