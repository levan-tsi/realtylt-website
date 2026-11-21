import { flagshipToc } from "@/lib/blog/flagship";
import { parseOutline } from "@/lib/blog/markdown";
import { readingTime } from "@/lib/blog/toc";
import { SELLER_DISCLOSURE_POST } from "@/content/blog/seller-posts";
import { SELLER_DISCLOSURE_FLAGSHIP } from "@/content/blog/seller-disclosure-scenes";
// The AI audit post this probe also measured moved to its own site on 2026-11-20.
for (const [name, md, fl] of [["seller", SELLER_DISCLOSURE_POST, SELLER_DISCLOSURE_FLAGSHIP]] as const) {
  const rows = flagshipToc(parseOutline(md), fl);
  const words = md.split(/\s+/).filter(Boolean).length;
  console.log(`${name}: ${rows.length} rows; words ${words}; readingTime ${readingTime(md)}`);
  for (const r of rows) console.log(`  ${r.scene ? "S" : "H"} ${r.label}  [${r.id}]`);
}
