"use client";

/** THE OTHER GROUNDS, SPLIT (round 61). Google's 3D map (`NEXT_PUBLIC_HOME_MAP=g3d`) and the night
 * flight (`=night`) are never shown beside the plates, but imported statically by app/page.tsx they
 * were bundled into the home page's own chunk (the analyzer: G3dGround 27.8 KB, its controller
 * 13.8 KB, the night flight's ground and scene and their helpers, about 90 KB parsed of the 212), so
 * every visitor downloaded and parsed them before the page could hydrate. `next/dynamic` from a
 * SERVER component does not split a client component out of the page's entry (measured: the chunk
 * kept all of them), so the split lives here, on the client side of the boundary: each is its own
 * chunk, fetched only by a page that renders it, and still rendered on the server (ssr stays on),
 * so nothing about those grounds changes. */
import dynamic from "next/dynamic";

export const NightGround = dynamic(() => import("./night/NightGround").then((m) => m.NightGround));
export const AreaChapter = dynamic(() => import("./night/AreaChapter").then((m) => m.AreaChapter));
export const G3dGround = dynamic(() => import("./g3d/G3dGround").then((m) => m.G3dGround));
export const G3dAreaChapter = dynamic(() => import("./g3d/G3dAreaChapter").then((m) => m.G3dAreaChapter));
