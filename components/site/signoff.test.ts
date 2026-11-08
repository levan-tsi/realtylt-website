import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SITE } from "@/lib/site";

/** THE FOOTER'S SIGN-OFF, AGAINST THE PUBLIC RECORD (round 69).
 *
 * 19 NYCRR 175.25 (the Department of State's text, quoted in jvc-research/round43/f/VERDICTS-sell.md §L1, read
 * 2026-11-05) asks an advertisement that names a salesperson to print the brokerage's name ((c)(2)), the name under
 * which the licensee is licensed ((c)(3)) and the type of licence held ((c)(4)); "broker" alone as a title is
 * prohibited. The state's record (data.ny.gov "Active Real Estate Salespersons and Brokers", rows updated
 * 2026-11-04): license_type "REAL ESTATE SALESPERSON", business_name "UNITED REAL ESTATE HUDSON VALLEY EDGE". The
 * footer said "© 2026 Levan Tsiklauri | United Real Estate" (the short name, no licence type); every page wears it.
 * The constants live in lib/site.ts so a page that needs the sign-off reads the same words.
 */
const ROOT = path.resolve(__dirname, "../..");
const footer = fs.readFileSync(path.join(ROOT, "components/site/Footer.tsx"), "utf8");

describe("the footer sign-off", () => {
  it("carries the licence type and the brokerage's name as the state's record states them", () => {
    expect(SITE.licensee).toBe("Levan Tsiklauri");
    expect(SITE.licenseType).toBe("Licensed Real Estate Salesperson");
    expect(SITE.brokerage).toBe("United Real Estate Hudson Valley Edge");
  });

  it("prints them in the copyright line, from the constants", () => {
    expect(footer).toContain("&copy; {new Date().getFullYear()} {SITE.licensee}, {SITE.licenseType}, {SITE.brokerage}. {SITE.disclaimer}");
    expect(footer).not.toContain("{SITE.legalName}. {SITE.disclaimer}");
  });

  it("never calls him a broker", () => {
    expect(`${SITE.licenseType} ${SITE.brokerage}`).not.toMatch(/\bbroker\b/i);
  });
});
