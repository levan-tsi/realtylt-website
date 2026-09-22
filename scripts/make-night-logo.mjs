// Round 53: the logo for blue-hour surfaces. Same artwork as public/logo-realtylt.png; the navy
// strokes (#0f2e53, invisible on the night ground) become moonlight #e8eef6 and the porchlight R
// is left exactly as it is. Decided per pixel by hue: the R blue is bright and saturated, the
// navy is dark, and the anti-aliased edges keep their own alpha, so nothing is re-drawn.
// Usage: node scripts/make-night-logo.mjs
import sharp from "sharp";
const src = "public/logo-realtylt.png";
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let navy = 0, blue = 0;
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a === 0) continue;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum < 90) { data[i] = 0xe8; data[i + 1] = 0xee; data[i + 2] = 0xf6; navy++; } else blue++;
}
await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile("public/logo-realtylt-night.png");
console.log(`recoloured ${navy} navy px, kept ${blue} blue px, ${info.width}x${info.height}`);
