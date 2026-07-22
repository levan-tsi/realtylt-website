/** Pure index math for the wrap-around carousels (Why-Work-With-Us slider, etc.).
 * Kept separate from the component so the wrap behaviour is unit-testable. */

/** Wrap `index` into the range [0, length) with proper handling of negatives. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}
