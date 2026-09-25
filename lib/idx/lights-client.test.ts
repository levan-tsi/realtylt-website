import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { packLights } from "./lights";

const BOX = { west: -74.75, south: 40.49, east: -73.51, north: 42.14 };
const packed = packLights([{ lat: 41.7, lng: -73.93, city: "Poughkeepsie" }], BOX);
const response = () => ({ json: async () => packed }) as unknown as Response;

type W = { [k: string]: unknown };
const g = globalThis as unknown as { window?: W; fetch?: unknown };

describe("the lights client and the page's early fetch (round 59)", () => {
  beforeEach(() => {
    vi.resetModules();
    g.window = {};
  });
  afterEach(() => {
    delete g.window;
    vi.unstubAllGlobals();
  });

  it("takes the promise the page's inline script left on the window and does not fetch again", async () => {
    const fetch = vi.fn(async () => response());
    vi.stubGlobal("fetch", fetch);
    const { loadLights, EARLY_LIGHTS_KEY } = await import("./lights-client");
    g.window![EARLY_LIGHTS_KEY] = Promise.resolve(response());
    const pts = await loadLights();
    expect(pts?.x.length).toBe(1);
    expect(fetch).not.toHaveBeenCalled();
    // Taken once: the window no longer holds it (a retry after a failure fetches afresh).
    expect(g.window![EARLY_LIGHTS_KEY]).toBeUndefined();
    // One fetch for everything on the page: a second caller shares the first answer.
    expect(await loadLights()).toBe(pts);
  });

  it("fetches /api/lights itself when the page left nothing (no inline script, or another page)", async () => {
    const fetch = vi.fn(async () => response());
    vi.stubGlobal("fetch", fetch);
    const { loadLights } = await import("./lights-client");
    const pts = await loadLights();
    expect(pts?.x.length).toBe(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/lights");
  });

  it("a failed early fetch is not remembered: the next caller fetches afresh", async () => {
    const fetch = vi.fn(async () => response());
    vi.stubGlobal("fetch", fetch);
    const { loadLights, EARLY_LIGHTS_KEY } = await import("./lights-client");
    const early = Promise.reject(new Error("offline"));
    early.catch(() => {});
    g.window![EARLY_LIGHTS_KEY] = early;
    expect(await loadLights()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    const pts = await loadLights();
    expect(pts?.x.length).toBe(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
