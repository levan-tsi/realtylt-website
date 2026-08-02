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
import { FPS, W, H, FILM_LEN, PLAN } from "./cut.mjs";
import { fadeChain, moves } from "../beats.mjs";

const FOOTAGE = "scripts/film/footage";
const OUT = "scripts/_scratch-video/reactivation-bg";


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
PLAN.forEach(({ beat, clip, in: inPoint, dur, srcEnd, why }, i) => {
  const seg = `${OUT}/seg${parts.length}.mp4`;
  if (clip) {
    const src = `${FOOTAGE}/${clip}.mp4`;
    if (!existsSync(src)) throw new Error(`missing footage: ${src}`);
    // `srcEnd` is the last SECOND OF THE SOURCE that is usable — the point where a generated
    // clip breaks (a cut to an unrelated scene, a melting prop, an identity flip). When it is
    // set, the shorter usable span is stretched with setpts to fill the beat the narration
    // needs, so a defect can be cut out without moving a single beat boundary. setpts has to
    // come BEFORE fps: retiming first and resampling second yields real CFR output, whereas
    // the other order leaves a stream whose effective rate is no longer FPS.
    const span = srcEnd === undefined ? dur : +(srcEnd - inPoint).toFixed(3);
    if (span <= 0) throw new Error(`${beat}: srcEnd ${srcEnd} is not after in ${inPoint}`);
    const retime = srcEnd === undefined ? "" : `setpts=${(dur / span).toFixed(6)}*PTS,`;
    const fades = fadeChain(PLAN, i, dur);
    run(["-ss", String(inPoint), "-t", String(span), "-i", src,
      "-vf", `${retime}fps=${FPS},scale=${W}:${H}:flags=lanczos,setsar=1${fades ? "," + fades : ""},format=yuv420p`,
      "-an", "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-y", seg], beat);
  } else {
    run(["-f", "lavfi", "-i", `color=c=black:s=${W}x${H}:r=${FPS}:d=${dur}`,
      "-vf", "setsar=1,format=yuv420p", "-c:v", "libx264", "-crf", "14", "-preset", "medium",
      "-y", seg], beat);
  }
  console.log(`${String(t.toFixed(2)).padStart(6)} -> ${(t + dur).toFixed(2).padStart(6)}  ${beat.padEnd(30)} ${(clip ?? "(black)").padEnd(22)} ${(clip ? moves(PLAN, i).label : "-").padEnd(9)} ${why}`);
  parts.push(seg);
  t += dur;
});

// concat via the demuxer: no re-encode of the segments, so the picture is encoded exactly once
// before the overlay pass.
const list = `${OUT}/list.txt`;
writeFileSync(list, parts.map((p) => `file '${p.split("/").pop()}'`).join("\n"));
run(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-y", `${OUT}/bg.mp4`], "concat");

const mb = (p) => (statSync(p).size / 1048576).toFixed(1) + "MB";
console.log(`\nbg.mp4: ${mb(`${OUT}/bg.mp4`)}  total ${t.toFixed(2)}s @ ${FPS}fps ${W}x${H}`);
