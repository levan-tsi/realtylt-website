/** WHICH GROUND THE HOME PAGE STANDS ON (round 57; round 57.13 and round 58 changed the default).
 *
 * "plates" (the default since round 58): seventeen pictures of our own MapLibre night map, one per
 * shot, rendered once (scripts/make-plates.mjs) with our homes lit live on each by the picture's
 * recorded camera (components/home/plates/): nothing loads on a flight, the first screen is the
 * territory plate itself (docs/parity/DESIGN-ROUND58.md §3, the owner's fifth verdict).
 * "ml": the live MapLibre night map (components/home/ml/): open source, keyless, the plates'
 * renderer and the comparison (`NEXT_PUBLIC_HOME_MAP=ml`; the renderer asks for it with `?ground=ml`).
 *
 * The flag is read loosely (case and spaces ignored); any other value counts as unset. The runtime
 * failures (no WebGL, a blocked script, a map that draws nothing) are decided in the browser by the
 * ground, which keeps our cover for good; they never load a second scene. */
export type HomeMap = "plates" | "ml";

/** THE LIVE MAP'S LOAD COVER: our own still over the map for its first seconds, one for a landscape
 * window and one for the phone's tall camera (so the dissolve keeps the composition at both).
 * Round 57.13: the MapLibre map's own frame (scripts/make-ml-cover.mjs, 1583 x 1000 and 780 x 1688). */
export const COVERS = {
  night: { wide: "/images/home-night-cover.webp", tall: "/images/home-night-cover-tall.webp" },
};

export function homeMap(env: { NEXT_PUBLIC_HOME_MAP?: string }): HomeMap {
  const flag = (env.NEXT_PUBLIC_HOME_MAP ?? "").trim().toLowerCase();
  if (flag === "ml") return "ml";
  return "plates";
}
