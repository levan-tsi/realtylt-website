import { afterEach, describe, expect, it, vi } from "vitest";

/** The loader is shared by /search's 2D map, the listing gallery and (round 56) the 3D map. The 2D
 * callers' script URL must not change by one byte; the 3D map names its library on the URL and
 * gets it imported however the script arrived. */

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

function fakeDom() {
  const appended: { src: string; async: boolean }[] = [];
  vi.stubGlobal("document", {
    createElement: () => ({ src: "", async: false, onerror: null }),
    head: { appendChild: (s: { src: string; async: boolean }) => appended.push(s) },
  });
  vi.stubGlobal("window", globalThis);
  return appended;
}

describe("mapsScriptUrl", () => {
  it("is exactly the URL /search has always loaded when no library is named", async () => {
    const { mapsScriptUrl } = await import("./maps-loader");
    expect(mapsScriptUrl("K 1")).toBe("https://maps.googleapis.com/maps/api/js?key=K%201&loading=async&callback=__rltMapsReady");
  });

  it("names the 3D library for the home map", async () => {
    const { mapsScriptUrl } = await import("./maps-loader");
    expect(mapsScriptUrl("K", ["maps3d"])).toBe(
      "https://maps.googleapis.com/maps/api/js?key=K&loading=async&libraries=maps3d&callback=__rltMapsReady",
    );
    expect(mapsScriptUrl("K", ["maps3d", "marker"])).toContain("&libraries=maps3d,marker&");
  });
});

describe("loadMaps", () => {
  it("appends one script, defines the callback before the tag, and imports the named libraries", async () => {
    const appended = fakeDom();
    const importLibrary = vi.fn(() => Promise.resolve({}));
    const { loadMaps } = await import("./maps-loader");
    const p = loadMaps("K", ["maps3d"]);
    const again = loadMaps("K", ["maps3d"]);
    expect(appended).toHaveLength(1);
    expect(appended[0].src).toContain("libraries=maps3d");
    expect(appended[0].async).toBe(true);
    // The script runs the callback: google is there now.
    vi.stubGlobal("google", { maps: { importLibrary } });
    (globalThis as unknown as { __rltMapsReady: () => void }).__rltMapsReady();
    await Promise.all([p, again]);
    expect(importLibrary).toHaveBeenCalledWith("maps3d");
  });

  it("imports the 3D library on a page whose 2D map already loaded the script", async () => {
    const appended = fakeDom();
    const importLibrary = vi.fn(() => Promise.resolve({}));
    vi.stubGlobal("google", { maps: { Map: function Map() {}, importLibrary } });
    const { loadMaps } = await import("./maps-loader");
    await loadMaps("K", ["maps3d"]);
    expect(appended).toHaveLength(0);
    expect(importLibrary).toHaveBeenCalledWith("maps3d");
  });

  it("imports nothing for the 2D callers", async () => {
    fakeDom();
    const importLibrary = vi.fn(() => Promise.resolve({}));
    vi.stubGlobal("google", { maps: { Map: function Map() {}, importLibrary } });
    const { loadMaps } = await import("./maps-loader");
    await loadMaps("K");
    expect(importLibrary).not.toHaveBeenCalled();
  });
});
