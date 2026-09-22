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
 */

export const DUST_VERTEX = /* glsl */ `
uniform float uExag, uPixelRatio, uFocal, uIntro, uVeil, uPointerOn, uAspect, uLodK, uAlpha, uSize, uShadeGamma, uShadeFlat, uRidge, uMaxPx, uNear, uAmbient, uGlint;
uniform vec2 uPointer, uFog;
uniform vec3 uMoon;
uniform vec4 uKindGain;
uniform vec4 uKindKeep;
attribute vec2 aSlope;
attribute float aSeed, aRidge, aKind;
varying float vA;
varying float vSize;
// QUIET ZONES: up to two screen rectangles (NDC: x0, y0, x1, y1) where the page's words sit. The
// scene dims under them, easing back to full over uQuietSoft (NDC height units), so a headline never
// has a bright contour through a letter. The integration measures the real text boxes.
uniform vec4 uQuietA, uQuietB;
uniform float uQuietSoft, uQuietFloor;
float quietAt(vec2 ndc) {
  vec2 a = max(max(uQuietA.xy - ndc, ndc - uQuietA.zw), 0.0) * vec2(uAspect, 1.0);
  vec2 b = max(max(uQuietB.xy - ndc, ndc - uQuietB.zw), 0.0) * vec2(uAspect, 1.0);
  float da = uQuietA.z > uQuietA.x ? length(a) : 1e3;
  float db = uQuietB.z > uQuietB.x ? length(b) : 1e3;
  float t = clamp(min(da, db) / max(uQuietSoft, 1e-3), 0.0, 1.0);
  return mix(uQuietFloor, 1.0, t * t * (3.0 - 2.0 * t));
}
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
  vSize = clamp(px, 2.0 * uPixelRatio, uMaxPx * uPixelRatio);
  // A few grains in a hundred are GLINTS: brighter, a touch larger, the way frost catches the moon.
  float glint = step(aSeed, uGlint);
  vSize *= 1.0 + 0.6 * glint;
  float kind = aKind < 0.5 ? uKindGain.x : aKind < 1.5 ? uKindGain.y : aKind < 2.5 ? uKindGain.z : uKindGain.w;
  vA = uAlpha * kind * shade * fog * fog * intro * (1.0 - 0.8 * uVeil) * (1.0 + 0.9 * lantern) * (1.0 + 1.6 * glint) * quietAt(clip.xy / clip.w);
  gl_PointSize = vSize;
  gl_Position = clip;
}
`;

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
uniform float uExag, uPixelRatio, uFocal, uIntro, uVeil, uPointerOn, uAspect, uTime, uSize, uAlpha, uTwinkle, uSpread;
uniform vec2 uPointer, uFog;
attribute float aDelay, aGain, aSeed;
varying float vA;
varying float vCore;
// QUIET ZONES: up to two screen rectangles (NDC: x0, y0, x1, y1) where the page's words sit. The
// scene dims under them, easing back to full over uQuietSoft (NDC height units), so a headline never
// has a bright contour through a letter. The integration measures the real text boxes.
uniform vec4 uQuietA, uQuietB;
uniform float uQuietSoft, uQuietFloor;
float quietAt(vec2 ndc) {
  vec2 a = max(max(uQuietA.xy - ndc, ndc - uQuietA.zw), 0.0) * vec2(uAspect, 1.0);
  vec2 b = max(max(uQuietB.xy - ndc, ndc - uQuietB.zw), 0.0) * vec2(uAspect, 1.0);
  float da = uQuietA.z > uQuietA.x ? length(a) : 1e3;
  float db = uQuietB.z > uQuietB.x ? length(b) : 1e3;
  float t = clamp(min(da, db) / max(uQuietSoft, 1e-3), 0.0, 1.0);
  return mix(uQuietFloor, 1.0, t * t * (3.0 - 2.0 * t));
}
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
  float core = max(uSize * uFocal / d, 1.3 * uPixelRatio);
  float size = min(core * uSpread, 34.0 * uPixelRatio);
  vCore = core / size;
  float energy = clamp(uSize * uFocal / d / (1.3 * uPixelRatio), 0.35, 1.0);
  vA = uAlpha * aGain * on * tw * fog * energy * (1.0 - 0.65 * uVeil) * (1.0 + 0.55 * lantern) * mix(1.0, quietAt(clip.xy / clip.w), 0.8);
  gl_PointSize = size * (1.0 + 0.15 * lantern);
  gl_Position = clip;
}
`;

export const LIGHT_FRAGMENT = /* glsl */ `
uniform float uHalo;
varying float vA;
varying float vCore;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c) * 2.0;
  if (r > 1.0) discard;
  // Core: a tight pale-gold disc of the light's own size. Halo: an amber breath that falls to
  // nothing at the sprite's rim. Where many overlap the red channel saturates first, so the city
  // goes pale gold, never white.
  float k = r / max(vCore, 0.02);
  float core = exp(-k * k * 2.2);
  float halo = exp(-r * r * 5.5) * (1.0 - r) * uHalo;
  vec3 col = vec3(1.0, 0.88, 0.68) * core + vec3(1.0, 0.66, 0.34) * halo;
  gl_FragColor = vec4(col * vA, 1.0);
}
`;

export const HAZE_VERTEX = /* glsl */ `
uniform float uExag, uFocal, uPixelRatio, uIntro, uVeil, uHaze, uHazeSize, uNear;
uniform vec2 uFog;
attribute float aStrength;
varying float vA;
void main() {
  vec3 p = vec3(position.x, position.y * uExag, position.z);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float d = -mv.z;
  float fog = 1.0 - smoothstep(uFog.x * 1.2, uFog.y * 1.3, d);
  float on = smoothstep(0.6, 2.6, uIntro);
  float px = uHazeSize * uFocal / d;
  float size = min(px, 420.0 * uPixelRatio);
  // The glow is seen from above: it thins away as the camera comes down into it, and when the eye
  // runs along the ground, where a row of patches would stack into a bank of fog on the horizon.
  float down = -normalize(p - cameraPosition).y;
  vA = uHaze * aStrength * fog * on * (1.0 - 0.7 * uVeil) * smoothstep(uNear * 1.5, uNear * 5.0, d) * smoothstep(0.12, 0.45, down);
  gl_PointSize = size;
  gl_Position = projectionMatrix * mv;
}
`;

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
