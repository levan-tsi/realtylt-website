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

/** A drift position split into what the scroller can hold and what the track carries (round 64).
 * Chrome keeps an element's scrollLeft in whole CSS pixels, so a rail moving ~0.9 px a frame at
 * 60 Hz steps 1, 1, 0, 1 px (3 device pixels a step on a phone) and reads as a stutter. The
 * whole pixels go to scrollLeft, which keeps the browser rastering only what is near the
 * scrollport; the remainder, always in [0, 1), goes to a transform on the track, so the sum the
 * eye sees is the exact position every frame. */
export function driftSplit(pos: number): { scroll: number; frac: number } {
  const scroll = Math.floor(pos);
  return { scroll, frac: pos - scroll };
}

/** The drift's speed factor eased toward its target (1 moving, 0 stopped) with time constant
 * `tau` seconds, so a pause for a pointer glides to a stop and a resume picks up gradually instead
 * of jumping to full speed. Settles exactly once within a thousandth of the target. */
export function driftEase(current: number, target: number, dt: number, tau: number): number {
  if (tau <= 0) return target;
  if (dt <= 0) return current;
  const next = target + (current - target) * Math.exp(-dt / tau);
  return Math.abs(next - target) < 1e-3 ? target : next;
}
