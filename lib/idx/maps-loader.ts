/** Singleton Google Maps JS loader — shared by the search results map (GoogleMapView) and the
 * listing gallery's Street View / Map tabs so the script loads at most once per page. Resolves
 * immediately if Maps is already present. Uses the referrer-restricted NEXT_PUBLIC key (browser
 * call from our own origin), so no server-side key is needed. */
let loader: Promise<void> | null = null;

export function loadMaps(key: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).google !== "undefined" && (globalThis as any).google?.maps?.Map) {
    return Promise.resolve();
  }
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=__rltMapsReady`;
    s.async = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__rltMapsReady = () => resolve();
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
  return loader;
}
