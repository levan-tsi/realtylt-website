// Post bodies live as template literals in content/blog/ai-posts.ts (~500 KB). Rewriting one
// through an editor means quoting 25 KB of old text to replace it. This moves a body out to a
// plain markdown file and back, so a rewrite costs one read and one write.
//
//   node scripts/post-body.mjs list
//   node scripts/post-body.mjs extract INVOICING_POST out.md
//   node scripts/post-body.mjs inject  INVOICING_POST in.md
//
// inject refuses a body that breaks a house rule the file header states (em dash, arrow glyph)
// or that changes the set of [[scene:...]] markers or the ## headings: those are structure, and
// the simplification pass (owner 2026-09-18) changes LANGUAGE only.

import fs from "node:fs";

const FILE = "content/blog/ai-posts.ts";
const [cmd, name, file] = process.argv.slice(2);
const src = fs.readFileSync(FILE, "utf8");

const unesc = (s) => s.replace(/\\([`$\\])/g, "$1");
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

function locate(exportName) {
  const head = `export const ${exportName} = \``;
  const start = src.indexOf(head);
  if (start < 0) throw new Error(`no export ${exportName} in ${FILE}`);
  const bodyStart = start + head.length;
  let i = bodyStart;
  for (; i < src.length; i++) {
    if (src[i] === "\\") { i++; continue; }
    if (src[i] === "`") break;
  }
  return { bodyStart, bodyEnd: i };
}

const structure = (md) => ({
  scenes: [...md.matchAll(/\[\[scene:[^\]]+\]\]/g)].map((m) => m[0]),
  headings: [...md.matchAll(/^#{2,4} .+$/gm)].map((m) => m[0].trim()),
});

if (cmd === "list") {
  for (const m of src.matchAll(/^export const (\w+) = `/gm)) console.log(m[1]);
} else if (cmd === "extract") {
  const { bodyStart, bodyEnd } = locate(name);
  fs.writeFileSync(file, unesc(src.slice(bodyStart, bodyEnd)));
  console.log(`extracted ${name} -> ${file} (${bodyEnd - bodyStart} bytes)`);
} else if (cmd === "inject") {
  const { bodyStart, bodyEnd } = locate(name);
  const next = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").replace(/\s+$/, "");
  const problems = [];
  if (/—/.test(next)) problems.push("em dash in the new body");
  if (/[←-⇿⟵-⟿]/.test(next)) problems.push("arrow glyph in the new body");
  const was = structure(unesc(src.slice(bodyStart, bodyEnd)));
  const now = structure(next);
  if (was.scenes.join("|") !== now.scenes.join("|")) problems.push(`scene markers changed:\n   was ${was.scenes.join(" ")}\n   now ${now.scenes.join(" ")}`);
  if (was.headings.join("|") !== now.headings.join("|")) {
    const lost = was.headings.filter((h) => !now.headings.includes(h));
    const added = now.headings.filter((h) => !was.headings.includes(h));
    problems.push(`headings changed: lost ${JSON.stringify(lost)} added ${JSON.stringify(added)}`);
  }
  if (problems.length) {
    console.error(`REFUSED ${name}:\n - ${problems.join("\n - ")}`);
    process.exit(1);
  }
  fs.writeFileSync(FILE, src.slice(0, bodyStart) + esc(next) + src.slice(bodyEnd));
  console.log(`injected ${file} -> ${name} (${bodyEnd - bodyStart} -> ${esc(next).length} bytes)`);
} else {
  console.error("usage: post-body.mjs list | extract NAME out.md | inject NAME in.md");
  process.exit(1);
}
