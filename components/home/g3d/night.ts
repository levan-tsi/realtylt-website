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
 * (scripts/_scratch-r57/6/grade/); `?night=` shows any of them, `?night=0` the daylight map.
 *
 * MOONLIGHT (round 57.9). The owner: "work on the map, maybe a little darker with moonlight or
 * something and these lights light it up". The moon grades are darker than round 6's deep and COOL:
 * the colour of the imagery is almost gone (moonlight is nearly colourless to the eye), and what is
 * left is a silver-blue cast. How the cast is made with the functions CSS has: the imagery is turned
 * half round the hue wheel (hue-rotate(-186deg)), a little sepia is mixed in, and the whole is turned
 * back (hue-rotate(186deg)); the imagery's own colours come back where they started (less of them)
 * and only the sepia's warm tone comes out turned, to silver-blue. The plain order (sepia, then
 * hue-rotate) turned the sea's blue to brown (scripts/_scratch-r57/9/model/). So the highlights (the city's roofs, the beaches, the lit water) read silver-blue and
 * the shadows fall to the blue-black floor. The warm lights are drawn over the grade (light-layer.ts,
 * added, never filtered), so they are the only warmth: houses lighting their streets. Still one CSS
 * filter on the map element and one screen tint, as round 6's: colour-matrix filters the compositor
 * folds into one pass, so no frame cost (measured by the lag probe, record §7 round 9). */
export interface NightGrade {
  /** The CSS filter on the map element's box. */
  filter: string;
  /** The screen tint's colour (the floor the shadows lift to). */
  tint: string;
}

export type NightKey = "0" | "light" | "mid" | "deep" | "moon1" | "moon2" | "moon3";

export const NIGHT: Record<NightKey, NightGrade | null> = {
  "0": null,
  light: { filter: "brightness(0.8) contrast(1.3) saturate(0.75)", tint: "rgb(7, 11, 24)" },
  mid: { filter: "brightness(0.72) contrast(1.4) saturate(0.65)", tint: "rgb(6, 10, 22)" },
  deep: { filter: "brightness(0.64) contrast(1.5) saturate(0.45)", tint: "rgb(5, 8, 19)" },
  moon1: { filter: "brightness(0.54) contrast(1.42) hue-rotate(-186deg) saturate(0.35) sepia(0.35) hue-rotate(186deg)", tint: "rgb(3, 6, 16)" },
  moon2: { filter: "brightness(0.53) contrast(1.46) hue-rotate(-186deg) saturate(0.32) sepia(0.38) hue-rotate(186deg)", tint: "rgb(3, 6, 16)" },
  moon3: { filter: "brightness(0.52) contrast(1.5) hue-rotate(-186deg) saturate(0.3) sepia(0.4) hue-rotate(186deg)", tint: "rgb(3, 6, 15)" },
};

/** Round 57.9: moon2, chosen by frames at three strengths, four stops, both widths
 * (scripts/_scratch-r57/9/grade/sheet-{1440,390}.png, columns deep / moon1 / moon2 / moon3): moon1
 * is barely darker than deep on the valley; moon3 sinks the western ridges and Brooklyn's streets
 * into the floor; moon2 takes the land a third darker than deep (the western ridges 11 -> 6 levels
 * median, New Jersey's valley 23 -> 14) with the ridges, the river and the coast still drawn, the
 * city's roofs silver and the sea a slate sheen (47 -> 34), the lights the only warm thing. */
export const NIGHT_DEFAULT: NightKey = "moon2";

/** The grade asked for by the query (`?night=light|mid|deep|moon1|moon2|moon3|0`), else the default. */
export function nightGrade(q: string | null | undefined): { key: NightKey; grade: NightGrade | null } {
  const k = (q ?? "").trim().toLowerCase();
  const key = (k in NIGHT ? k : NIGHT_DEFAULT) as NightKey;
  return { key, grade: NIGHT[key] };
}

/** What the grade does to one channel value (0..1): brightness, then contrast about 0.5 (clamped),
 * then the screen tint's floor. Saturation is left out (it moves colours toward their own grey, not
 * a channel's level). Round 6's model; `gradeRgb` below is the whole chain. */
export function gradeChannel(x: number, k: NightKey, tint = 0): number {
  const g = NIGHT[k];
  if (!g) return x;
  const b = Number(/brightness\(([\d.]+)\)/.exec(g.filter)?.[1] ?? 1);
  const c = Number(/contrast\(([\d.]+)\)/.exec(g.filter)?.[1] ?? 1);
  const v = Math.min(1, Math.max(0, (x * b - 0.5) * c + 0.5));
  return 1 - (1 - v) * (1 - tint);
}

// ---- the whole chain, as the browser runs it (round 57.9) ------------------------------------------

/** A 3x4 affine colour matrix, row-major: out_r = m[0] r + m[1] g + m[2] b + m[3], and so on. */
type Mat = readonly number[];

/** One CSS filter function as its colour matrix (Filter Effects Module Level 1, §"Shorthands
 * defined via SVG filter elements"; the functions this file uses, on sRGB values 0..1). */
export function filterMatrix(fn: string, a: number): Mat | null {
  switch (fn) {
    case "brightness":
      return [a, 0, 0, 0, 0, a, 0, 0, 0, 0, a, 0];
    case "contrast": {
      const o = 0.5 - 0.5 * a;
      return [a, 0, 0, o, 0, a, 0, o, 0, 0, a, o];
    }
    case "saturate":
      return [
        0.213 + 0.787 * a, 0.715 - 0.715 * a, 0.072 - 0.072 * a, 0,
        0.213 - 0.213 * a, 0.715 + 0.285 * a, 0.072 - 0.072 * a, 0,
        0.213 - 0.213 * a, 0.715 - 0.715 * a, 0.072 + 0.928 * a, 0,
      ];
    case "sepia": {
      const s = 1 - Math.min(1, a);
      return [
        0.393 + 0.607 * s, 0.769 - 0.769 * s, 0.189 - 0.189 * s, 0,
        0.349 - 0.349 * s, 0.686 + 0.314 * s, 0.168 - 0.168 * s, 0,
        0.272 - 0.272 * s, 0.534 - 0.534 * s, 0.131 + 0.869 * s, 0,
      ];
    }
    case "hue-rotate": {
      const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
      return [
        0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928, 0,
        0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283, 0,
        0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072, 0,
      ];
    }
    default:
      return null;
  }
}

/** The filter's functions in order, with their amounts (deg for hue-rotate, a number or % else). */
export function parseFilter(filter: string): { fn: string; a: number }[] {
  const out: { fn: string; a: number }[] = [];
  for (const m of filter.matchAll(/([a-z-]+)\(\s*(-?[\d.]+)(%|deg)?\s*\)/g)) out.push({ fn: m[1], a: Number(m[2]) / (m[3] === "%" ? 100 : 1) });
  return out;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** THE GRADE ON ONE COLOUR, sRGB 0..255 in and out: each filter function in order (clamped after
 * each, as the browser's colour filters are), then the screen tint. The cover script
 * (scripts/make-map-cover.mjs) draws our land in daylight tones and passes it through this, so the
 * cover is in exactly the live grade; the tests hold the grade's promises with it. */
export function gradeRgb(rgb: readonly number[], grade: NightGrade | null): [number, number, number] {
  let v = [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
  if (!grade) return [rgb[0], rgb[1], rgb[2]];
  for (const { fn, a } of parseFilter(grade.filter)) {
    const m = filterMatrix(fn, a);
    if (!m) continue;
    v = [0, 1, 2].map((r) => clamp01(m[4 * r] * v[0] + m[4 * r + 1] * v[1] + m[4 * r + 2] * v[2] + m[4 * r + 3]));
  }
  const t = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(grade.tint);
  const tint = t ? [Number(t[1]) / 255, Number(t[2]) / 255, Number(t[3]) / 255] : [0, 0, 0];
  return [0, 1, 2].map((c) => 255 * (1 - (1 - v[c]) * (1 - tint[c]))) as [number, number, number];
}
