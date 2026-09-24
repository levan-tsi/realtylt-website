"use client";

import { usePathname } from "next/navigation";
import { homeMap } from "@/lib/home-map";

/** The terrain and night-lights credit for the home page's ground, in the footer's legal strip.
 *
 * The ground's land is built from public-domain elevation data whose sources ask to be named, and
 * the night flight's towns' glow from NASA's Black Marble, whose usage guidelines ask that NASA be
 * acknowledged as the source (public/images/ATTRIBUTIONS.md records each one and quotes the wording
 * verbatim; a text line, never an insignia). The credit belongs where a reader would look for one,
 * which is the footer; it renders on the ONE page that shows the ground and nothing at all on every
 * other page, so no other footer changes.
 *
 * Round 57.6: the credit follows the sources the page actually shows. On the real map (the default
 * with a key) our load cover is drawn from the elevation data and our own listings, with no night
 * imagery (scripts/make-map-cover.mjs --look=night), so NASA is named only when the ground is the
 * night flight (no key, or `NEXT_PUBLIC_HOME_MAP=night`), whose scene does use Black Marble.
 * Round 57.9: the real map's cover draws the coast and the sea beyond our elevation grid from
 * Natural Earth's land (public domain; no credit is required, it is named because it is used). */
export function SceneCredit() {
  if (usePathname() !== "/") return null;
  const night = homeMap({ NEXT_PUBLIC_HOME_MAP: process.env.NEXT_PUBLIC_HOME_MAP, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }) === "night";
  return (
    <p className="max-w-full md:ml-6 md:border-l md:border-current/20 md:pl-6">
      Terrain: Mapzen; USGS 3DEP, SRTM, GMTED2010 and NHD; NOAA ETOPO1.
      {night ? " Night lights: NASA Earth Observatory (Black Marble 2016, Suomi NPP VIIRS)." : " Coastline: Natural Earth."}
    </p>
  );
}
