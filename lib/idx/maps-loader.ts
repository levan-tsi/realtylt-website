/** Singleton Google Maps JS loader — shared by the search results map (GoogleMapView) and the
 * listing gallery's Street View / Map tabs so the script loads at most once per page. Resolves
 * immediately if Maps is already present. Uses the referrer-restricted NEXT_PUBLIC key (browser
 * call from our own origin), so no server-side key is needed.
 *
 * `libraries` (round 56): the 3D map needs `maps3d`. They are named on the script URL when this
 * call is the one that loads the script, and imported with `google.maps.importLibrary` in every
 * case, so a page whose 2D map loaded the script first still gets its 3D library before the
 * promise resolves. Without libraries the URL and the behaviour are exactly what they were. */
let loader: Promise<void> | null = null;

export function mapsScriptUrl(key: string, libraries: readonly string[] = []): string {
  const libs = libraries.length ? `&libraries=${libraries.map(encodeURIComponent).join(",")}` : "";
  return `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async${libs}&callback=__rltMapsReady`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = () => (globalThis as any).google;

function withLibraries(p: Promise<void>, libraries: readonly string[]): Promise<void> {
  if (!libraries.length) return p;
  return p.then(() => Promise.all(libraries.map((l) => g().maps.importLibrary(l))).then(() => undefined));
}

export function loadMaps(key: string, libraries: readonly string[] = []): Promise<void> {
  if (typeof g() !== "undefined" && g()?.maps?.Map) {
    return withLibraries(Promise.resolve(), libraries);
  }
  if (loader) return withLibraries(loader, libraries);
  loader = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = mapsScriptUrl(key, libraries);
    s.async = true;
    // The callback exists before the tag does: an async script can run before any code after it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__rltMapsReady = () => resolve();
    // Round 57.5: a failed load is forgotten, so the next caller on this page view (/search after the
    // home map failed, or the home page mounted again by a client navigation) tries again instead of inheriting the failure.
    s.onerror = () => {
      loader = null;
      reject(new Error("Google Maps failed to load"));
    };
    document.head.appendChild(s);
  });
  return withLibraries(loader, libraries);
}
