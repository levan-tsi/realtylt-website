import { flagshipToc, railWords } from "@/lib/blog/flagship";
import { parseOutline } from "@/lib/blog/markdown";
import { getArticles } from "@/lib/blog";
const arts = await getArticles();
for (const a of arts) {
  if (a.body.kind !== "markdown" || !a.flagship || !a.body.markdown.includes("[[scene:")) continue;
  const o = parseOutline(a.body.markdown);
  const old: string[] = [];
  for (const e of o) { if (e.kind === "scene") { const s = a.flagship.scenes[e.key]; if (s?.label) old.push(s.label); } else if (e.level <= 2) old.push(a.flagship.headingLabels?.[e.id] ?? e.text); }
  const now = flagshipToc(o, a.flagship).map((r) => r.label);
  const gone = old.filter((l) => !now.includes(l));
  console.log(`${a.slug}: ${old.length} -> ${now.length}${gone.length ? "  dropped: " + gone.join(" | ") : ""}`);
}
