import { flagshipToc } from "@/lib/blog/flagship";
import { parseOutline } from "@/lib/blog/markdown";
import { readingTime } from "@/lib/blog/toc";
import { AI_AUDIT_POST } from "@/content/blog/ai-posts";
import { AUDIT_FLAGSHIP } from "@/content/blog/audit-scenes";
import { SELLER_DISCLOSURE_POST } from "@/content/blog/seller-posts";
import { SELLER_DISCLOSURE_FLAGSHIP } from "@/content/blog/seller-disclosure-scenes";
for (const [name, md, fl] of [["ai", AI_AUDIT_POST, AUDIT_FLAGSHIP], ["seller", SELLER_DISCLOSURE_POST, SELLER_DISCLOSURE_FLAGSHIP]] as const) {
  const rows = flagshipToc(parseOutline(md), fl);
  const words = md.split(/\s+/).filter(Boolean).length;
  console.log(`${name}: ${rows.length} rows; words ${words}; readingTime ${readingTime(md)}`);
  for (const r of rows) console.log(`  ${r.scene ? "S" : "H"} ${r.label}  [${r.id}]`);
}
