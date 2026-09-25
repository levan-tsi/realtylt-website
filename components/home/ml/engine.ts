/** WHAT THE GROUND NEEDS FROM ITS ENGINE (round 58). MlGround.tsx draws the words' scrims, our
 * names, the hover label, the tap, the click and the featured cards' focus over whatever stands
 * behind the page; two engines stand there: the live MapLibre night map (./controller.ts, the
 * renderer and `NEXT_PUBLIC_HOME_MAP=ml`) and the plates (../plates/plate-controller.ts, the
 * default since round 58). This is the surface the ground drives; each engine's own methods stay
 * on its class. */
import type { ElevationGrid } from "../night/elevation";
import type { ShotName } from "../night/shots";
import type { FeaturedHome, Homes } from "../g3d/controller";
import type { LayerCamera, LightLayer } from "../g3d/light-layer";
import type { MlStats } from "./controller";

export interface GroundEngine {
  /** The light layer the pointer is tested against (the plates: the plate on screen). */
  readonly layer: LightLayer | null;
  readonly xy: Float32Array;
  readonly xyIndex: Int32Array;
  readonly xyCount: number;
  /** Something stands behind the page and can be asked where a place is. */
  ready(): boolean;
  start(host: HTMLElement): void | Promise<void>;
  stop(): void;
  view(): { width: number; height: number; fov: number };
  heldShot(): ShotName | null;
  isFlying(): boolean;
  isSteadyStill(): boolean;
  resized(): void;
  /** Draw no light in this window rectangle (the data credit's corner). */
  setAvoid(r: { x: number; y: number; w: number; h: number } | null): void;
  flyToShot(name: ShotName): void;
  flyToHome(home: { lat: number; lng: number }, spot: { x: number; y: number } | null, ms?: number): void;
  flyIn(home: { lat: number; lng: number }): Promise<void>;
  setHomes(h: Homes): void;
  setElevation(g: ElevationGrid): void;
  setFeatured(list: readonly FeaturedHome[]): void;
  lightHome(i: number | null): void;
  lightFeatured(id: string | null): void;
  lit(): { home: number | null; featured: string | null };
  townOf(i: number): string;
  homeAt(i: number): { lat: number; lng: number } | null;
  screenOf(lat: number, lng: number, h?: number): { x: number; y: number } | null;
  stats(): MlStats;
  camera(): LayerCamera | null;
  /** Have these shots' pictures ready (the plates); the live map has nothing to warm. `films`: the
   * shot the page is on, then the nearest different shot either way (round 59: the films to them). */
  warm?(names: readonly ShotName[], films?: readonly ShotName[]): void;
}
