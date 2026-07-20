/** Pagination windowing for the results pager.
 *
 * Live realtylt.com shows a run of SIX consecutive page numbers with prev/next
 * chevrons — never a "1 … 74 75 76 … 150" ellipsis pager. This reproduces that:
 * a fixed-length run centred on the current page and clamped so it never starts
 * before page 1 or runs past the last page.
 */
export function pageWindow(current: number, totalPages: number, size = 6): number[] {
  const total = Math.max(1, Math.floor(totalPages) || 1);
  // A short result set can't fill the window; show what exists.
  const span = Math.min(Math.max(1, Math.floor(size) || 1), total);
  const cur = Math.min(Math.max(1, Math.floor(current) || 1), total);
  // Centre the run on the current page (slightly left-biased on even spans, which is
  // what live does: page 1 of 150 shows 1-6, not a half-empty window), then clamp.
  const start = Math.min(Math.max(1, cur - Math.floor((span - 1) / 2)), total - span + 1);
  return Array.from({ length: span }, (_, i) => start + i);
}
