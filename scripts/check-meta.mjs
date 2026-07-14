/* Print canonical + Open Graph + Twitter meta for a page. Usage: node scripts/check-meta.mjs <url> */
const url = process.argv[2] || "http://localhost:3002/blog/workflow-automation-real-estate-business";
const html = await (await fetch(url)).text();
const grab = (re) => [...html.matchAll(re)].map((m) => m[0]);
const out = [
  ...grab(/<link rel="canonical"[^>]*>/g),
  ...grab(/<meta property="og:[^"]*" content="[^"]*"[^>]*>/g),
  ...grab(/<meta name="twitter:[^"]*" content="[^"]*"[^>]*>/g),
];
console.log(url);
for (const t of out) console.log("  " + t.replace(/<meta [^ ]*="/, "").replace(/"\/?>$/, "").replace(/" content="/, " = "));
console.log(`canonical:${/rel="canonical"/.test(html) ? "yes" : "NO"} og:title:${/og:title/.test(html) ? "yes" : "NO"} twitter:card:${/twitter:card/.test(html) ? "yes" : "NO"}`);
