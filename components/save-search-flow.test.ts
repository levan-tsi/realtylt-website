import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** ONE ACTION, ONE NAME, ALL THE WAY THROUGH.
 *
 * The listing page's "Never miss a property" band used to label its control "Sign Up". It opens
 * the save-search dialog, whose heading is "Save this search" — so the button promised an account
 * and delivered something else. Worse, accounts are shut: SaveSearchDialog hides BOTH of its
 * sign-in affordances behind `accountsEnabled`, so the single thing the label named was the one
 * thing that could not happen.
 *
 * A source scan rather than a render, for the same reason design-system.test.ts is one: the drift
 * happens when someone retypes the string, and that is where it should be caught. It survived
 * several rounds and an adversarial review as a line in a carried-defects list, which is what a
 * finding does when nothing guards it.
 */

const ROOT = path.resolve(__dirname, "..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

const LISTING = "components/listing/ListingDetail.tsx";
const DIALOG = "components/search/SaveSearchDialog.tsx";

/** The band's CTA: the <Link> inside the never-miss section, minus its inline bell <svg>. */
function bandCtaLabel(src: string): string {
  const section = src.slice(src.indexOf('aria-labelledby="never-miss-heading"'));
  const link = section.slice(section.indexOf("<Link"), section.indexOf("</Link>"));
  return link
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The dialog's own heading for the un-saved state. */
function dialogTitle(src: string): string {
  const m = src.match(/<h2 id=\{titleId\}[^>]*>\s*([^<{][^<]*?)\s*<\/h2>/g) ?? [];
  const titles = m.map((h) => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
  // "Search saved." is the success state; the form's heading is the one the CTA leads to.
  return titles.find((t) => !t.endsWith("saved.")) ?? "";
}

describe("the never-miss band and the dialog it opens", () => {
  it("uses the same words for the action in both places", () => {
    const cta = bandCtaLabel(read(LISTING));
    const title = dialogTitle(read(DIALOG));
    expect(title).toBe("Save this search");
    expect(cta.toLowerCase()).toBe(title.toLowerCase());
  });

  it("never labels the control as an account action", () => {
    // "Sign Up" / "Sign In" here would re-promise the one thing the shut-accounts build cannot do.
    const cta = bandCtaLabel(read(LISTING));
    expect(cta).not.toMatch(/sign\s*(up|in)|register|create account/i);
  });

  it("still points at the save-search deep link the dialog is triggered by", () => {
    // The label is only honest while the href still opens that dialog. SearchClient reads
    // saveSearch=1 and opens it once, so the two halves must stay wired together.
    expect(read(LISTING)).toMatch(/href=\{`\/search\?county=\$\{l\.county\}.*saveSearch=1`\}/);
    expect(read("components/search/SearchClient.tsx")).toMatch(/searchParams\.get\("saveSearch"\) === "1"/);
  });
});
