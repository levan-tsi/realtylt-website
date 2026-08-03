"use client";

import { useEffect, useRef, useState } from "react";
import { loadMaps } from "@/lib/idx/maps-loader";
import { isSpecificAddress } from "@/lib/geo/address-precision";

/** "WE'VE FOUND YOUR HOME" — the confirmation step the live site has and we did not.
 *
 * The owner reported that typing `150 hooker ave poughkeepsie ny` finds nothing on our site and
 * does on his. Driving his live site settled what that actually is: on /homevalue it is Google
 * Places autocomplete, and picking a suggestion produces a card with a Street View photo of the
 * house, the normalised address including the ZIP, and an Edit link.
 *
 * This is the part of that which costs NOTHING new. Places is the only Google API on our key
 * that is not switched on; Geocoding and Street View already are, already billed, and already
 * used by the listing gallery. So the visitor types the whole address themselves (no type-ahead
 * dropdown yet, that is Places and a recurring bill for the owner to approve) and everything
 * after it is the same: we geocode what they typed, show them their own roof, and hand the
 * NORMALISED address onward instead of their free text.
 *
 * That last part is the quiet win. "150 hooker ave poughkeepsie ny" reaches the CRM as
 * "150 Hooker Ave, Poughkeepsie, NY 12601, USA" with a real ZIP, which is what makes the lead
 * matchable and the comps searchable.
 *
 * DEGRADES TO NOTHING. No key, no geocode, a rural address Google cannot place, a blocked
 * referrer: this renders null and the fork behaves exactly as it did before, with the typed
 * text. A confirmation step that can fail closed is worse than no confirmation step.
 */
export function FoundYourHome({
  query,
  onResolved,
}: {
  /** The address exactly as the visitor typed it. */
  query: string;
  /** Called once with Google's normalised address when it resolves. */
  onResolved?: (address: string) => void;
}) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // undefined = still looking, null = could not place it, value = found.
  const [place, setPlace] = useState<
    { formatted: string; lat: number; lng: number } | null | undefined
  >(key && query ? undefined : null);
  const [hasPano, setHasPano] = useState(false);
  const panoRef = useRef<HTMLDivElement>(null);
  const resolvedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!key || !query) return;
    let disposed = false;
    // Clear the previous home before looking up the new one, or the card shows the last
    // address's roof underneath this address's name until the geocoder answers.
    setPlace(undefined);
    setHasPano(false);
    (async () => {
      try {
        await loadMaps(key);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g: any = (globalThis as any).google;
        const found = await new Promise<{ formatted: string; lat: number; lng: number } | null>(
          (resolve) => {
            new g.maps.Geocoder().geocode(
              // Bias to New York: "Beacon" and "Warwick" are towns in several states, and the
              // visitor is standing in the one we sell in.
              { address: query, componentRestrictions: { country: "us" } },
              (r: unknown[], status: string) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                // Take the first result that is an actual building. Google answers OK with a
                // country-level "United States" for junk input, and with a town for a vague
                // one — see lib/geo/address-precision.ts.
                const top: any = ((r as any[]) ?? []).find(isSpecificAddress);
                const loc = top?.geometry?.location;
                resolve(
                  status === "OK" && loc && top?.formatted_address
                    ? {
                        // Google ends every US result ", USA". Nobody selling a house in
                        // Poughkeepsie needs telling which country it is in.
                        formatted: String(top.formatted_address).replace(/,\s*USA$/, ""),
                        lat: loc.lat(),
                        lng: loc.lng(),
                      }
                    : null,
                );
              },
            );
          },
        );
        if (disposed) return;
        setPlace(found);
        if (found && resolvedRef.current !== found.formatted) {
          resolvedRef.current = found.formatted;
          onResolved?.(found.formatted);
        }
      } catch {
        if (!disposed) setPlace(null);
      }
    })();
    return () => {
      disposed = true;
    };
    // onResolved is intentionally not a dep: callers pass an inline setter, and re-running this
    // on every parent render would geocode on a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, query]);

  // Ask whether a panorama EXISTS before painting one. Street View has no coverage on plenty of
  // private roads, and an empty grey panel under "we've found your home" says the opposite of
  // what the step is for.
  useEffect(() => {
    if (!place || !panoRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any = (globalThis as any).google;
    if (!g?.maps) return;
    let disposed = false;
    new g.maps.StreetViewService().getPanorama(
      { location: { lat: place.lat, lng: place.lng }, radius: 60 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: any, status: string) => {
        if (disposed || status !== "OK" || !panoRef.current) return;
        setHasPano(true);
        new g.maps.StreetViewPanorama(panoRef.current, {
          pano: data.location.pano,
          // Point the camera AT the house rather than wherever the car happened to be facing.
          pov: {
            heading: g.maps.geometry?.spherical
              ? g.maps.geometry.spherical.computeHeading(data.location.latLng, new g.maps.LatLng(place.lat, place.lng))
              : 0,
            pitch: 0,
          },
          // A thumbnail, not a toy: no controls, no navigation, nothing to get lost in.
          disableDefaultUI: true,
          clickToGo: false,
          scrollwheel: false,
          linksControl: false,
          panControl: false,
          zoomControl: false,
          addressControl: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
        });
      },
    );
    return () => {
      disposed = true;
    };
  }, [place]);

  // Still looking, could not place it, or no Street View coverage: render nothing at all. The
  // card that owns this still shows the address and the fork, so there is no empty frame and no
  // half-built state — just the page as it was before.
  if (!place || !hasPano) {
    // The panorama has to have somewhere to mount while we are still asking whether one exists,
    // so keep the node in the tree and hidden rather than conditionally creating it.
    return <div ref={panoRef} className="hidden" aria-hidden />;
  }

  return (
    /* 12px inside the card's 16px, so the corners stay concentric. */
    <div className="mb-5 overflow-hidden rounded-xl border border-line bg-mist">
      {/* Deliberately NOT role="img": Google paints its own focusable chrome inside the
          panorama (the Terms link, the keyboard-shortcuts button, both required), and calling
          the container a single image while it still contains tab stops is the kind of markup
          that reads fine and behaves badly. The address is announced by the card's own text
          immediately below, so this stays a decorative frame. */}
      <div ref={panoRef} className="h-40 w-full sm:h-48" />
    </div>
  );
}
