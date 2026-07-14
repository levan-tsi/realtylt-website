/* Extract and validate the JSON-LD on an article page.
 * Usage: node scripts/check-jsonld.mjs <url> */

const url = process.argv[2] || "http://localhost:3002/blog/workflow-automation-real-estate-business";
const html = await (await fetch(url)).text();

const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => {
  // Undo the < / > / & escaping jsonLdScript applies, then parse.
  const raw = m[1].replace(/\\u003c/g, "<").replace(/\\u003e/g, ">").replace(/\\u0026/g, "&");
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { PARSE_ERROR: e.message, raw: raw.slice(0, 80) };
  }
});

let problems = 0;
const need = (cond, msg) => {
  if (!cond) {
    problems++;
    console.log(`  MISSING: ${msg}`);
  }
};

console.log(`\n${url}`);
console.log("types:", blocks.map((b) => b["@type"] || b.PARSE_ERROR).join(", "));

const bp = blocks.find((b) => b["@type"] === "BlogPosting");
if (!bp) {
  problems++;
  console.log("  MISSING: BlogPosting");
} else {
  need(bp.headline, "BlogPosting.headline");
  need(bp.description, "BlogPosting.description");
  need(Array.isArray(bp.image) && bp.image[0]?.startsWith("http"), "BlogPosting.image absolute");
  need(/^\d{4}-\d{2}-\d{2}/.test(bp.datePublished || ""), "BlogPosting.datePublished");
  need(bp.dateModified, "BlogPosting.dateModified");
  need(bp.author?.name && bp.author?.["@type"] === "Person", "BlogPosting.author Person");
  need(bp.publisher?.["@type"] === "Organization" && bp.publisher?.logo?.url, "BlogPosting.publisher+logo");
  need(bp.mainEntityOfPage?.["@id"], "BlogPosting.mainEntityOfPage");
  need(typeof bp.wordCount === "number" && bp.wordCount > 0, "BlogPosting.wordCount");
  need(bp.inLanguage, "BlogPosting.inLanguage");
  console.log(`  BlogPosting ok: "${bp.headline?.slice(0, 40)}" wc=${bp.wordCount} pub=${bp.datePublished}`);
}

const bc = blocks.find((b) => b["@type"] === "BreadcrumbList");
if (!bc) {
  problems++;
  console.log("  MISSING: BreadcrumbList");
} else {
  const names = (bc.itemListElement || []).map((i) => i.name);
  need(names.length === 3, "Breadcrumb 3 levels");
  need(bc.itemListElement?.every((i) => i.item), "Breadcrumb items have URLs");
  console.log(`  Breadcrumb ok: ${names.join(" > ")}`);
}

console.log(problems === 0 ? "JSON-LD VALID" : `${problems} JSON-LD problem(s)`);
process.exit(problems === 0 ? 0 : 1);
