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

export function homeMap(env: { NEXT_PUBLIC_HOME_MAP?: string; NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string }): HomeMap {
  const flag = (env.NEXT_PUBLIC_HOME_MAP ?? "").trim().toLowerCase();
  const key = (env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "").trim();
  if (flag === "night" || !key) return "night";
  return "g3d";
}
