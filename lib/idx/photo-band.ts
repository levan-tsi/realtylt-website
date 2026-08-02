/** Pure rules for the listing-detail photo band — the "coming soon" contract in one place.
 *
 * THE RULE (owner-dictated): if a listing has ANY real photo, show ONLY real photos. A tile whose
 * media never loads is DROPPED, never replaced with the branded "photo coming soon" artwork beside
 * real pictures. Only a listing whose surviving set is EMPTY shows the placeholder.
 *
 * Everything the visitor can count — the hero, the side tiles, the "View All (N Photos)" pill, the
 * lightbox "i / N" — derives from the SURVIVING set, never from the claimed `photos.length`. A
 * 2026-07-26 DB census found 72% of active listings claim more photos than are servable (3,822 of
 * 7,000 can serve one or two), so "Show all 48 photos" on a listing that can serve one is the most
 * visible lie the page can tell. These helpers keep the labels honest, and the layout deliberate at
 * every count (0 / 1 / 2 / 3 / 4+) instead of leaving empty slots in a fixed 3-tile column.
 */

/** The claimed set minus every photo whose media exhausted its retries in the browser. Order is
 * preserved, so a dead cover automatically promotes the next surviving photo to the hero. */
export function survivingPhotos(photos: readonly string[], dead: readonly string[]): string[] {
  if (dead.length === 0) return [...photos];
  const gone = new Set(dead);
  return photos.filter((p) => !gone.has(p));
}

/** How the band arranges itself for a surviving count. Live realtylt.com's shape at 4+ is
 * 1 big + 1 wide + 2 half; below that we shrink the column instead of padding it with holes. */
export type BandShape = "placeholder" | "solo" | "one-side" | "two-side" | "wide-plus-two";

export function bandShape(count: number): BandShape {
  if (count <= 0) return "placeholder";
  if (count === 1) return "solo";
  if (count === 2) return "one-side";
  if (count === 3) return "two-side";
  return "wide-plus-two";
}

/** The photos that sit beside the hero: the three that FOLLOW it in CLAIMED feed order, minus any
 * already known dead. Positional in the claimed array on purpose. If it walked the surviving array
 * instead, every dead tile would pull a fresh photo into the band and start another round of media
 * requests — on a covers-only listing (54% of our active rows) that walks all 48 claimed photos,
 * three requests each, for a gallery that can serve one. A dead side tile empties its slot and the
 * band re-shapes; only the HERO is allowed to promote, because a placeholder in the biggest tile
 * beside real thumbnails is the bug we are fixing. */
export function sideSources(
  claimed: readonly string[],
  heroSrc: string,
  dead: readonly string[],
): string[] {
  const n = claimed.length;
  if (n <= 1) return [];
  const h = claimed.indexOf(heroSrc);
  if (h < 0) return [];
  const gone = new Set(dead);
  const out: string[] = [];
  for (let k = 1; k < Math.min(4, n); k++) {
    const p = claimed[(h + k) % n];
    if (p !== heroSrc && !gone.has(p) && !out.includes(p)) out.push(p);
  }
  return out;
}

/** WHICH PHOTO THE BAND IS SHOWING AS ITS HERO: the first photo still in `pool` at or after
 * `anchor`, walking the CLAIMED array and wrapping.
 *
 * WHY THIS IS A FUNCTION NOW (owner, 2026-08-02: "clicking to move pictures… it only moves once
 * and does not do anything, or going back"). The band already had the right idea — an anchor that
 * only the arrows move, and a hero that promotes past a dead cover — but the hero was actually
 * picked as "the first surviving photo that is NOT in the side column". That is only the same
 * thing while the anchor is 0. Press Next once and the sides advance to photos 2-4, so photo 0 is
 * no longer "in the side column" and the hero SNAPS BACK to it; press it again and the arrow
 * computes the identical anchor, so the band freezes solid. Measured before the fix on a 31-photo
 * listing: hero 0 → 0 → 0 → 0 → 0 while the column read 1,2,3 then 2,3,4 and then never moved.
 * Back oscillated between two states for the same reason.
 *
 * Anchoring on the CLAIMED array (not the surviving one) is deliberate and unchanged: a dead side
 * tile must empty its slot rather than drag a fresh photo into the band, or a covers-only listing
 * walks all 48 claimed photos at three requests each. */
export function heroAt(
  claimed: readonly string[],
  anchor: number,
  pool: readonly string[],
): string | undefined {
  const n = claimed.length;
  if (n === 0 || pool.length === 0) return undefined;
  const start = Math.min(Math.max(Math.trunc(anchor) || 0, 0), n - 1);
  const alive = new Set(pool);
  for (let k = 0; k < n; k++) {
    const p = claimed[(start + k) % n];
    if (alive.has(p)) return p;
  }
  return undefined;
}

/** Label for the in-photo "view all" pill.
 *
 * A number only appears once every claimed photo has actually been accounted for (loaded, or
 * proven dead). Until then the page has no honest basis for one: the feed's count is a claim, and
 * a 2026-07-26 census found 72% of active listings claim more photos than are servable. Probing
 * all 48 just to print a number would be exactly the request burst that 429s the media host and
 * manufactures placeholders. So: say "View all photos" while it is unknown, and the exact figure
 * the moment it is known. Never "View all 48 photos" over a gallery that can serve one. */
export function viewAllLabel(count: number, allAccountedFor: boolean): string {
  if (count <= 0) return "";
  if (count === 1) return "View photo";
  return allAccountedFor ? `View all ${count} photos` : "View all photos";
}
