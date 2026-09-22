/** The home hero's light map, packed (round 53).
 *
 * ~15,000 points travel to the browser once an hour through the CDN, so they are sent as what
 * they are: two 16-bit grid coordinates and a 16-bit town index per home, base64 over the wire.
 * 6 bytes a home instead of ~60 as JSON objects. A 65,536-step grid over the served region is
 * ~3m a step, finer than any screen this is drawn on. Pure functions, shared by the route that
 * packs and the canvas that unpacks. */

export type LightBox = { west: number; south: number; east: number; north: number };

export interface PackedLights {
  v: 1;
  box: LightBox;
  /** base64 of little-endian uint16 triples: x, y (0 = west / north edge), town index. */
  data: string;
  towns: string[];
  /** Homes for sale in each town, INCLUDING the ones too imprecisely placed to be a light, so
   * the number the lantern prints is the town's real count. */
  counts: number[];
}

export interface LightPoints {
  /** 0..1 across the box, west to east. */
  x: Float32Array;
  /** 0..1 down the box, north to south (screen order). */
  y: Float32Array;
  town: Uint16Array;
  towns: string[];
  counts: number[];
}

const STEP = 65535;

/** The feed spells towns in several cases ("BEACON", "Beacon"). The lantern names them, so one
 * spelling per town, in the case a person writes it. */
export function townName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^|[\s-])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** `geocoded: false` rows count toward their town and are not drawn (a zip-centroid position
 * is a guess, and a few dozen guesses in one jitter box draw a square). A row without the flag
 * is treated as measured. */
export function packLights(
  rows: readonly { lat: number; lng: number; city: string; geocoded?: boolean }[],
  box: LightBox,
): PackedLights {
  const towns: string[] = [];
  const counts: number[] = [];
  const townIndex = new Map<string, number>();
  const townOf = (city: string) => {
    const name = townName(city || "");
    let t = townIndex.get(name);
    if (t === undefined) {
      t = towns.length;
      towns.push(name);
      counts.push(0);
      townIndex.set(name, t);
    }
    return t;
  };
  const inBox = (r: { lat: number; lng: number }) =>
    !!r.lat && !!r.lng && r.lat >= box.south && r.lat <= box.north && r.lng >= box.west && r.lng <= box.east;
  for (const r of rows) if (inBox(r)) counts[townOf(r.city)]++;
  const lit = rows.filter((r) => r.geocoded !== false && inBox(r));
  const view = new DataView(new ArrayBuffer(lit.length * 6));
  lit.forEach((r, i) => {
    const t = townOf(r.city);
    view.setUint16(i * 6, Math.round(((r.lng - box.west) / (box.east - box.west)) * STEP), true);
    view.setUint16(i * 6 + 2, Math.round(((box.north - r.lat) / (box.north - box.south)) * STEP), true);
    view.setUint16(i * 6 + 4, t, true);
  });
  return { v: 1, box, data: toBase64(new Uint8Array(view.buffer)), towns, counts };
}

export function unpackLights(p: PackedLights): LightPoints {
  const bytes = fromBase64(p.data);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const n = Math.floor(bytes.byteLength / 6);
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const town = new Uint16Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = view.getUint16(i * 6, true) / STEP;
    y[i] = view.getUint16(i * 6 + 2, true) / STEP;
    town[i] = view.getUint16(i * 6 + 4, true);
  }
  return { x, y, town, towns: p.towns, counts: p.counts ?? [] };
}

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(b64, "base64"));
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
