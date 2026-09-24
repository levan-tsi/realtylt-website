/** WHAT THE HOME PAGE'S WORDS MAY CLAIM ABOUT THE PICTURE BEHIND THEM (round 57.5).
 *
 * Three claims depend on what is actually standing behind the page:
 *  - "Map: Google." (`[data-map-claim]`): only while Google's map is what the reader sees.
 *  - "Point at one to see its town and price." (`[data-point-claim]`): only while the live map
 *    carries lights to point at.
 *  - "Every light on the map is one of them." and its kin (`[data-lights-claim]`): true of our
 *    cover (its lights are drawn from the same listings) and of the live map with lights; false of
 *    the live map when the lights could not be loaded (a 500, a lost connection, an empty answer).
 *
 * `map`: "cover" (JS off, or the map not drawn yet: our still), "live" (Google's map shown), or
 * "failed" (no key, no WebGL, the script blocked, gmp-error: our still for good).
 * `lights`: "pending" (not answered yet), "some", or "none". The server renders the "cover" state
 * (app/page.tsx), so the page with JavaScript off says only what its still can back. */
export type MapState = "cover" | "live" | "failed";
export type LightsState = "pending" | "some" | "none";

export function claims(map: MapState, lights: LightsState): { map: boolean; point: boolean; lights: boolean } {
  const live = map === "live";
  return { map: live, point: live && lights === "some", lights: !(live && lights === "none") };
}

/** Shows or hides each claim on the page (the attribute `hidden`). */
export function applyClaims(c: { map: boolean; point: boolean; lights: boolean }, root: ParentNode = document) {
  const set = (sel: string, on: boolean) =>
    root.querySelectorAll<HTMLElement>(sel).forEach((e) => {
      e.hidden = !on;
    });
  set("[data-map-claim]", c.map);
  set("[data-point-claim]", c.point);
  set("[data-lights-claim]", c.lights);
}
