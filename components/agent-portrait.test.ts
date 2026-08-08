import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * One face, one treatment.
 *
 * /images/levan-portrait.jpg is rendered on five surfaces: the who-we-are agent card, the
 * connect booking column, the blog author card, the listing detail's tour panel, and the
 * service lead panel. Round 25 found only ONE of them (who-we-are) desaturating it, so the
 * owner's own photograph appeared in colour on four surfaces of a site whose photography is
 * greyscale everywhere else — including a few hundred pixels from its own greyscale copy on
 * /connect. Nobody noticed because nothing checked.
 *
 * The treatment is a one-word class, which is exactly the kind of thing that drifts back apart
 * the next time a card is added. So it is checked rather than remembered.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = "/images/levan-portrait.jpg";
const SEARCH_DIRS = ["app", "components"];

function filesReferencingPortrait(dir: string): string[] {
  const out: string[] = [];
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return out;
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesReferencingPortrait(rel));
    else if (/\.tsx$/.test(entry.name) && fs.readFileSync(path.join(ROOT, rel), "utf8").includes(SRC)) {
      out.push(rel.split(path.sep).join("/"));
    }
  }
  return out;
}

const files = filesReferencingPortrait(".").map((f) => f.replace(/^\.\//, ""));

/** The JSX element that carries the portrait: from its src to the end of that tag. */
function portraitElements(file: string): string[] {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  const out: string[] = [];
  let i = text.indexOf(SRC);
  while (i !== -1) {
    const end = text.indexOf("/>", i);
    out.push(text.slice(i, end === -1 ? i + 600 : end));
    i = text.indexOf(SRC, i + 1);
  }
  return out;
}

describe("the agent portrait", () => {
  it("is rendered on the surfaces this test knows about", () => {
    // A guard on the guard: if the portrait lands somewhere new, this list is what makes the
    // reviewer look, instead of the new surface quietly inheriting no coverage.
    expect(files.length).toBeGreaterThanOrEqual(5);
    expect(files.filter((f) => f.startsWith("app/") || f.startsWith("components/"))).toEqual(files);
  });

  it("is desaturated everywhere it appears", () => {
    const colour = files.filter((f) => portraitElements(f).some((el) => !el.includes("grayscale")));
    expect(
      colour,
      `these render the portrait in colour; add \`grayscale\` to the Image className:\n${colour.join("\n")}`,
    ).toEqual([]);
  });
});
