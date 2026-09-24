/** Round 57.4's lab switches for the Westchester stall experiments, read from the page's query.
 * Nothing here changes the page unless the query asks for it.
 *
 *  - `?cam=westchester:40000,45,250`: a shot's camera range (m), tilt and heading (any may be empty:
 *    `westchester:,45,` changes the tilt only); several shots separated by `;`.
 *  - `?dur=westchester:3200`: a shot's flight duration in ms; several separated by `;`.
 *  - `?legs=2`: every section flight in two legs through the halfway camera (controller.midCamera). */
import { SHOTS, type ShotName } from "../night/shots";
import type { G3dCamera } from "./cameras";

type CamPatch = Partial<Pick<G3dCamera, "range" | "tilt" | "heading">>;

const isShot = (s: string): s is ShotName => Object.prototype.hasOwnProperty.call(SHOTS, s);
const num = (s: string | undefined) => {
  if (s === undefined || s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

function entries(q: string | null | undefined): [ShotName, string][] {
  return (q ?? "")
    .split(";")
    .map((p) => p.split(":"))
    .filter((p): p is [string, string] => p.length === 2)
    .map(([k, v]) => [k.trim(), v] as [string, string])
    .filter((p): p is [ShotName, string] => isShot(p[0]));
}

export function camOverrides(q: string | null | undefined): Partial<Record<ShotName, CamPatch>> {
  const out: Partial<Record<ShotName, CamPatch>> = {};
  for (const [shot, v] of entries(q)) {
    const [range, tilt, heading] = v.split(",").map(num);
    const patch: CamPatch = {};
    if (range !== undefined && range > 0) patch.range = range;
    if (tilt !== undefined && tilt >= 0 && tilt <= 80) patch.tilt = tilt;
    if (heading !== undefined) patch.heading = ((heading % 360) + 360) % 360;
    if (Object.keys(patch).length) out[shot] = patch;
  }
  return out;
}

export function durOverrides(q: string | null | undefined): Partial<Record<ShotName, number>> {
  const out: Partial<Record<ShotName, number>> = {};
  for (const [shot, v] of entries(q)) {
    const ms = num(v);
    if (ms !== undefined && ms >= 100 && ms <= 10_000) out[shot] = Math.round(ms);
  }
  return out;
}
