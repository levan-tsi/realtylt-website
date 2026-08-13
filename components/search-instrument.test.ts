import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * One instrument, one geometry.
 *
 * The `search-instrument` control (a field and its action sharing one body) exists in two
 * places: the home hero's search bar and the /home-value address bar. Round 11 declared them
 * "the same instrument" and round 27 measured the truth: the promised breathing inset was 0px
 * between the field's edge and the button's, and the owner rejected the butted-together
 * reading a second time. The round-27 geometry is: container on the 16px panel radius
 * (`rounded-2xl`), an 8px inset (`p-2`) and an 8px gap (`gap-2`) around the 8px-radius
 * action — concentric on the site scale (16 = 8 + 8).
 *
 * Two call sites sharing a geometry by convention is exactly the kind of thing that drifts
 * apart the next time one of them is edited (it already happened once, between rounds 11 and
 * 27). So it is checked rather than remembered.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const SEARCH_DIRS = ["app", "components"];

function filesUsingInstrument(dir: string): string[] {
  const out: string[] = [];
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return out;
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUsingInstrument(rel));
    else if (
      /\.tsx$/.test(entry.name) &&
      fs.readFileSync(path.join(ROOT, rel), "utf8").includes('className="search-instrument')
    ) {
      out.push(rel.split(path.sep).join("/"));
    }
  }
  return out;
}

const files = SEARCH_DIRS.flatMap((d) => filesUsingInstrument(d));

/** The className string of each element that declares itself a search-instrument. */
function instrumentClassNames(file: string): string[] {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  return [...text.matchAll(/className="(search-instrument[^"]*)"/g)].map((m) => m[1]);
}

describe("the search instrument", () => {
  it("exists on the surfaces this test knows about", () => {
    expect(files.sort()).toEqual(["app/page.tsx", "components/leads/HomeValueForm.tsx"]);
  });

  it("keeps the round-27 geometry at every call site", () => {
    for (const file of files) {
      for (const cls of instrumentClassNames(file)) {
        for (const token of ["rounded-2xl", "p-2", "gap-2"]) {
          expect(cls, `${file}: search-instrument lost \`${token}\` — the two instruments drift apart`).toContain(token);
        }
        expect(cls, `${file}: a search-instrument must not carry a second radius`).not.toMatch(/rounded-xl(?!\S)/);
      }
    }
  });
});
