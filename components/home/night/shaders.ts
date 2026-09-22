/** The night flight's point shaders (GLSL for three's ShaderMaterial, which supplies position,
 * modelViewMatrix, projectionMatrix and cameraPosition).
 *
 * Both clouds are drawn ADDITIVELY on black (blend ONE, ONE; the fragment writes premultiplied
 * light), with no bloom pass: a point's glow is its own soft sprite, so the only light in the
 * picture is light that has a source.
 *
 * Buffers hold REAL heights (km); every vertex shader lifts y by uExag, so the relief is a uniform.
 *
 * Shared uniforms:
 *   uExag        vertical exaggeration
 *   uPixelRatio  device pixels per css pixel
 *   uFocal       focal length in device pixels (0.5 * height / tan(fov / 2)): world size to pixels
 *   uIntro       seconds since this cloud's intro began (huge under reduced motion: all on)
 *   uVeil        0..1, dims the scene under page content
 *   uPointer     the lantern, in normalised device coordinates; uPointerOn fades it in and out
 *   uAspect      width / height, so the lantern is round
 *   uFog         (near, far) in world km: past `near` everything fades to black by `far`
 *   uQuietA/B    up to two screen boxes where the page's words sit (see QUIET below)
 *   uQuietSoft   how far, in NDC, the quiet eases back to the full scene: (across, down)
 */

/** QUIET ZONES, shared by every cloud.
 *
 * Up to FOUR screen rectangles (NDC: x0, y0, x1, y1) where the page's words sit. `quietAt` returns
 * how OPEN the scene is there: 1 outside, 0 in the core, eased between. Each cloud decides for
 * itself how dark 0 is, because the land and the lights are not equally in the way of a sentence:
 * a contour under a letter is a texture, a window under a letter is a hole in it.
 *
 * (Two was not enough: a window that holds a section's heading and the section below it has four
 * boxes worth quieting, and taking the two largest left a 60 px heading sitting on the harbour.)
 *
 * The shape matters as much as the depth. A rectangle's edge, drawn across a 1,100 px quote, reads
 * as a BAND drawn on the page (round 54, builder 3: the orchestrator saw exactly that line at the
 * top of the testimonial). So the easing runs a long way — a quarter of the window's height and
 * more — the two overhangs are combined with a rounded norm so there are no corners, and the ramp's
 * length breathes slightly along the box, so no iso-line in it is ever perfectly straight. */
const QUIET = /* glsl */ `
uniform vec4 uQuietA, uQuietB, uQuietC, uQuietD;
uniform vec2 uQuietSoft;
float quietOne(vec4 r, vec2 ndc) {
  if (r.z <= r.x) return 1.0;
  vec2 s = vec2(uAspect, 1.0);
  vec2 c = (r.xy + r.zw) * 0.5 * s;
  vec2 h = (r.zw - r.xy) * 0.5 * s;
  vec2 p = abs(ndc * s - c);
  // The ramp's length breathes +-14% along the box (two incommensurate waves, so it never
  // repeats): a gradient that wanders cannot be read as a line, and at this amplitude nobody
  // sees the wander itself.
  vec2 soft = uQuietSoft * (1.0 + 0.14 * sin(ndc.x * 4.7 + 1.3) * cos(ndc.y * 3.1 - 0.4));
  vec2 d = max(p - h, 0.0) / max(soft, vec2(1e-3));
  float t = clamp(length(d), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}
/** 1 where the scene is free, 0 under the page's words. */
float quietAt(vec2 ndc) {
  return min(min(quietOne(uQuietA, ndc), quietOne(uQuietB, ndc)), min(quietOne(uQuietC, ndc), quietOne(uQuietD, ndc)));
}
`;

export const DUST_VERTEX = /* glsl */ `
uniform float uExag, uPixelRatio, uFocal, uIntro, uVeil, uPointerOn, uAspect, uLodK, uAlpha, uSize, uShadeGamma, uShadeFlat, uRidge, uMaxPx, uMinPx, uNear, uAmbient, uGlint, uQuietFloor, uAreaLand, uAreaOut;
uniform vec2 uPointer, uFog;
uniform vec3 uMoon;
uniform vec4 uKindGain;
uniform vec4 uKindKeep;
// THE LAND IS THE PAPER, NOT THE SUBJECT. uLowAlt is 0 when the camera is far from its subject (the
// establishing shots, where the region is one shape and the contours are a fine texture) and 1 when
// it is close (a county, a chapter), where a 20 m contour becomes a wide white rope and the homes
// vanish between the ropes. At 1 each kind of grain keeps only uKindLow of its brightness: the
// ordinary contours all but go, the index contours and the shoreline stay, so the land still reads
// as land and the lights lead. uContourKm + uCrowd thin the contours wherever they CROWD on screen
// (steep ground, or far away): below uCrowd.x css pixels apart they are gone, which is where the
// moire comb on the Catskills and in the Highlands gorge came from.
uniform vec4 uKindLow;
uniform float uLowAlt, uContourKm;
uniform vec2 uCrowd;
uniform float uFocus, uFocusMix;
attribute vec2 aSlope;
attribute float aSeed, aRidge, aKind, aCounty;
varying float vA;
varying float vSize;
__QUIET__
void main() {
  vec3 p = vec3(position.x, position.y * uExag, position.z);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float d = -mv.z;
  vec3 n = normalize(vec3(-uExag * aSlope.x, 1.0, uExag * aSlope.y));
  // LEVEL OF DETAIL: keep about uLodK / d^2 of the grains, weighted by how squarely the ground
  // faces the camera, so the dust holds a steady density ON SCREEN from the foreground to the
  // horizon instead of piling into a white band where the land is seen edge-on. A grain's seed
  // decides whether it survives, so the survivors do not flicker as the camera moves.
  // Far away the map simplifies the way a printed one does: the index contours and the shoreline
  // outlast the ordinary contours, which outlast the fill (uKindKeep weights each kind's share).
  vec3 toCam = normalize(cameraPosition - p);
  float facing = max(abs(dot(n, toCam)), 0.08);
  float kindKeep = aKind < 0.5 ? uKindKeep.x : aKind < 1.5 ? uKindKeep.y : aKind < 2.5 ? uKindKeep.z : uKindKeep.w;
  float keep = uLodK * kindKeep * facing / max(d * d, 1e-4);
  // How far apart this grain's contour and its neighbour land ON SCREEN: the elevation interval
  // divided by the ground's slope, projected. Index contours stand five intervals apart.
  float crowd = 1.0;
  if (aKind > 0.5 && aKind < 2.5) {
    float sepKm = (uContourKm / max(length(aSlope), 1e-4)) * (aKind > 1.5 ? 5.0 : 1.0);
    crowd = smoothstep(uCrowd.x, uCrowd.y, sepKm * uFocal / max(d, 1e-4) / uPixelRatio);
    keep *= crowd;
  }
  if (d < 0.02 || aSeed > keep) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vA = 0.0;
    vSize = 1.0;
    return;
  }
  // MOONLIGHT: a hillshade relative to flat ground, a gamma that deepens the shadows, and the
  // crests lifted (hollows dimmed) by the local relief.
  float lit = max(dot(n, uMoon), 0.0) / max(uMoon.y, 0.05);
  float shade = uShadeFlat * (uAmbient + (1.0 - uAmbient) * pow(lit, uShadeGamma)) * (1.0 + uRidge * aRidge);
  shade = clamp(shade, 0.0, 2.0);
  // Fog to black far away, and a softer fade close to the lens, so the eye rests on the shot's
  // subject rather than on grains sliding past the camera.
  float fog = (1.0 - smoothstep(uFog.x, uFog.y, d)) * smoothstep(uNear * 0.35, uNear, d);
  float intro = smoothstep(0.0, 1.0, (uIntro - aSeed * 0.55) / 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 dp = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
  float lantern = uPointerOn * exp(-dot(dp, dp) * 22.0);
  // Size: the grain's SHEEN is its world size (so neighbouring grains overlap into a lit surface
  // at any distance), floored at a couple of pixels and capped (fill rate). Its CORE is a fixed
  // ~1.3 px spark, drawn in the fragment shader: the dust's grain.
  float px = uSize * uFocal / d;
  vSize = clamp(px, uMinPx * uPixelRatio, uMaxPx * uPixelRatio);
  // A few grains in a hundred are GLINTS: brighter, a touch larger, the way frost catches the moon.
  float glint = step(aSeed, uGlint);
  vSize *= 1.0 + 0.6 * glint;
  float kind = aKind < 0.5 ? uKindGain.x : aKind < 1.5 ? uKindGain.y : aKind < 2.5 ? uKindGain.z : uKindGain.w;
  float kindLow = aKind < 0.5 ? uKindLow.x : aKind < 1.5 ? uKindLow.y : aKind < 2.5 ? uKindLow.z : uKindLow.w;
  kind *= mix(1.0, kindLow, uLowAlt);
  // AREA FOCUS: the land of the county the page is on comes up, the rest goes to near black, so
  // which area the page is showing is never in doubt. uAreaLand is how far the SUBJECT's own ground
  // steps back (the lights lead in every chapter); uAreaOut is how far everything else does.
  // Measured, round 54, builder 3: the white spaghetti over Ulster and Orange was the shoreline
  // grain — every stream and lake edge in the Catskills, at 2.4x its usual gain this close in —
  // and almost all of it lies OUTSIDE the county's own homes, so no change to the subject's land
  // ever touched it. The rest of the map has to fall much further than a twentieth for a chapter
  // over empty country to read as one county rather than as a contour drawing.
  float focus = mix(1.0, abs(aCounty - uFocus) < 0.5 ? 0.95 * uAreaLand : uAreaOut, uFocusMix);
  vA = uAlpha * kind * shade * fog * fog * intro * focus * (1.0 - 0.94 * uVeil) * (1.0 + 0.9 * lantern) * (1.0 + 1.6 * glint) * mix(uQuietFloor, 1.0, quietAt(clip.xy / clip.w));
  gl_PointSize = vSize;
  gl_Position = clip;
}
`.replace("__QUIET__", QUIET);

export const DUST_FRAGMENT = /* glsl */ `
uniform float uPixelRatio, uCore, uSheen;
varying float vA;
varying float vSize;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c) * 4.0;
  if (r2 > 1.0) discard;
  // Two components: a tight spark (the grain) and a wide faint sheen (the surface it belongs to).
  float rpx = sqrt(r2) * 0.5 * vSize / uPixelRatio;
  float core = exp(-rpx * rpx * 1.6);
  float sheen = exp(-r2 * 3.0) * (1.0 - r2);
  float a = (uCore * core + uSheen * sheen) * vA;
  // Silver: white with the faintest lean away from the lights' warmth. Not blue.
  gl_FragColor = vec4(vec3(0.9, 0.91, 0.93) * a, 1.0);
}
`;

export const LIGHT_VERTEX = /* glsl */ `
uniform float uExag, uPixelRatio, uFocal, uIntro, uVeil, uPointerOn, uAspect, uTime, uSize, uAlpha, uTwinkle, uSpread, uFocus, uFocusMix, uQuietFloor, uAreaGain, uLampVary;
// The counterpart of the dust's uLowAlt. Close in, the picture's dynamic range is stretched from
// BOTH ends: a home standing on its own in the valley carries more of the frame (uLowGain), and a
// home in a block of five hundred carries less (uLowCity), so Ulster never reads as empty and
// Queens never reads as one saturated flare. aGain is already tone-mapped by how many homes share
// a light's few hundred metres, so it is the measure of how alone this one stands.
uniform float uLowAlt, uLowGain, uLowCity;
uniform vec2 uPointer, uFog;
attribute float aDelay, aGain, aSeed, aCounty;
varying float vA;
varying float vCore;
varying float vWarm;
__QUIET__
void main() {
  vec3 p = vec3(position.x, position.y * uExag, position.z);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float d = -mv.z;
  // Each window comes on at its own moment, slow then quick.
  float on = clamp((uIntro - aDelay) / 0.45, 0.0, 1.0);
  on = on * on * (3.0 - 2.0 * on);
  // A few windows breathe, each on its own clock (mouse devices only: uTwinkle).
  float tw = 1.0 - uTwinkle * 0.4 * step(0.95, aSeed) * (0.5 + 0.5 * sin(uTime * (0.5 + aSeed) + aSeed * 57.0));
  float fog = 1.0 - smoothstep(uFog.x * 1.25, uFog.y * 1.3, d);
  vec4 clip = projectionMatrix * mv;
  vec2 dp = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
  float lantern = uPointerOn * exp(-dot(dp, dp) * 30.0);
  // The sprite is a lamp: a hot core of the light's world size (floored at ~1.3 px) inside a soft
  // halo four times as wide. A far light is a spark with a breath of glow; a near one a soft lamp.
  float lone = clamp(aGain * 1.25, 0.0, 1.0);
  float presence = mix(1.0, mix(uLowCity, uLowGain, lone * lone), uLowAlt);
  // EVERY LAMP IS NOT THE SAME LAMP (round 54, builder 3). Close up the city was one bead stamped
  // fifteen thousand times. Two draws from the light's own seed, decorrelated from the one that
  // decides which windows breathe: how wide its bulb is, and how hard it burns. The pair is
  // energy-preserving on purpose — burn carries a 1/bulb, so a lamp's FLUX (burn x bulb^2) keeps
  // the mean the tone-mapping set, and a borough is exactly as bright as it was. What changes is
  // that the same patch of city now holds lamps of several sizes and two shades of warm.
  float s1 = fract(sin(aSeed * 91.37 + 3.1) * 43758.5453);
  float s2 = fract(sin(aSeed * 27.13 + 8.7) * 24634.6345);
  float bulb = mix(1.0, (0.74 + 0.63 * s1 * s1) / 0.95, uLampVary);
  float burn = mix(1.0, (0.70 + 0.60 * s2) / bulb, uLampVary);
  vWarm = mix(0.5, s1 * 0.85 + s2 * 0.15, uLampVary);
  // AREA FOCUS: while the page is on one county, its homes burn a little brighter and the rest of
  // the map's fall back, so the area reads as a shape of light. uAreaGain lifts the SPARSE
  // counties, where the same shot holds a tenth of the lamps (round 54: Ulster, Orange and Putnam
  // arrived as contour drawings). It never adds a light; it only decides how hard one burns.
  float inFocus = abs(aCounty - uFocus) < 0.5 ? 1.0 : 0.0;
  float lift = mix(1.0, uAreaGain, inFocus * uFocusMix);
  float core = max(uSize * bulb * pow(lift, 0.4) * mix(1.0, mix(0.9, 1.8, lone * lone), uLowAlt) * uFocal / d, 1.3 * uPixelRatio);
  float size = min(core * uSpread, 34.0 * uPixelRatio);
  vCore = core / size;
  float energy = clamp(uSize * uFocal / d / (1.3 * uPixelRatio), 0.35, 1.0);
  float focus = mix(1.0, mix(0.09, 1.6, inFocus), uFocusMix) * pow(lift, 0.6);
  vA = uAlpha * presence * aGain * burn * on * tw * fog * energy * focus * (1.0 - 0.9 * uVeil) * (1.0 + 0.55 * lantern) * mix(uQuietFloor, 1.0, quietAt(clip.xy / clip.w));
  gl_PointSize = size * (1.0 + 0.15 * lantern) * (1.0 + 0.3 * inFocus * uFocusMix);
  gl_Position = clip;
}
`.replace("__QUIET__", QUIET);

export const LIGHT_FRAGMENT = /* glsl */ `
uniform float uHalo;
varying float vA;
varying float vCore;
varying float vWarm;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c) * 2.0;
  if (r > 1.0) discard;
  // Core: a tight pale-gold disc of the light's own size. Halo: an amber breath that falls to
  // nothing at the sprite's rim. Where many overlap the red channel saturates first, so the city
  // goes pale gold, never white.
  // vWarm is the lamp's own shade, from its seed: sodium at one end, a colder porch LED at the
  // other. Both are still warm white — the lights stay the only warm tone on the page — but a
  // street of them no longer reads as one colour stamped repeatedly.
  float k = r / max(vCore, 0.02);
  float core = exp(-k * k * 2.2);
  float halo = exp(-r * r * 5.5) * (1.0 - r) * uHalo;
  vec3 hot = mix(vec3(1.0, 0.845, 0.60), vec3(1.0, 0.925, 0.795), vWarm);
  vec3 col = hot * core + vec3(1.0, 0.66, 0.34) * halo;
  gl_FragColor = vec4(col * vA, 1.0);
}
`;

export const HAZE_VERTEX = /* glsl */ `
uniform float uExag, uFocal, uPixelRatio, uIntro, uVeil, uHaze, uHazeSize, uNear, uHazeLow, uHazeHigh, uFocusMix, uAspect, uQuietFloor;
uniform vec2 uFog;
attribute float aStrength;
varying float vA;
__QUIET__
void main() {
  vec3 p = vec3(position.x, position.y * uExag, position.z);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float d = -mv.z;
  float fog = 1.0 - smoothstep(uFog.x * 1.2, uFog.y * 1.3, d);
  float on = smoothstep(0.6, 2.6, uIntro);
  float px = uHazeSize * uFocal / d;
  float size = min(px, 420.0 * uPixelRatio);
  // The glow is seen from high above: it thins away as the camera comes down into it (the camera's
  // height in world km, uHazeLow to uHazeHigh), and when the eye runs along the ground, where a row
  // of patches would stack into a bank of fog on the horizon.
  float down = -normalize(p - cameraPosition).y;
  // While one county is lit the glow of the cities outside it settles back with their windows (the
  // patches carry no county of their own, so the whole haze eases down together).
  // The glow is the widest thing in the picture, so it is also the one most likely to sit behind a
  // sentence; it takes the same quiet as the windows under it (round 54, builder 3: it did not,
  // and a city's breath behind the count sentence was a grey wash nobody could design around).
  vec4 clip = projectionMatrix * mv;
  vA = uHaze * aStrength * fog * on * (1.0 - 0.92 * uVeil) * (1.0 - 0.75 * uFocusMix) * smoothstep(uHazeLow, uHazeHigh, cameraPosition.y) * smoothstep(0.12, 0.45, down) * mix(uQuietFloor, 1.0, quietAt(clip.xy / clip.w));
  gl_PointSize = size;
  gl_Position = clip;
}
`.replace("__QUIET__", QUIET);

export const HAZE_FRAGMENT = /* glsl */ `
varying float vA;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c) * 4.0;
  if (r2 > 1.0) discard;
  float a = exp(-r2 * 3.2) * (1.0 - r2) * vA;
  // Near neutral, a breath warm: the windows' light scattered in the air above them.
  gl_FragColor = vec4(vec3(0.62, 0.55, 0.47) * a, 1.0);
}
`;

/** Depth only: the coarse terrain that hides what is behind a ridge, sunk a little under the dust. */
export const DEPTH_VERTEX = /* glsl */ `
uniform float uExag, uSink;
void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y * uExag - uSink, position.z, 1.0); }
`;
export const DEPTH_FRAGMENT = /* glsl */ `
void main() { gl_FragColor = vec4(0.0); }
`;
