/** The night flight's served areas and where the lantern's click goes. Until round 65 this file
 * also built the three.js night scene's light, haze, street and county clouds, retired with that
 * ground. */

/** The served areas, in the order the "where we work" chapter flies them; a light's county is
 * its index here plus one (0 = not known). The slugs are the feed's (lib/idx/lights.ts townCounty). */
export const COUNTY_SLUGS = ["ulster", "dutchess", "orange", "putnam", "rockland", "westchester", "bronx", "manhattan", "queens", "brooklyn", "staten-island"] as const;

/** Where the lantern's click goes: the town's EXACT city, the homes the label just counted.
 * (Round 53's hero opened `/search?q=Harrison`, free text, which answered with forty homes on
 * every Harrison Street; guarded by app/api/idx/suggest/suggest-count-scope.test.ts.) Both the
 * page's hero and the lab's canvas call this, so there is one answer to copy wrong. */
export function townSearchHref(town: string): string {
  return `/search?city=${encodeURIComponent(town)}`;
}
