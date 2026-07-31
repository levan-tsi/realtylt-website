// Mixes real B-roll into the VOICE film.
//
// The film as rendered is entirely typographic: light text on near-black, no imagery anywhere
// (its video track is only 121 kb/s, which is the tell). That reads as clean on the sparse beats
// and as thin over 45 seconds.
//
// The mix is a LIGHTEN blend, not a cut. Because the stage background is near-black and the type
// is light, `max(film, broll * k)` keeps every glyph at full strength while the dead background
// fills with a darkened image. The text never loses contrast, which a straight cross-dissolve
// would have cost.
//
// WHERE it is applied is the whole design:
//   - the opening stat and the 9:42 clock get imagery, because they are one number on a black field
//   - "They call the next agent." stays pure black, because that line is the punch
//   - the teardown transcript stays pure black, because it is dense text and legibility wins
//   - the closing CTA gets imagery, so the film lands on a picture instead of a title card
//
// Audio is stream-copied. The cut, its timings and the narration are untouched.
//
// Usage: node scripts/film/voice/broll.mjs [--probe]
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const FFMPEG = path.resolve("node_modules/ffmpeg-static/ffmpeg.exe");
const FILM = "public/video/film-942pm.mp4";
const OUT = "public/video/film-942pm.mp4";
const TMP = "public/video/_film-942pm-broll.mp4";
const FOOTAGE = "C:/Users/Levan/realtylt-stories/public/footage";

/** start/dur are positions in the FILM; from is the in-point inside the source clip.
 *  gain is how far the darkened image is allowed to come up under the type. */
const BEATS = [
  // The 7x stat. An office nobody is sitting in, behind the number that says answer the phone.
  { clip: "shot2-empty-office.mp4", start: 0.0, dur: 7.6, from: 1.5, gain: 0.34 },
  // 9:42 on a Sunday. The dark kitchen and the phone lying on the counter.
  { clip: "shot1-1140pm-lead.mp4", start: 8.2, dur: 7.4, from: 1.2, gain: 0.32 },
  // The close. Keys on the porch under "Keep the next one." Lowest gain of the three: this is the
  // only beat carrying a URL, the shot has a sun flare in it, and a washed CTA is a wasted ending.
  { clip: "shot6-keys-porch.mp4", start: 39.4, dur: 5.6, from: 3.4, gain: 0.24 },
];

const FADE = 0.7; // seconds, each edge - a hard in on a ghosted image reads as a glitch

for (const b of BEATS) {
  const p = path.join(FOOTAGE, b.clip);
  if (!existsSync(p)) throw new Error(`missing B-roll: ${p}`);
}

// Build one underlay: black for the whole film, with each darkened clip faded in at its beat.
const inputs = BEATS.flatMap((b) => ["-i", path.join(FOOTAGE, b.clip)]);
const chains = BEATS.map((b, i) => {
  // cover 1280x720, pull the colour down and the level way down so it reads as atmosphere rather
  // than as footage, then fade both edges and delay into position on the film clock.
  //
  // DESATURATE + DARKEN LUMA, never colorchannelmixer. That filter takes TWELVE parameters
  // (rr:rg:rb:ra:gr:gg:gb:ga:br:bg:bb:ba); feeding it a 3x3 silently misassigns the channels and
  // the first cut of this came out entirely violet - the exact palette the house rules ban.
  return (
    `[${i}:v]trim=start=${b.from}:duration=${b.dur},setpts=PTS-STARTPTS,` +
    `scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,` +
    // Chroma is pulled toward neutral (128) in the SAME pass as luma. Darkening luma alone leaves
    // chroma at full strength, so what survives is disproportionately coloured and the warm shots
    // came back magenta. Near-monochrome is also the site's established photography rule.
    `lutyuv=y=val*${b.gain.toFixed(3)}:u=128+(val-128)*0.22:v=128+(val-128)*0.22,` +
    `fade=t=in:st=0:d=${FADE}:alpha=0,fade=t=out:st=${(b.dur - FADE).toFixed(2)}:d=${FADE}:alpha=0,` +
    `setpts=PTS+${b.start}/TB[b${i}]`
  );
});

let last = "[base]";
const overlays = BEATS.map((b, i) => {
  const out = i === BEATS.length - 1 ? "[under]" : `[o${i}]`;
  const chain = `${last}[b${i}]overlay=0:0:eof_action=pass:enable='between(t,${b.start},${(b.start + b.dur).toFixed(2)})'${out}`;
  last = out;
  return chain;
});

const filter = [
  `color=c=black:s=1280x720:r=30:d=45[base]`,
  ...chains,
  ...overlays,
  // Composite the FILM OVER the footage, keyed on the film's own luma, rather than lighten-blending
  // the two together.
  //
  // Lighten takes the per-channel max, which quietly contaminates coloured type: the accent is
  // azure (low red), so any warmer pixel behind it lifts red and drags the colour toward magenta.
  // Measured on the CTA: V chroma moved 125.0 to 130.0, i.e. past neutral into red. That is the
  // violet tell the house palette bans, arrived at by accident.
  //
  // Keying on luma instead means a text pixel is 100% film and a background pixel is 100% footage,
  // so the accent colour is bit-for-bit what the stage rendered. Threshold at 45 because the stage
  // background sits near Y=15 and the type is well above 200.
  `[3:v]split=2[fg][key]`,
  `[key]format=gray,lut=y='if(gt(val,45),min(255,(val-45)*6),0)'[alpha]`,
  `[fg]format=yuva420p[fgy]`,
  `[fgy][alpha]alphamerge[fgk]`,
  `[under][fgk]overlay=0:0:format=auto[v]`,
].join(";");

const args = [
  "-hide_banner", "-loglevel", "error", "-y",
  ...inputs,
  "-i", FILM,
  "-filter_complex", filter,
  "-map", "[v]", "-map", "3:a?",
  "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p",
  "-c:a", "copy",
  TMP,
];

console.log("mixing B-roll into the voice film...");
execFileSync(FFMPEG, args, { stdio: ["ignore", "inherit", "inherit"] });

if (process.argv.includes("--probe")) {
  console.log(`wrote ${TMP} (probe mode: original left in place)`);
} else {
  execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-i", TMP, "-c", "copy", OUT]);
  console.log(`wrote ${OUT}`);
}
