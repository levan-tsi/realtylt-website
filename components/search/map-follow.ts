/** WHEN THE RESULTS LIST FOLLOWS THE MAP (round 54, /search).
 *
 * On a laptop the map sits BESIDE the list, so scoping the list to the map's viewport is the
 * whole point of the split — the owner's own ask in round 23 ("if you zoomed and there is 150
 * show 150 on the list"). Both instruments answer the same question at the same time and you
 * can see them agree.
 *
 * On a phone the map sits BELOW the list, a screen and a half down, and it mounts a beat after
 * the page. So the visitor met a 50-home list, and then, without touching anything, the list
 * silently became a different 150-home list scoped to a viewport they had never seen: the pager
 * changed under them, `page` was reset to 1, and the URL was rewritten — which is why the Back
 * button and paging both misbehaved (the open owner decision carried from round 53).
 *
 * So on a phone the list does not follow the map until the visitor MOVES it. The first settled
 * box after the map frames a place is the "home" box — the frame the map chose for itself — and
 * it is remembered, not adopted. Any later box that differs from it is a move, and from then on
 * the list follows the map exactly as it does on a laptop. Nothing is lost: the phone visitor who
 * pans or zooms still gets "homes in this map area", and the one who never touches the map keeps
 * stable paging and a working Back button.
 *
 * This is engine-agnostic on purpose. Google's and Leaflet's idle events do not say whether a
 * human caused them, and both engines fire one after a programmatic fit — comparing boxes is the
 * one signal that means the same thing in both.
 */

/** A settled viewport, serialized the way SearchClient sends it to the API. */
export type MapBox = string;

export interface FollowState {
  /** The box the map settled on by itself, for the place currently being shown. */
  home: MapBox | null;
  /** True once a settled box differed from `home`: the visitor moved the map. */
  moved: boolean;
}

/** A fresh place: the map is about to reframe, so nothing is known about it yet. */
export const NO_FOLLOW: FollowState = { home: null, moved: false };

/** Fold one settle report into the state. Pure, so the rule is testable without a map. */
export function settleBox(prev: FollowState, box: MapBox): FollowState {
  if (prev.home === null) return { home: box, moved: false };
  if (prev.moved) return prev;
  if (prev.home === box) return prev;
  return { home: prev.home, moved: true };
}

/** Does the results list take its scope from the map right now? */
export function followsMap(narrow: boolean, s: FollowState): boolean {
  return !narrow || s.moved;
}
