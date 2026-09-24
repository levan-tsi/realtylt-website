/** Our names on the MapLibre map (round 57.12): the territory's and the towns' (../g3d/labels.ts,
 * towns.ts, unchanged), projected with this map's projection instead of the Google camera's, then
 * placed by the same greedy rule (labels.ts placeLabels). */
import type { AreaLabel, LabelItem, Tier } from "../g3d/labels";

export function projectedItems(
  screenOf: (lat: number, lng: number) => { x: number; y: number } | null,
  vp: { width: number; height: number },
  measure: (text: string, tier: Tier) => { w: number; h: number },
  labels: readonly AreaLabel[],
): LabelItem[] {
  const out: LabelItem[] = [];
  for (const l of labels) {
    const p = screenOf(l.lat, l.lng);
    if (!p || p.x < 0 || p.y < 0 || p.x > vp.width || p.y > vp.height) continue;
    const { w, h } = measure(l.text, l.tier);
    out.push({ id: l.id, text: l.text, tier: l.tier, x: p.x, y: p.y, w, h });
  }
  return out;
}
