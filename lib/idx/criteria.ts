/** Turn a saved search's URL query string into the structured criteria the CRM stores and
 * reads back.
 *
 * The point is that there is exactly ONE definition of what a search means. `parseFilterParams`
 * is the same validated parser /api/idx/search and /api/idx/pins run on every request, so a
 * saved search's criteria can never describe something the search itself would not do — an
 * unknown county, a negative price, a property type that is not on the whitelist all fall out
 * here the same way they fall out of a live query.
 */

import { parseFilterParams } from "./query";

export type SearchCriteria = Record<string, string | number | boolean>;

export function searchCriteria(query: string): SearchCriteria {
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  const filters = parseFilterParams(params) as Record<string, unknown>;
  const out: SearchCriteria = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === "") continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return out;
}
