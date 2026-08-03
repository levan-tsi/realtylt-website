import { describe, expect, it } from "vitest";
import { addressFilterClause, addressTokens } from "./address-query";

/** The handoff asked for this by name: "The filter is built by string concatenation — prove the
 * stripping holds." So these are adversarial first and behavioural second. */

const clauseFor = (q: string) => addressFilterClause(addressTokens(q));

/** Collapse every OR group WE emit down to "OR". What is left is the clause's structure, and it
 * must be nothing but our own groups joined by our own commas.
 *
 * This is the assertion that matters, and it is deliberately not "the word `status` must not
 * appear". A token IS allowed to be the word "status" — it just has to sit inside `ilike.*…*` as
 * a value, where it means the letters s-t-a-t-u-s and nothing else. Forbidding the substring
 * would fail on a real street named Church or a town called Union while proving nothing about
 * whether the filter can be escaped. Structure is what injection breaks. */
const skeleton = (clause: string) =>
  clause.replace(
    /or\(address\.ilike\.\*[^*]*\*,city\.ilike\.\*[^*]*\*,zip\.ilike\.\*[^*]*\*\)/g,
    "OR",
  );
const isIntact = (clause: string) => /^(OR)(,OR)*$/.test(skeleton(clause));

describe("address query — the stripping holds", () => {
  /** The structural characters, one at a time. Each is checked against the FINAL clause rather
   * than the token list, because the clause is what gets concatenated into the URL — and
   * encodeURIComponent would happily re-encode a comma into %2C, which PostgREST decodes back
   * into a separator. A test that only inspected tokens would miss that entirely. */
  it.each([
    [",", "a comma separates two conditions"],
    ["(", "an open paren starts a group"],
    [")", "a close paren ends ours early"],
    [".", "a dot separates column.operator.value"],
    ["*", "an asterisk is the ilike wildcard"],
    ["\\", "a backslash is PostgREST's escape"],
    ["%", "a percent is a SQL LIKE wildcard"],
    ["_", "an underscore is a single-char LIKE wildcard"],
  ])("never lets %j through (%s)", (ch) => {
    const clause = clauseFor(`main${ch}street`);
    expect(isIntact(clause), `clause structure broken: ${skeleton(clause)}`).toBe(true);
    // And the character itself never reaches a value, raw OR percent-encoded — PostgREST
    // decodes before it parses, so %2C and , are the same thing to it.
    const values = [...clause.matchAll(/ilike\.\*([^*]*)\*/g)].map((m) => m[1]);
    for (const v of values) {
      expect(v).not.toContain(ch);
      expect(decodeURIComponent(v)).not.toContain(ch);
    }
  });

  /** The whole point, stated as one case. The attempt closes our group, opens its own filter on
   * a column we never exposed, and asks for Sold rows. What comes out the other side is five
   * ordinary word tokens, each sealed inside an OR group as a VALUE. */
  it("defuses a filter-injection attempt", () => {
    const clause = clauseFor("main),or(id.eq.1,status.eq.Sold),and(x.gt.0");
    expect(isIntact(clause), `clause structure broken: ${skeleton(clause)}`).toBe(true);
    // Nothing that could retarget a column or an operator survives, decoded or not.
    const decoded = decodeURIComponent(clause);
    for (const probe of ["id.eq", "status.eq", "x.gt", "and(", ".eq.", ".gt."]) {
      expect(decoded, `"${probe}" survived into the filter`).not.toContain(probe);
    }
    // The word "status" DOES survive, and that is correct: as a value it is six letters.
    expect(decoded).toContain("ilike.*status*");
  });

  /** An apostrophe is not an injection route here — PostgREST binds the value rather than
   * building SQL by hand — and it is legal in a query string, so it passes through unencoded.
   * What matters is that it cannot break the clause apart. */
  it("carries an apostrophe through without breaking the filter", () => {
    const clause = clauseFor("123 O'Brien St #L2");
    expect(isIntact(clause), `clause structure broken: ${skeleton(clause)}`).toBe(true);
    expect(clause).toContain("o'brien");
  });

  /** A hash would end the URL at the fragment if it were emitted raw. */
  it("percent-encodes a hash rather than starting a URL fragment", () => {
    const clause = clauseFor("215 central avenue #10E");
    expect(clause).not.toContain("#");
    expect(clause).toContain("%2310e");
  });

  /** A paste is the cheap way to make the server do 200 column scans. */
  it("caps the number of tokens no matter how long the paste", () => {
    expect(addressTokens("word ".repeat(200)).length).toBeLessThanOrEqual(5);
    expect(addressTokens("x".repeat(200)).length).toBeLessThanOrEqual(5);
  });
});

describe("address query — it still finds the house", () => {
  /** The owner's own example, and the reason the matcher is tokenised at all. */
  it("keeps the parts of '150 hooker ave poughkeepsie ny' that identify the home", () => {
    expect(addressTokens("150 hooker ave poughkeepsie ny")).toEqual([
      "150",
      "hooker",
      "poughkeepsie",
    ]);
  });

  it("drops the street suffix so 'ave' still matches a stored 'Avenue'", () => {
    expect(addressTokens("22 north ave")).toEqual(["22", "north"]);
  });

  it("matches in any order", () => {
    expect(addressTokens("poughkeepsie hooker 150").sort()).toEqual(
      addressTokens("150 hooker poughkeepsie").sort(),
    );
  });

  /** A hyphenated house number is a real Queens address shape ("136-35 37th Ave"). The hyphen
   * is not structural to PostgREST, so it must NOT be stripped — splitting it would ask for two
   * tokens that never appear. */
  it("keeps a hyphenated house number intact", () => {
    expect(addressTokens("136-35 37th ave")).toContain("136-35");
  });

  /** A unit number is the difference between two homes at one address, and the stored address
   * keeps the hash ("215 Central Avenue #10E") — so the hash belongs in the token too. It is
   * not structural to PostgREST; it only has to survive the URL, which encoding handles. */
  it("keeps a unit token, hash and all, because that is how it is stored", () => {
    expect(addressTokens("215 central avenue #10E")).toContain("#10e");
  });

  /** Noise only: there is nothing here that identifies a home, and asking the database anyway
   * would return the first four Active rows in the county and present them as matches. */
  it.each(["ave ny", "st", "  ", "ny usa"])("returns nothing for the noise-only query %j", (q) => {
    expect(addressTokens(q)).toEqual([]);
  });

  /** "Beacon" is a town before it is a street, and it is also both. The tokeniser must not care
   * which — it requires the word to appear in address OR city OR zip. */
  it("does not care whether a word is a town or a street", () => {
    expect(addressFilterClause(addressTokens("beacon"))).toBe(
      "or(address.ilike.*beacon*,city.ilike.*beacon*,zip.ilike.*beacon*)",
    );
  });

  /** Single characters carry no signal and would match most of the inventory. */
  it("ignores single characters", () => {
    expect(addressTokens("a b c 150")).toEqual(["150"]);
  });
});
