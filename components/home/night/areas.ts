/** The eleven areas the "where we work" chapter names, in the order the camera flies them.
 *
 * Each row carries the shot that frames it, the feed's county slug (which is also the key the
 * lights' own per-county counts use, so the number beside a name is measured from the same data
 * the scene draws), and the link to that area's page — the SAME link the nav's Top Areas opens,
 * taken from lib/site.ts rather than rebuilt here, because the boroughs' page slugs are not
 * their feed slugs. */
import { BOROUGHS, COUNTIES, TOP_AREA_GROUPS } from "@/lib/site";
import type { AreaRow } from "./AreaChapter";
import { AREA_COUNTY_OF, AREA_FLIGHT } from "./shots";

const HREF: Record<string, string> = Object.fromEntries([
  ...COUNTIES.map((c, i) => [c.slug, TOP_AREA_GROUPS[0].items[i].href]),
  ...BOROUGHS.map((b, i) => [b.slug, TOP_AREA_GROUPS[1].items[i].href]),
]);
const NAME: Record<string, string> = Object.fromEntries([
  ...COUNTIES.map((c) => [c.slug, c.name.replace(" County", "")]),
  ...BOROUGHS.map((b) => [b.slug, b.name]),
]);

export const AREA_ROWS: AreaRow[] = AREA_FLIGHT.map((shot) => {
  const slug = AREA_COUNTY_OF[shot];
  return {
    shot,
    slug,
    name: NAME[slug],
    href: HREF[slug],
    group: COUNTIES.some((c) => c.slug === slug) ? "valley" : "city",
  };
});
