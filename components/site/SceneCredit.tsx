"use client";

import { usePathname } from "next/navigation";

/** The terrain credit for the home page's night flight, in the footer's legal strip.
 *
 * The scene's land is built from public-domain elevation data whose sources ask to be named
 * (public/images/ATTRIBUTIONS.md records each one and quotes the wording verbatim). The credit
 * belongs where a reader would look for one, which is the footer; it renders on the ONE page
 * that shows the scene and nothing at all on every other page, so no other footer changes. */
export function SceneCredit() {
  if (usePathname() !== "/") return null;
  return (
    <p className="max-w-full md:ml-6 md:border-l md:border-current/20 md:pl-6">
      Terrain: Mapzen; USGS 3DEP, SRTM, GMTED2010 and NHD; NOAA ETOPO1.
    </p>
  );
}
