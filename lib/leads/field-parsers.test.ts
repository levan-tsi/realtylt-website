import { describe, expect, it } from "vitest";
import { parseAddress, parseFullName } from "./field-parsers";

describe("parseFullName", () => {
  it("1 word -> first only", () => {
    expect(parseFullName("Levan")).toEqual({ firstName: "Levan", lastName: "" });
  });
  it("2 words -> first / last", () => {
    expect(parseFullName("Ada Lovelace")).toEqual({ firstName: "Ada", lastName: "Lovelace" });
  });
  it("3+ words -> first + rest joined as last", () => {
    expect(parseFullName("Mariam Anna Kereselidze")).toEqual({
      firstName: "Mariam",
      lastName: "Anna Kereselidze",
    });
    expect(parseFullName("Jean Claude Van Damme")).toEqual({
      firstName: "Jean",
      lastName: "Claude Van Damme",
    });
  });
  it("collapses extra whitespace and trims", () => {
    expect(parseFullName("  Ada   Lovelace  ")).toEqual({ firstName: "Ada", lastName: "Lovelace" });
  });
  it("empty / whitespace -> both empty", () => {
    expect(parseFullName("")).toEqual({ firstName: "", lastName: "" });
    expect(parseFullName("   ")).toEqual({ firstName: "", lastName: "" });
  });
});

describe("parseAddress", () => {
  it("standard street, city, state ZIP", () => {
    expect(parseAddress("123 Main St, Hyde Park, NY 12044")).toEqual({
      street: "123 Main St",
      city: "Hyde Park",
      state: "NY",
      postalCode: "12044",
    });
  });

  it("ZIP+4", () => {
    expect(parseAddress("123 Main St, Hyde Park, NY 12044-1234")).toEqual({
      street: "123 Main St",
      city: "Hyde Park",
      state: "NY",
      postalCode: "12044-1234",
    });
  });

  it("missing state -> state empty, city + zip still parsed", () => {
    expect(parseAddress("123 Main St, Hyde Park, 12044")).toEqual({
      street: "123 Main St",
      city: "Hyde Park",
      state: "",
      postalCode: "12044",
    });
  });

  it("no commas -> best-effort street, zip + state still pulled", () => {
    const r = parseAddress("123 Main St Hyde Park NY 12044");
    expect(r.postalCode).toBe("12044");
    expect(r.state).toBe("NY");
    expect(r.street).toContain("123 Main St");
    expect(r.city).toBe("");
  });

  it("a 5-digit street number is NOT read as the ZIP (last group wins)", () => {
    expect(parseAddress("12345 Broadway, New York, NY 10001")).toEqual({
      street: "12345 Broadway",
      city: "New York",
      state: "NY",
      postalCode: "10001",
    });
  });

  it("state directly after the city with no comma between them", () => {
    expect(parseAddress("50 Market St, Rye NY 10580")).toEqual({
      street: "50 Market St",
      city: "Rye",
      state: "NY",
      postalCode: "10580",
    });
  });

  it("multi-word city keeps all its words", () => {
    expect(parseAddress("9 Oak Ln, Wappingers Falls, NY 12590")).toEqual({
      street: "9 Oak Ln",
      city: "Wappingers Falls",
      state: "NY",
      postalCode: "12590",
    });
  });

  it("unit in the street part is preserved", () => {
    const r = parseAddress("1332 Metropolitan Ave #6A, Bronx, NY 10462");
    expect(r.street).toBe("1332 Metropolitan Ave #6A");
    expect(r.city).toBe("Bronx");
    expect(r.state).toBe("NY");
    expect(r.postalCode).toBe("10462");
  });

  it("empty / whitespace -> all empty", () => {
    expect(parseAddress("")).toEqual({ street: "", city: "", state: "", postalCode: "" });
    expect(parseAddress("   ")).toEqual({ street: "", city: "", state: "", postalCode: "" });
  });

  it("street only -> everything else empty", () => {
    expect(parseAddress("123 Main St")).toEqual({
      street: "123 Main St",
      city: "",
      state: "",
      postalCode: "",
    });
  });
});
