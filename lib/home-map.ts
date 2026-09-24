/** WHICH GROUND THE HOME PAGE STANDS ON (round 57; round 57.13 changed the default).
 *
 * "ml" (the default): the MapLibre night map with our homes lit on it (components/home/ml/): open
 * source, keyless, 2 to 3 s to the whole territory on a fast line, sharp at every height
 * (docs/parity/DESIGN-ROUND57.md §9, the owner's fourth verdict and the change of engine).
 * "g3d": Google's photorealistic 3D map (components/home/g3d/), only when the flag asks for it
 * (`NEXT_PUBLIC_HOME_MAP=g3d`) AND the browser Maps key is present; asked for without the key it is
 * the MapLibre map, which needs nothing from anyone.
 * "night": our own night flight (components/home/night/), when the flag asks for it.
 *
 * The flag is read loosely (case and spaces ignored); a value that is none of the three words counts
 * as unset. The runtime failures (no WebGL, a blocked script, a map that draws nothing) are decided
 * in the browser by the ground, which keeps our cover for good; they never load a second scene. */
export type HomeMap = "ml" | "g3d" | "night";

/** THE REAL MAP'S LOAD COVER (scripts/make-map-cover.mjs): our own still over the map for its first
 * seconds, drawn from our elevation data from the map's own hero camera, one for a landscape window
 * and one for the phone's tall camera (so the dissolve keeps the composition at both).
 * "night" (round 57.6, the default): the night map's own first frame, our land in the night grade's
 * tones with our lights where the live layer draws them (the owner saw round 57.2's dusk cover as
 * "the old bad map with a lot of lights"). "dusk" and "day" (round 57.2's A and B) have left the
 * default path; `?cover=dusk|day` (or the env flag) still shows them for comparison. */
export type HomeCover = "night" | "dusk" | "day";

/** Round 57.13: `night` is now the MapLibre map's own frame (scripts/make-ml-cover.mjs, 1583 x 1000
 * and 780 x 1688); Google's map keeps its own as G3D_COVER below. */
export const COVERS: Record<HomeCover, { wide: string; tall: string }> = {
  night: { wide: "/images/home-night-cover.webp", tall: "/images/home-night-cover-tall.webp" },
  dusk: { wide: "/images/home-dusk-cover.webp", tall: "/images/home-dusk-cover-tall.webp" },
  day: { wide: "/images/home-day-cover.webp", tall: "/images/home-day-cover-tall.webp" },
};

/** Google's map's own night cover (round 57.13): the frame scripts/make-map-cover.mjs draws from
 * GOOGLE's hero camera (rounds 57.6 to 57.10). Since `COVERS.night` became the MapLibre map's own
 * frame (scripts/make-ml-cover.mjs), Google's ground keeps this one so its dissolve still matches. */
export const G3D_COVER = { wide: "/images/home-g3d-cover.webp", tall: "/images/home-g3d-cover-tall.webp" };

export function homeCover(env: { NEXT_PUBLIC_HOME_COVER?: string }): HomeCover {
  const v = (env.NEXT_PUBLIC_HOME_COVER ?? "").trim().toLowerCase();
  return v === "day" || v === "dusk" ? v : "night";
}

/** The cover a ground loads under: each map's own first frame from its own camera. */
export function coverFor(ground: HomeMap, flag: HomeCover): { wide: string; tall: string } {
  if (ground !== "g3d") return COVERS.night;
  return flag === "night" ? G3D_COVER : COVERS[flag];
}

export function homeMap(env: { NEXT_PUBLIC_HOME_MAP?: string; NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string }): HomeMap {
  const flag = (env.NEXT_PUBLIC_HOME_MAP ?? "").trim().toLowerCase();
  const key = (env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "").trim();
  if (flag === "night") return "night";
  if (flag === "g3d" && key) return "g3d";
  return "ml";
}
