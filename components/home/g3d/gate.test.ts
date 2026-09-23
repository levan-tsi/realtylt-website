import { describe, expect, it } from "vitest";
import { FlightGate } from "./gate";

describe("the flight gate", () => {
  it("lets a flight go at once over a steady, still map", () => {
    const g = new FlightGate<string>();
    g.setSteady(true, 0);
    expect(g.request("dutchess", 10)).toBe("dutchess");
  });

  it("holds a flight while the map is still drawing, and lets it go when it is steady", () => {
    const g = new FlightGate<string>();
    g.setSteady(false, 0);
    expect(g.request("dutchess", 10)).toBeNull();
    expect(g.held()).toBe("dutchess");
    expect(g.setSteady(true, 300)).toBe("dutchess");
    expect(g.held()).toBeNull();
  });

  it("never starts a second flight over one in the air, and keeps only the latest destination", () => {
    const g = new FlightGate<string>();
    g.setSteady(true, 0);
    expect(g.request("dutchess", 0)).toBe("dutchess");
    g.started();
    g.setSteady(false, 10);
    expect(g.request("highlands", 100)).toBeNull();
    expect(g.request("westchester", 200)).toBeNull();
    expect(g.setSteady(true, 2000)).toBeNull(); // still flying
    expect(g.landed(2600)).toBe("westchester");
  });

  it("waits for the map to settle after a landing before the held flight goes", () => {
    const g = new FlightGate<string>();
    g.setSteady(true, 0);
    g.request("a", 0);
    g.started();
    g.setSteady(false, 50);
    g.request("b", 500);
    expect(g.landed(2600)).toBeNull(); // landed, tiles still streaming
    expect(g.setSteady(true, 2900)).toBe("b");
  });

  it("does not let a map that never settles hold the page hostage", () => {
    const g = new FlightGate<string>(1200);
    g.setSteady(false, 0);
    expect(g.request("harbour", 100)).toBeNull();
    expect(g.poll(1000)).toBeNull();
    expect(g.poll(1300)).toBe("harbour");
  });

  it("measures the wait from the first held request, not the latest", () => {
    const g = new FlightGate<string>(1200);
    g.setSteady(false, 0);
    g.request("a", 100);
    g.request("b", 1000);
    expect(g.poll(1310)).toBe("b");
  });

  it("never lets the time limit start a flight over a flight", () => {
    const g = new FlightGate<string>(1200);
    g.setSteady(true, 0);
    g.request("a", 0);
    g.started();
    g.setSteady(false, 10);
    g.request("b", 20);
    expect(g.poll(5000)).toBeNull();
    expect(g.landed(5100)).toBeNull(); // the wait for a settled map starts at the landing
    expect(g.poll(6000)).toBeNull();
    expect(g.poll(6400)).toBe("b");
  });

  it("allows marker work only on a steady, still map with nothing waiting", () => {
    const g = new FlightGate<string>();
    expect(g.canMark()).toBe(false); // not steady yet
    g.setSteady(true, 0);
    expect(g.canMark()).toBe(true);
    g.request("a", 0);
    g.started();
    expect(g.canMark()).toBe(false);
    g.landed(100);
    expect(g.canMark()).toBe(true);
    g.setSteady(false, 150);
    expect(g.canMark()).toBe(false);
    g.request("b", 200);
    g.setSteady(true, 300); // releases b
    expect(g.canMark()).toBe(true);
  });

  it("forgets a held destination when told to", () => {
    const g = new FlightGate<string>();
    g.request("a", 0);
    g.clear();
    g.setSteady(true, 10);
    expect(g.held()).toBeNull();
    expect(g.canMark()).toBe(true);
  });
});
