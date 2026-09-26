import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** ROUND 60, THE REST OF THE DARK SITE (the owner: "white background is not covering text or
 * anything like that"). Each of these was found by opening the surface on the running build: a
 * white ground that survived the theme flip because it was written as a literal colour, or a dark
 * band whose `bg-ink` turned to moon on the night page. These hold them. */
const root = path.resolve(__dirname, "..");
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");
const walk = (dir: string, out: string[] = []) => {
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx") && !p.includes(".test.")) out.push(p);
  }
  return out;
};

describe("the dark site's surfaces", () => {
  it("gives the portal no white card (they take the night card)", () => {
    for (const f of [...walk("app/portal"), ...walk("components/portal")]) {
      expect(read(f), f).not.toMatch(/\bbg-white(?![/\w-])/);
    }
  });

  it("keeps the portal's dark bands dark (their bg-ink is the day's black inside .daylight)", () => {
    expect(read("components/portal/PortalShell.tsx")).toMatch(/<header className="daylight bg-ink/);
    expect(read("components/portal/TalkToAgent.tsx")).toMatch(/className="daylight [^"]*bg-ink text-paper"/);
  });

  it("paints a waiting photo tile in the night's raised step, never the day's mist", () => {
    // The listing page's photo band is a .daylight section, where `mist` is near-white.
    expect(read("components/idx/MlsImage.tsx")).toMatch(/rlt-skeleton absolute inset-0 bg-night-raise/);
  });

  it("grounds the home rail's listing card on the night card, not a white one under its cover", () => {
    expect(read("components/idx/ListingCard.tsx")).toMatch(/<article className="lift group relative overflow-hidden rounded-2xl bg-card /);
  });

  it("gives a light-red error ground a night counterpart wherever one is written", () => {
    for (const f of [...walk("app"), ...walk("components")]) {
      const s = read(f);
      for (const m of s.matchAll(/"[^"]*\bbg-(?:red|rose)-50\b[^"]*"/g)) {
        expect(m[0], f).toMatch(/night:bg-/);
      }
    }
  });

  it("sets each heading in one weight (no bold utility on a strong half)", () => {
    for (const f of [...walk("app"), ...walk("components")]) {
      expect(read(f), f).not.toContain('<strong className="font-bold">');
    }
  });

  it("brings no blue glow into the blog index hero", () => {
    expect(read("app/blog/page.tsx")).not.toMatch(/rgba\(40,\s*168,\s*224/);
  });
});
