/** Types for lib/idx/geocode.mjs — see that file for why it is plain .mjs. */

export interface GeocodeRow {
  id: string;
  address: string;
  city?: string;
  state?: string;
  /** The zip the listing STORES — addrKey() is built from this and must match SQL idx_addr_key. */
  zip: string;
  /** The zip to ASK the geocoder with; blank when the stored one is outside the served region. */
  queryZip?: string;
}

export interface GeocodeHit {
  id: string;
  lat: number;
  lng: number;
  source: string;
  precision: string | null;
  matchedAddress: string | null;
  addrKey: string;
}

export declare function addrKey(address: string | undefined, zip: string | undefined): string;
export declare function withoutUnit(address: string | undefined): string;
export declare function censusCsvRow(row: GeocodeRow, street?: string): string;
export declare function parseCensusBatch(
  text: string,
  rows: readonly GeocodeRow[],
): { hits: GeocodeHit[]; misses: GeocodeRow[] };
export declare function parseSourceAddress(
  sourceAddress: string | undefined,
): { address: string; city: string; zip: string } | null;
export declare function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number;
export declare const MAX_ZIP_KM: number;
export declare function rejectReason(
  hit: Pick<GeocodeHit, "lat" | "lng" | "precision">,
  centroid: readonly number[] | null | undefined,
): string | null;
