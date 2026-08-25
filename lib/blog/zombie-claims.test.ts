import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** A retracted claim must not keep talking in a scene.
 *
 * WHY THIS EXISTS, and it is a real defect that shipped and sat on production.
 *
 * The chat flagship spends its second section proving that "78% of leads close with whoever
 * responds first" has no published report, no stated sample and no methodology behind it, and
 * ends that section with "So this article does not use it." Three separate surfaces carried
 * the number anyway, and each was found on a different day by a different person:
 *
 *   1. the body prose            (rewritten first)
 *   2. the "In short" summary    (caught a day later)
 *   3. the ResponseGap scene     (caught 2026-08-03, in twenty point type on full-bleed black)
 *
 * The third one survived two audits because of WHERE its copy lives. Both the prose and the
 * scene PAYLOADS are covered by scripts/_scratch-claims.mjs; a bespoke component's copy is in
 * neither, because it is a string literal inside a .tsx file. The chat post is the only post
 * in the cohort with bespoke components, which is exactly why it is the only one where this
 * could happen.
 *
 * So this reads the source of every place scene copy can live and fails on the three figures
 * this repo has already killed. Each is allowed to APPEAR, because refusing a number out loud
 * is the honest thing to do and two of our surfaces deliberately name it; what is not allowed
 * is naming it without disowning it in the same breath.
 *
 * See docs/blog-flagship/SOURCE-AUDIT.md for where each figure came from and why it is dead.
 */

const ROOT = process.cwd();

/** The figures this repo has checked and refused. Adding one here is how a retraction sticks. */
const ZOMBIES: { name: string; pattern: RegExp; why: string }[] = [
  {
    name: "the unsourceable 78%",
    pattern: /(seventy[ -]eight percent|\b78\s?(%|percent))/i,
    why: "attributed on hundreds of pages to a survey with no published report, no stated sample and no methodology",
  },
  {
    name: "23 minutes 15 seconds",
    pattern: /\b23 minutes(,| and)? 15 seconds|\b23 min(utes)? 15 sec/i,
    why: "the real CHI 2005 figure is 25 minutes 26 seconds",
  },
  {
    name: "$16,000 per text",
    pattern: /\$\s?16,?000\s*(per|a)\s*(text|message)/i,
    why: "a real number from the FTC's civil penalties, not from the TCPA claim an individual can bring, which is $500",
  },
  // ── Round B, 2026-08-25. Four claims killed on the services surface, three of them dollar
  // or share claims with nothing under them and one a comparative price. Each was hunted for
  // a primary document first; none has one.
  {
    name: "the unsourced 73% who read reviews before booking",
    pattern: /(seventy[ -]three percent|\b73\s?(%|percent))/i,
    why: "no primary survey states it. BrightLocal's Local Consumer Review Survey 2026 (panel of 1,002 US adults) reports 97% who read reviews for local businesses, 41% who always do, and 74% who look for reviews from the last three months. 73 is not in it",
  },
  {
    name: "tens of thousands in unworked commission",
    pattern: /tens of thousands in unworked/i,
    why: "an unsourced dollar claim about a database nobody has measured, on the one topic whose own flagship post refuses to state a rate because no independent study of cold database response exists",
  },
  {
    name: "a fraction of vendor pricing",
    pattern: /fraction of vendor pricing/i,
    why: "a comparative price claim against prices we have not read in a published document. The standing rule is that such a number is refused out loud, not printed",
  },
  {
    name: "40% of the numbers are dead",
    pattern: /\b40\s?(%|percent) of the (phone )?numbers/i,
    why: "written as a measurement and never was one. Nobody publishes a dead-number rate for bought lists",
  },
];

/** Words that mean the sentence is refusing the number rather than resting on it. */
const DISOWNED =
  /unsourc|declines? to use|does not use|cannot be sourced|nobody can (check|source|produce)|no published|no stated sample|no methodology|slogan wearing|deliberately not|not built on|refus|belongs to a different statute|is not the (TCPA|figure)|the real figure|wrong statute/i;

/** Every file where copy that a reader will SEE can live.
 *
 * content/services/** was added 2026-08-25, and it should have been here from the start. The
 * blog killed the 78% on 2026-08-02 and wrote this test on 2026-08-03; the chat SERVICE page
 * went on asserting it three times for another three weeks, in `why`, in `stat` and in an FAQ,
 * while linking to the post that debunks it (SERVICES-CRITIQUE.md §2a). A retraction that
 * covers the article and not the page selling the thing has retracted nothing: the commercial
 * surface is the one that ranks and the one an AI answer lifts from.
 *
 * Read from the directory rather than listed, so service number twenty-one is covered on the
 * day somebody writes it. */
const SOURCES = [
  // content/blog was a hand-written list of six files until 2026-08-25, and it had already
  // rotted: Round B added review-scenes.ts and booking-scenes.ts and neither was on it, so two
  // whole flagships of scene copy were outside the guard. That is the same failure the services
  // comment below describes, and it has the same fix. Read from the directory instead.
  ...fs
    .readdirSync(path.join(ROOT, "content/blog"))
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .map((f) => `content/blog/${f}`),
  ...fs
    .readdirSync(path.join(ROOT, "components/blog/scenes"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => `components/blog/scenes/${f}`),
  ...fs
    .readdirSync(path.join(ROOT, "components/blog/scenes/primitives"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => `components/blog/scenes/primitives/${f}`),
  ...fs
    .readdirSync(path.join(ROOT, "content/services"))
    .filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts")
    .map((f) => `content/services/${f}`),
];

/** Comments are where the HISTORY of a killed number is written down, and that history is the
 * thing that stops it coming back. Strip them so a docstring explaining the retraction does
 * not read as the retraction being asserted. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

/** A percentage in CSS is a coordinate, not a claim.
 *
 * The first run of this test failed on `radial-gradient(60% 50% at 78% 8%, ...)` — the wash
 * behind a dark grid. Blank the inside of a colour function and any line that is plainly
 * geometry, so the check reads copy and only copy. Replaced with spaces rather than deleted,
 * so the reported line numbers still point at the real line.
 */
function blankStyles(src: string): string {
  const keep = (m: string) => " ".repeat(m.length);
  return src
    .replace(/(radial|linear|conic)-gradient\([^)]*\)/g, keep)
    .replace(/\b(viewBox|transform|translate|width|height|cx|cy|x1|x2|y1|y2)\s*=\s*"[^"]*"/g, keep)
    .replace(/^.*\b(background|backgroundImage|inset|clip-path|maskImage)\s*:.*$/gm, keep);
}

describe("retracted claims stay retracted", () => {
  it("names at least one file to check", () => {
    // A probe that finds no targets reports a beautiful pass.
    expect(SOURCES.length).toBeGreaterThan(10);
    for (const f of SOURCES) expect(fs.existsSync(path.join(ROOT, f)), f).toBe(true);
    // And it is actually pointed at the commercial surface, not only at the blog. A glob that
    // silently matches nothing is the same beautiful pass wearing a directory read.
    expect(SOURCES.filter((f) => f.startsWith("content/services/")).length).toBe(20);
    // And every scene file, which is where a retracted number can keep talking in twenty point
    // type. Nine flagships, nine scene files, plus posts.ts and ai-posts.ts.
    expect(SOURCES.filter((f) => f.startsWith("content/blog/")).length).toBeGreaterThanOrEqual(11);
  });

  for (const file of SOURCES) {
    it(`${file} does not assert a figure this repo has refused`, () => {
      const src = blankStyles(stripComments(fs.readFileSync(path.join(ROOT, file), "utf8")));
      const lines = src.split("\n");
      const offences: string[] = [];
      for (const z of ZOMBIES) {
        lines.forEach((line, i) => {
          if (!z.pattern.test(line)) return;
          // The whole statement, not just the line: our refusals run long and wrap.
          const window = lines.slice(Math.max(0, i - 2), i + 3).join(" ");
          if (DISOWNED.test(window)) return;
          offences.push(
            `line ${i + 1}: ${z.name} (${z.why})\n      ${line.trim().slice(0, 140)}`,
          );
        });
      }
      expect(offences, offences.join("\n    ")).toEqual([]);
    });
  }
});
