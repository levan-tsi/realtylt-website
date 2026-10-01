/** The home grounds' shared shapes: the homes the lights are drawn from and a featured home
 * (used by components/home/ml/ and components/home/plates/). Until round 65 this file also held
 * G3dController, Google's 3D map driven one flight per section (round 56), retired with that ground. */
import type { LightSet } from "./thinning";

export interface Homes extends LightSet {
  /** Each home's key for the planner's fixed order (light-plan.ts placeKeys): stable across syncs. */
  key: ArrayLike<number>;
  town: Uint16Array;
  towns: readonly string[];
}

export interface FeaturedHome {
  id: string;
  lat: number;
  lng: number;
  /** "$649,000, 18 Harrison Street, Poughkeepsie": what a screen reader and the tooltip say. */
  title: string;
  href: string;
  /** What its label says when its card has focus (round 57.3, interaction.ts labelContent). */
  price?: number;
  beds?: number;
  baths?: number;
  address?: string;
  city?: string;
}
