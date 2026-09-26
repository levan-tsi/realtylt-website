import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SITE } from "./site";

/** A "CALL" CONTROL SHOWS THE NUMBER (owner, 2026-09-25: "on agent profile call box was not doing
 * anything"). A `tel:` link does nothing visible on most computers, so a control that says only
 * "Call" gives a desktop visitor nothing at all. Every control that dials carries the number in its
 * own label, read from the one constant (lib/site.ts), never typed. */
const ROOT = path.resolve(__dirname, "..");

function tsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...tsxFiles(rel));
    else if (/\.tsx$/.test(e.name) && !/\.test\./.test(e.name)) out.push(rel);
  }
  return out;
}

/** Each JSX element that dials: from its `href={SITE.…PhoneHref}` to the end of its element. */
function dialers(): { file: string; body: string }[] {
  const found: { file: string; body: string }[] = [];
  for (const file of [...tsxFiles("app"), ...tsxFiles("components")]) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    for (const m of src.matchAll(/href=\{SITE\.(phoneHref|connectPhoneHref)\}/g)) {
      const rest = src.slice(m.index!);
      // A self-closing dialer (a ContactRow) ends at its own `/>`; any other ends at its closing
      // tag, past whatever icon (with self-closing paths of its own) it carries.
      const tagEnd = rest.search(/\/?>/);
      const selfClosing = rest.slice(tagEnd, tagEnd + 2) === "/>";
      const end = selfClosing ? tagEnd : rest.search(/<\/(a|Button|Link|TrackedButton)>/);
      found.push({ file: file.split(path.sep).join("/"), body: rest.slice(0, end === -1 ? 400 : end) });
    }
  }
  return found;
}

describe("every control that dials shows the number", () => {
  const all = dialers();

  it("finds the site's dialling controls", () => {
    expect(all.length).toBeGreaterThan(15);
  });

  it.each(dialers().map((d) => [d.file, d.body]))("%s", (_file, body) => {
    // The label reads the constant (SITE.phone / SITE.connectPhone), or the control is a
    // ContactRow-style row whose `value` prop is the number.
    expect(body).toMatch(/\{SITE\.(phone|connectPhone)\}|value=\{SITE\.(phone|connectPhone)\}/);
  });

  it("the profile's Call button reads the number (the one the owner pressed)", () => {
    const src = fs.readFileSync(path.join(ROOT, "app/who-we-are/page.tsx"), "utf8");
    expect(src).toContain("<Button href={SITE.phoneHref}>Call {SITE.phone}</Button>");
    expect(SITE.phone).toMatch(/^\(\d{3}\) \d{3}-\d{4}$/);
  });
});
