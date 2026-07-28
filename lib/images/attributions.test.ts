import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * The licence record and the filesystem must not drift.
 *
 * ATTRIBUTIONS.md had fallen nine images behind reality by round 11 — six of them stock
 * photographs lifted from the old IDX vendor's CDN during the parity rounds, with no licence
 * of any kind on record. Nobody noticed because nothing checked. This checks.
 */
const ROOT = path.resolve(import.meta.dirname, "..", "..", "public", "images");
const DOC = path.join(ROOT, "ATTRIBUTIONS.md");

function imagesOnDisk(dir = ROOT): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...imagesOnDisk(full));
    else if (/\.(jpe?g|png|webp|avif|gif|svg)$/i.test(entry.name)) {
      out.push("public/images/" + path.relative(ROOT, full).split(path.sep).join("/"));
    }
  }
  return out;
}

const doc = fs.readFileSync(DOC, "utf8");
const listed = new Set(
  [...doc.matchAll(/^\| (public\/images\/\S+?) \|/gm)].map((m) => m[1]),
);
const onDisk = imagesOnDisk();

describe("public/images/ATTRIBUTIONS.md", () => {
  it("records a licence for every image that ships", () => {
    const missing = onDisk.filter((f) => !listed.has(f)).sort();
    expect(missing, `add these to ATTRIBUTIONS.md:\n${missing.join("\n")}`).toEqual([]);
  });

  it("does not list files that no longer exist", () => {
    const disk = new Set(onDisk);
    const stale = [...listed].filter((f) => !disk.has(f)).sort();
    expect(stale, `remove these from ATTRIBUTIONS.md:\n${stale.join("\n")}`).toEqual([]);
  });

  it("finds no CC BY-SA image, which the project deliberately does not use", () => {
    const sa = [...doc.matchAll(/^\| (public\/images\/\S+?) \|.*\|\s*(BY-SA[^|]*)\|/gim)].map(
      (m) => `${m[1]} (${m[2].trim()})`,
    );
    expect(sa).toEqual([]);
  });

  it("still ships something to attribute", () => {
    expect(onDisk.length).toBeGreaterThan(20);
  });
});
