/** THE NIGHT FLIGHT'S WORLD (round 54): one coordinate system for the land, the lights and the
 * camera.
 *
 * World units are KILOMETRES. The origin is the middle of the served region (SERVED_REGION, the
 * lights' box), x runs east, z runs SOUTH (so a camera looking north looks down -z, three.js's
 * own forward), y is up. Longitude is scaled by cos(latitude at the origin), so a kilometre east
 * and a kilometre north are the same length on screen (the region spans 1.65 degrees of latitude;
 * the scale is exact at 41.3 N and 1.3% off at the region's north and south edges).
 *
 * Heights are EXAGGERATED: a real metre of elevation is EXAGGERATION metres of world height. At
 * 1:1 the Hudson Highlands (400 m) are a crease in a 180 km valley; lifted, they read as the
 * mountains they are from the air. The camera's own altitude is in plain world kilometres. */
import { SERVED_REGION } from "@/components/idx/county-bounds";

export type LngLatBox = { south: number; north: number; west: number; east: number };
export type Vec3 = [number, number, number];

export const REGION: LngLatBox = SERVED_REGION;
export const ORIGIN = {
  lat: (REGION.south + REGION.north) / 2,
  lng: (REGION.west + REGION.east) / 2,
};
export const KM_PER_DEG_LAT = 111.132;
export const KM_PER_DEG_LNG = 111.32 * Math.cos((ORIGIN.lat * Math.PI) / 180);
/** Vertical exaggeration of the terrain (and of the lights sitting on it). */
export const EXAGGERATION = 6;

/** Elevation in metres to world height (km, exaggerated). */
export function heightToWorld(elevM: number): number {
  return (elevM / 1000) * EXAGGERATION;
}

export function lngLatToWorld(lng: number, lat: number, elevM = 0): Vec3 {
  return [(lng - ORIGIN.lng) * KM_PER_DEG_LNG, heightToWorld(elevM), -(lat - ORIGIN.lat) * KM_PER_DEG_LAT];
}

export function worldToLngLat(x: number, z: number): [number, number] {
  return [ORIGIN.lng + x / KM_PER_DEG_LNG, ORIGIN.lat - z / KM_PER_DEG_LAT];
}

/** A point given as a fraction of a box (u west to east, v NORTH to south, the order
 * lib/idx/lights.ts packs in) to longitude and latitude. */
export function boxUVToLngLat(u: number, v: number, box: LngLatBox): [number, number] {
  return [box.west + u * (box.east - box.west), box.north - v * (box.north - box.south)];
}

/** A camera position or target written the way a person thinks of it: over a place, at a height
 * in world kilometres. */
export function over(lng: number, lat: number, y: number): Vec3 {
  const [x, , z] = lngLatToWorld(lng, lat);
  return [x, y, z];
}
