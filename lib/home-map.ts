/** WHICH GROUND THE HOME PAGE STANDS ON (round 57).
 *
 * "g3d": Google's photorealistic 3D map with our homes lit on it (components/home/g3d/). It needs
 * the browser Maps key, so it is the default whenever the key is present.
 * "night": our own night flight (components/home/night/), which needs nothing from anyone. It is
 * the answer when the flag asks for it (`NEXT_PUBLIC_HOME_MAP=night`) or when there is no key.
 *
 * The flag is read loosely (case and spaces ignored); a value that is neither word counts as
 * unset, so a typo cannot take the map away silently in one direction and not the other. The
 * runtime failures (gmp-error, no WebGL, a blocked script) are decided in the browser by
 * G3dGround, which keeps our poster for good; they never fall back to loading a second scene. */
export type HomeMap = "g3d" | "night";

/** THE REAL MAP'S LOAD COVER (scripts/make-map-cover.mjs): our own still over the map for its first
 * seconds, drawn from our elevation data from the map's own hero camera, one for a landscape window
 * and one for the phone's tall camera (so the dissolve keeps the composition at both).
 * "night" (round 57.6, the default): the night map's own first frame, our land in the night grade's
 * tones with our lights where the live layer draws them (the owner saw round 57.2's dusk cover as
 * "the old bad map with a lot of lights"). "dusk" and "day" (round 57.2's A and B) have left the
 * default path; `?cover=dusk|day` (or the env flag) still shows them for comparison. */
export type HomeCover = "night" | "dusk" | "day";

export const COVERS: Record<HomeCover, { wide: string; tall: string }> = {
  night: { wide: "/images/home-night-cover.webp", tall: "/images/home-night-cover-tall.webp" },
  dusk: { wide: "/images/home-dusk-cover.webp", tall: "/images/home-dusk-cover-tall.webp" },
  day: { wide: "/images/home-day-cover.webp", tall: "/images/home-day-cover-tall.webp" },
};

export function homeCover(env: { NEXT_PUBLIC_HOME_COVER?: string }): HomeCover {
  const v = (env.NEXT_PUBLIC_HOME_COVER ?? "").trim().toLowerCase();
  return v === "day" || v === "dusk" ? v : "night";
}

export function homeMap(env: { NEXT_PUBLIC_HOME_MAP?: string; NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string }): HomeMap {
  const flag = (env.NEXT_PUBLIC_HOME_MAP ?? "").trim().toLowerCase();
  const key = (env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "").trim();
  if (flag === "night" || !key) return "night";
  return "g3d";
}
