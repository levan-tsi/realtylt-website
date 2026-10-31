// Which resources answer 404 on the two pages (the probe's two console lines per page).
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://127.0.0.1:3108";
const b = await chromium.launch();
for (const slug of ["ai-audit-small-business-what-not-to-automate", "seller-disclosure-requirements-new-york"]) {
  const p = await (await b.newContext()).newPage();
  await p.route("**/api/media/**", (r) => r.abort());
  const bad = [];
  p.on("response", (r) => r.status() >= 400 && bad.push(`${r.status()} ${new URL(r.url()).pathname}`));
  await p.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle" });
  console.log(slug, JSON.stringify(bad));
}
await b.close();
