/** ADDRESS QUERY -> POSTGREST FILTER.
 *
 * Lifted out of app/api/idx/suggest/route.ts so it can be tested directly. It is the one place
 * on the site where a visitor's raw keystrokes are concatenated into a PostgREST filter string,
 * which makes it the one place worth proving rather than reasoning about.
 *
 * WHY THE CHARACTER STRIP IS THE PROTECTION, and encodeURIComponent is not:
 * PostgREST parses the query string AFTER percent-decoding it. So a comma encoded as %2C
 * arrives at the parser as a comma and separates two conditions, exactly as a raw one would.
 * Encoding makes the URL well-formed; it does not make the value inert. The only thing standing
 * between a typed `,` and an injected filter is that the character never survives tokenising.
 *
 * The structural set, and what each one would do if it got through:
 *   ,   separates conditions inside and=( … )      -> inject a whole extra filter
 *   ( ) group conditions                            -> close ours early and open theirs
 *   .   separates column.operator.value             -> retarget the column or the operator
 *   *   PostgREST's ilike wildcard                  -> widen the match arbitrarily
 *   \   PostgREST's escape character                -> smuggle any of the above
 *   % _ SQL LIKE metacharacters                     -> widen the match arbitrarily
 * `%` and `_` are not an injection route (PostgREST still binds the value as a parameter), but
 * they are the visitor writing wildcards into a search they did not ask to be fuzzy, so they
 * are stripped too and the query means what was typed.
 */

/** Words that must not be REQUIRED to appear in a row.
 *
 * The state, and the street-suffix abbreviations people mix freely: someone types "ave" and the
 * stored address says "Avenue", so requiring the token would reject the very row it describes.
 */
export const ADDRESS_NOISE = new Set([
  "ny", "usa", "us",
  "ave", "av", "st", "rd", "dr", "ln", "ct", "blvd", "hwy", "pl", "ter", "cir",
  "apt", "unit", "#",
]);

/** Everything above, as one class. Kept beside the doc comment so the two cannot drift. */
const STRUCTURAL = /[,()*\\.%_]/g;

/** At most five tokens: an address has a house number, a street name and a town, and a longer
 * query is a paste. Each extra token is another OR group in the filter and another column scan. */
const MAX_TOKENS = 5;

/**
 * Split a typed address into the tokens that must each appear SOMEWHERE in the row.
 *
 * Tokenised rather than one contiguous substring because "150 hooker ave poughkeepsie ny" is how
 * a person types an address and how Google hands one back, but as a single ILIKE it matches
 * nothing: the stored address is "150 Hooker Avenue" and the town lives in its own column.
 */
export function addressTokens(q: string): string[] {
  return q
    .toLowerCase()
    .replace(STRUCTURAL, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !ADDRESS_NOISE.has(t))
    .slice(0, MAX_TOKENS);
}

/**
 * Build the `and=( … )` body. Every token has to land in address, city or zip — which is what
 * makes word order and extra words harmless.
 */
export function addressFilterClause(tokens: string[]): string {
  return tokens
    .map((t) => {
      const e = encodeURIComponent(t);
      return `or(address.ilike.*${e}*,city.ilike.*${e}*,zip.ilike.*${e}*)`;
    })
    .join(",");
}
