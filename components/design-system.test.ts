import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE BOX VOCABULARY, ENFORCED.
 *
 * globals.css declares two hairlines and, since round 19, three shadows plus a dark-panel
 * variant. It also carries a comment explaining that the greys had ALREADY drifted once into
 * "seventeen near-identical greys ... not a set of decisions, a set of accidents", and that a
 * round was spent collapsing them into tokens.
 *
 * By round 19 there were 13 hardcoded greys again, 26 distinct corner radii against a 5-step
 * scale, and 16 arbitrary shadows in two different hues. The tokens had not failed — nothing
 * was guarding them, and a style guide loses to whoever is typing.
 *
 * So this is the guard. It is deliberately a plain source scan rather than a rendered check:
 * the rot happens at the moment someone types `border-[#e5e7eb]`, and that is where it should
 * be caught. Every rule below has an escape hatch that requires saying WHY in the code. */

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["components", "app"];

/** Representational artwork draws real objects — a laptop bezel, a phone body, the miniature
 * cards inside a mock screen. A laptop screen genuinely has a small corner inside a big one, so
 * forcing those onto the UI scale would make the drawing wrong. Files may opt out of the RADIUS
 * rule only, and only by carrying this marker with a reason next to it. Colour and shadow rules
 * still apply: a drawing is still lit by the same sun as the rest of the page. */
const ARTWORK_MARKER = "@design-artwork";
/** A single line may opt out by explaining itself inline. Kept narrow on purpose. */
const LINE_ESCAPE = "@design-allow";

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        // /lab is the hero sandbox — throwaway comparison stages, not shipped surface.
        if (/node_modules|\.next|[\\/]lab([\\/]|$)/.test(p)) continue;
        walk(p);
      } else if (e.name.endsWith(".tsx")) out.push(p);
    }
  };
  for (const d of SCAN_DIRS) walk(path.join(ROOT, d));
  return out;
}

type Hit = { file: string; line: number; text: string; token: string };

/** Blank out comment bodies, keeping newlines so line numbers still point at the right place.
 * Without this the scan reads English: "a 40px rounded segmented bar" and "a hard rectangle
 * inside the rounded shell" were both reported as off-scale radii. A gate that flags prose gets
 * switched off, so it has to read only what ships. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

function scan(re: RegExp, opts: { skipArtwork?: boolean } = {}): Hit[] {
  const hits: Hit[] = [];
  for (const file of sourceFiles()) {
    const raw = fs.readFileSync(file, "utf8");
    if (opts.skipArtwork && raw.includes(ARTWORK_MARKER)) continue;
    const rawLines = raw.split("\n");
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    // Match against the comment-stripped copy, but look for the escape marker in the RAW line —
    // the marker lives in a comment, so checking the stripped copy would erase the escape hatch
    // before it could ever be used.
    stripComments(raw).split("\n").forEach((line, i) => {
      // The marker may sit on the line itself or in a comment immediately above it — in JSX the
      // comment above is the readable place to put it, and a rule nobody can annotate legibly
      // is a rule people delete.
      if ([i, i - 1, i - 2].some((n) => n >= 0 && rawLines[n]?.includes(LINE_ESCAPE))) return;
      for (const m of line.matchAll(re)) {
        hits.push({ file: rel, line: i + 1, text: line.trim().slice(0, 100), token: m[0] });
      }
    });
  }
  return hits;
}

const report = (hits: Hit[]) => hits.map((h) => `${h.file}:${h.line}  ${h.token}`).join("\n");

describe("design system — the box vocabulary", () => {
  /** Two hairlines, and they are named. A hex border is always someone picking a grey alone,
   * without seeing it next to the other eleven. Note this catches ANY hex border colour, not
   * just greys: a one-off coloured rule is the same failure. */
  it("draws hairlines with the line tokens, never a hardcoded hex", () => {
    const hits = scan(/border(?:-[tblrxyse]{1,2})?-\[#[0-9a-fA-F]{3,8}\]/g);
    expect(report(hits), `Use border-line / border-line-strong (globals.css @theme).
If a surface genuinely needs its own colour, put it in @theme and say what it is for.
${report(hits)}`).toBe("");
  });

  /** One sun. Three steps: shadow-raise / shadow-lift / shadow-float, plus shadow-panel for
   * dark surfaces. An arbitrary shadow is a second light source, and two suns is visible. */
  it("raises boxes with the shadow scale, never an arbitrary shadow", () => {
    const hits = scan(/shadow-\[[^\]]+\]/g);
    expect(report(hits), `Use shadow-raise / shadow-lift / shadow-float / shadow-panel.
${report(hits)}`).toBe("");
  });

  /** Tailwind's own shadow scale is a different set of decisions from ours, and mixing the two
   * is how sixteen values happened. If ours are the site's shadows, theirs cannot also be. */
  it("does not mix Tailwind's default shadow scale with ours", () => {
    const hits = scan(/\bshadow-(?:sm|md|lg|xl|2xl|inner)\b/g);
    expect(report(hits), `Tailwind's shadow-sm/md/lg/xl/2xl are a second scale.
Map them onto shadow-raise / shadow-lift / shadow-float.
${report(hits)}`).toBe("");
  });

  /** The agreed corner scale: 8 badges/chips, 12 buttons/inputs, 16 cards/panels/media,
   * 24 large feature panels, full for pills. Five values, and they are load-bearing — the
   * radius is most of what tells a visitor whether two things are the same kind of thing. */
  it("uses the five-step corner scale on UI chrome", () => {
    // Spelled out rather than inferred by regex: a pattern like `-[tblrxyse]{1,2}` eats the `x`
    // of `rounded-xl` as a direction and then reports the site's most common radius as illegal.
    const DIRECTIONS = ["", "t", "b", "l", "r", "tl", "tr", "bl", "br", "s", "e", "ss", "se", "es", "ee"];
    const SIZES = ["lg", "xl", "2xl", "3xl", "full"];
    const SANCTIONED = new Set(
      DIRECTIONS.flatMap((d) => SIZES.map((s) => (d ? `rounded-${d}-${s}` : `rounded-${s}`))),
    );
    // Grab the WHOLE utility token (stops at the space between classes) so `rounded-t-2xl` and
    // `rounded-b-[10px]` are each judged as one thing.
    const hits = scan(/\brounded(?:-\[[^\]]+\]|-[a-z0-9]+)*/g, { skipArtwork: true }).filter(
      (h) => !SANCTIONED.has(h.token),
    );
    expect(report(hits), `Corner scale: rounded-lg 8 / rounded-xl 12 / rounded-2xl 16 / rounded-3xl 24 / rounded-full.
A file that DRAWS a real object (device mockup) may opt out of this rule alone by carrying
the marker "${ARTWORK_MARKER}" with a reason.
${report(hits)}`).toBe("");
  });
});

describe("design system — the tokens exist", () => {
  const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8");
  // A rule that scans for token USE is worthless if the token itself gets renamed away.
  it.each([
    "--color-line:",
    "--color-line-strong:",
    "--shadow-raise:",
    "--shadow-lift:",
    "--shadow-float:",
    "--shadow-panel:",
    "--shadow-edge:",
    "--color-graphite:",
  ])("declares %s in @theme", (token) => {
    expect(css).toContain(token);
  });

  /** One hue. The whole point of the shadow pass: pure-black and blue-black shadows on the
   * same page read as two light sources. */
  it("lights every shadow token from the same hue", () => {
    const decls = [...css.matchAll(/--shadow-[a-z-]+:\s*([^;]+);/g)].map((m) => m[1]);
    expect(decls.length).toBeGreaterThan(0);
    const colours = decls.flatMap((d) => [...d.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => m[1].trim()));
    const hues = new Set(
      colours
        // the inset top highlight on dark panels is a HIGHLIGHT, not a shadow — white on purpose
        .filter((c) => !/^255 255 255/.test(c))
        .map((c) => c.replace(/\s*\/.*$/, "").trim()),
    );
    expect([...hues], `Every shadow must share one hue. Found: ${[...hues].join(" | ")}`).toEqual([
      "16 24 32",
    ]);
  });
});
