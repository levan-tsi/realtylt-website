/** THE NIGHT GRADE (round 57.6). The owner: "can you make that real map in a dark mode, or is it a
 * night also ... make that real map a dark place". Google's photorealistic 3D map has no dark mode
 * (maps 3.66; the cloud styles do not reach 3D), so the night is ours, laid over the map element:
 *
 *  - A tone curve on the map element itself (CSS filter: brightness, then contrast about the
 *    middle grey, then less colour). A curve, not a flat black veil: a flat veil dims everything
 *    alike, and Google's own place names (white, at the territory shot in HYBRID) went grey with
 *    the land. The curve takes the imagery's middle tones (land ~0.35 of white) down to a night's
 *    0.1 to 0.2 while the brightest things (the names, the lit city, the logo's white) stay near
 *    white, and it keeps the order of tones: water stays darker than land, the river and the ridges
 *    still read. Compositor filters, run on the GPU with the map's own layer.
 *  - A deep blue-black lifted into the shadows by a SCREEN tint: the darkest ground reads as night,
 *    not as dead black (the realtylt.com/ai page's ground), and nothing brighter changes.
 *
 * Three strengths, chosen between by frames at four stops at both widths
 * (scripts/_scratch-r57/6/grade/); `?night=` shows any of them, `?night=0` the daylight map. */
export interface NightGrade {
  /** The CSS filter on the map element's box. */
  filter: string;
  /** The screen tint's colour (the floor the shadows lift to). */
  tint: string;
}

export type NightKey = "0" | "light" | "mid" | "deep";

export const NIGHT: Record<NightKey, NightGrade | null> = {
  "0": null,
  light: { filter: "brightness(0.8) contrast(1.3) saturate(0.75)", tint: "rgb(7, 11, 24)" },
  mid: { filter: "brightness(0.72) contrast(1.4) saturate(0.65)", tint: "rgb(6, 10, 22)" },
  deep: { filter: "brightness(0.64) contrast(1.5) saturate(0.45)", tint: "rgb(5, 8, 19)" },
};

export const NIGHT_DEFAULT: NightKey = "deep";

/** The grade asked for by the query (`?night=light|mid|deep|0`), else the default. */
export function nightGrade(q: string | null | undefined): { key: NightKey; grade: NightGrade | null } {
  const k = (q ?? "").trim().toLowerCase();
  const key = (k in NIGHT ? k : NIGHT_DEFAULT) as NightKey;
  return { key, grade: NIGHT[key] };
}

/** What the grade does to one channel value (0..1): brightness, then contrast about 0.5 (clamped),
 * then the screen tint's floor. Saturation is left out (it moves colours toward their own grey, not
 * a channel's level). The cover script (scripts/make-map-cover.mjs) and the tests use it. */
export function gradeChannel(x: number, k: NightKey, tint = 0): number {
  const g = NIGHT[k];
  if (!g) return x;
  const b = Number(/brightness\(([\d.]+)\)/.exec(g.filter)?.[1] ?? 1);
  const c = Number(/contrast\(([\d.]+)\)/.exec(g.filter)?.[1] ?? 1);
  const v = Math.min(1, Math.max(0, (x * b - 0.5) * c + 0.5));
  return 1 - (1 - v) * (1 - tint);
}
