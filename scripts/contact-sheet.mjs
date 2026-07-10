// Build a labeled contact sheet of public/images and screenshot it (visual verification aid).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const cwd = process.cwd().replace(/\\/g, "/");
const root = "public/images";
const files = [];
for (const dir of ["hero", "counties", "lifestyle", "listings"]) {
  const d = path.join(root, dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (/\.(jpe?g|png)$/i.test(f)) files.push(`${dir}/${f}`);
}
const cells = files
  .map(
    (f) =>
      `<div style="position:relative"><img src="file:///${cwd}/public/images/${f}" style="width:100%;height:130px;object-fit:cover;display:block"><span style="position:absolute;bottom:0;left:0;background:#000c;color:#fff;font:10px monospace;padding:1px 3px">${f}</span></div>`,
  )
  .join("");
fs.mkdirSync("docs/verify", { recursive: true });
fs.writeFileSync(
  "docs/verify/_contact.html",
  `<body style="margin:0"><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:2px">${cells}</div>`,
);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
await p.goto(`file:///${cwd}/docs/verify/_contact.html`, { waitUntil: "load" });
await p.waitForTimeout(2500);
await p.screenshot({ path: "docs/verify/_contact.png", fullPage: true });
await b.close();
console.log(`contact sheet: ${files.length} images -> docs/verify/_contact.png`);
