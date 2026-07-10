/** Shared display formatters. */

/** Median-price shorthand for county cards and the Valley map, e.g. 480_000 → "$480K". */
export const fmtM = (n: number) => `$${Math.round(n / 1000)}K`;
