/** The drifting rail's arithmetic (./DriftScroller.tsx), pure so it can be tested. */

/** Pixels per second that carry one set of `cards` past in `cards x secondsPerCard`: the speed
 * the CSS marquee had, which travelled one set width (half of a doubled track) in that time. */
export function driftSpeed(setWidth: number, cards: number, secondsPerCard: number): number {
  if (setWidth <= 0 || cards <= 0 || secondsPerCard <= 0) return 0;
  return setWidth / (cards * secondsPerCard);
}

/** The next scroll position: `pos` moved by `dx`, wrapped by exactly one set width once it has
 * passed the first set, so the frame after the wrap shows the pixels the frame before did (the
 * second copy of the set starts one set width in). A set width of nothing never moves. */
export function driftAdvance(pos: number, dx: number, setWidth: number): number {
  if (setWidth <= 0) return pos;
  let next = pos + dx;
  while (next >= setWidth) next -= setWidth;
  while (next < 0) next += setWidth;
  return next;
}

/** Whether the rail was moved by something other than the driver: the position read back differs
 * from the one last written by more than the rounding a browser applies to a scroll offset. */
export function scrolledByHand(read: number, written: number, tolerance = 1.5): boolean {
  return Math.abs(read - written) > tolerance;
}
