// Background plate for the DATABASE REACTIVATION film: the b-roll cut, with no overlay on it.
//
// WHY THE FILM IS TWO LAYERS. The first two films were entirely rendered stages, so one
// screenshot pass produced the finished frame. This one uses real footage, and there are two
// ways to combine the two. Putting the clips inside the HTML stage and seeking a <video> per
// frame means the bundled Chromium has to decode H.264 (it often cannot) and every frame
// depends on a seek completing before the screenshot fires. Compositing in ffmpeg instead is
// deterministic: this script builds the picture bed, render.mjs draws the type on transparent
// PNGs, and assemble.mjs lays one over the other. Nothing can land on a stale video frame.
//
// NOTHING IS UPSCALED. Every clip is natively 1280x720, so the whole film is authored at
// 1280x720 and the shipped file is the master. Blowing 720p footage up to 1080 to match the
// previous films would have cost real detail for a resolution nobody sees: the web copies of
// both earlier films are 1280x720 anyway.
//
// THE CUTS ARE THE MEASURED LINE BOUNDARIES. Every segment start below is a beat from
// scripts/_scratch-video/reactivation-vo/schedule.json, so the picture changes where the voice
// changes rather than on a guessed rhythm.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/reactivation/bg.mjs
import { spawnSync } from "node:child_process";
import { mkdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const FOOTAGE = "scripts/film/footage";
const OUT = "scripts/_scratch-video/reactivation-bg";
const FPS = 30;
const W = 1280;
const H = 720;

/** [beat, clip or null for black, in-point, out-point, what the shot is doing here].
 *  `null` is a deliberate black bed: the three-month card is the one moment in the film that
 *  asks the viewer to stop and read a regulation, and footage under it would be noise. */
const PLAN = [
  ["A  hook, the two-thirds stat", "shot4-hudson-aerial", 0.0, 6.9, "the valley, wide and calm, under the number"],
  ["B1 the inquiry, back then", "shot1-1140pm-lead", 0.6, 5.8, "a phone lighting up on a counter at night"],
  ["B2 and nobody called", "shot2-empty-office", 0.0, 8.0, "the office where the follow-up did not happen"],
  ["D  the three-month clock", null, 0, 8.35, "black, so the regulation is the only thing on screen"],
  ["E  the opener", "shot3-reply-glow", 0.5, 6.4, "a reply glowing on a screen"],
  ["F  the outcome", "shot5-morning-ring", 0.9, 7.0, "morning, and the phone is ringing the other way"],
  ["G  the close", "shot6-keys-porch", 1.85, 10.0, "keys changing hands on a porch"],
];

mkdirSync(OUT, { recursive: true });
const run = (args, tag) => {
  const r = spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 64e6 });
  if (r.status !== 0) {
    console.error(`FFMPEG FAIL [${tag}]\n` + (r.stderr || "").slice(-1600));
    process.exit(1);
  }
  return r.stderr || "";
};

let t = 0;
const parts = [];
for (const [beat, clip, from, to, why] of PLAN) {
  const dur = +(to - from).toFixed(3);
  const seg = `${OUT}/seg${parts.length}.mp4`;
  if (clip) {
    const src = `${FOOTAGE}/${clip}.mp4`;
    if (!existsSync(src)) throw new Error(`missing footage: ${src}`);
    // -ss before -i is the fast seek; re-encoding to a common 30fps CBR-ish profile is what
    // makes the concat safe. setsar=1 matters: a mismatched aspect ratio makes concat refuse.
    run(["-ss", String(from), "-t", String(dur), "-i", src,
      "-vf", `fps=${FPS},scale=${W}:${H}:flags=lanczos,setsar=1,format=yuv420p`,
      "-an", "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-y", seg], beat);
  } else {
    run(["-f", "lavfi", "-i", `color=c=black:s=${W}x${H}:r=${FPS}:d=${dur}`,
      "-vf", "setsar=1,format=yuv420p", "-c:v", "libx264", "-crf", "14", "-preset", "medium",
      "-y", seg], beat);
  }
  console.log(`${String(t.toFixed(2)).padStart(6)} -> ${(t + dur).toFixed(2).padStart(6)}  ${beat.padEnd(30)} ${clip ?? "(black)"}  ${why}`);
  parts.push(seg);
  t += dur;
}

// concat via the demuxer: no re-encode of the segments, so the picture is encoded exactly once
// before the overlay pass.
const list = `${OUT}/list.txt`;
writeFileSync(list, parts.map((p) => `file '${p.split("/").pop()}'`).join("\n"));
run(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-y", `${OUT}/bg.mp4`], "concat");

const mb = (p) => (statSync(p).size / 1048576).toFixed(1) + "MB";
console.log(`\nbg.mp4: ${mb(`${OUT}/bg.mp4`)}  total ${t.toFixed(2)}s @ ${FPS}fps ${W}x${H}`);
