// Assembles the LEAD QUALIFICATION film: b-roll bed, transparent type layer, LT narration.
//
// NOTHING IS SPLICED. Each narrated line is an independent input placed at an absolute offset
// with adelay, so the assembly physically cannot clip a tail. That was the fault the owner heard
// in the first ffmpeg-mixed film, and it is structurally impossible here rather than patched.
//
// ONE ENCODE GENERATION for the shipped file. The picture is composited straight from
// bg.mp4 plus the lossless PNG overlay into the file that ships, with no intermediate master to
// re-encode. Both earlier films went master then web copy because they were authored at 1920 and
// shipped at 1280; this one is authored at its native 1280x720, so a separate master would be
// the same pixels through one more lossy pass.
//
// THE BITRATE IS THE ONE REAL DIFFERENCE from the earlier films. They were mostly flat dark
// graphics, which h264 compresses to almost nothing (the voice film is 1.3MB for 45s). This one
// is real moving footage: leaves, water, steam, shallow depth of field. CRF 23 lands it in the
// same range as the chat film rather than at four times the size, and the player is preload=none
// with a poster, so a reader who scrolls past downloads none of it.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/qualify/assemble.mjs
import { spawnSync } from "node:child_process";
import { readFileSync, mkdirSync, statSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";
import { sched, FILM_LEN, FADE, FADE_AT, LAST_WORD } from "./cut.mjs";
import { buildBed } from "../bed.mjs";

const V = "scripts/_scratch-video";
const DIR = `${V}/qualify-vo`;
const FRAMES = `${V}/qualify-frames`;
const BG = `${V}/qualify-bg/bg.mp4`;
const PUB = "public/video";
const CRF = 23;

mkdirSync(PUB, { recursive: true });

const run = (args, tag) => {
  const r = spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 64e6 });
  if (r.status !== 0) {
    console.error(`FFMPEG FAIL [${tag}]\n` + (r.stderr || "").slice(-1800));
    process.exit(1);
  }
  return r.stderr || "";
};
const mb = (p) => (statSync(p).size / 1048576).toFixed(1) + "MB";

// 1) the voice track: every line an independent input at its own absolute offset
const inputs = sched.flatMap((s) => ["-i", `${DIR}/line${s.i}.mp3`]);
const delays = sched
  .map((s, k) => `[${k}:a]aresample=48000,adelay=${Math.round(s.start * 1000)}|${Math.round(s.start * 1000)}[d${k}]`)
  .join(";");
const mix =
  sched.map((_, k) => `[d${k}]`).join("") +
  `amix=inputs=${sched.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,` +
  `atrim=0:${FILM_LEN},asetpts=PTS-STARTPTS[vo]`;
// This file was copied from the reactivation film and, until 2026-08-01, still wrote its voice
// track to vo-reactivation.wav. It shipped the right audio purely because it overwrote that file
// immediately before reading it back - but running this script silently destroyed the other
// film's intermediate, and any change to the order would have put the wrong narration on the
// wrong film. The paths are this topic's now.
run([...inputs, "-filter_complex", `${delays};${mix}`, "-map", "[vo]", "-ac", "1", "-ar", "48000",
  "-y", `${V}/vo-qualify.wav`], "vo-mix");
console.log(`vo track: ${mb(`${V}/vo-qualify.wav`)}`);

// 1b) the sound bed, derived from the same PLAN the picture is cut from, then summed under the
//     voice. The voice is loudnorm'd to -16 LUFS ABOVE, before the bed is added, so the bed
//     cannot drag the narration's level around: the mix is a sum, not a second normalisation.
const bed = await buildBed("qualify");
run(["-i", `${V}/vo-qualify.wav`, "-i", bed,
  "-filter_complex", `[0:a][1:a]amix=inputs=2:normalize=0,atrim=0:${FILM_LEN},asetpts=PTS-STARTPTS[a]`,
  "-map", "[a]", "-ac", "1", "-ar", "48000", "-y", `${V}/mix-qualify.wav`], "bed-mix");
console.log(`mixed:   ${mb(`${V}/mix-qualify.wav`)}`);

// 2) the film that ships: footage under type, in one pass
run(["-i", BG, "-framerate", "30", "-i", `${FRAMES}/f%05d.png`, "-i", `${V}/mix-qualify.wav`,
  "-filter_complex", `[0:v][1:v]overlay=0:0:format=auto,fade=t=out:st=${FADE_AT}:d=${FADE}[v]`,
  "-map", "[v]", "-map", "2:a",
  "-c:v", "libx264", "-crf", String(CRF), "-preset", "slow", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
  "-y", `${PUB}/film-qualify.mp4`], "film");
console.log(`film:   ${mb(`${PUB}/film-qualify.mp4`)}`);

// 3) the poster IS frame zero, composited the same way. The hook number is the whole reason
//    anybody presses play, so the still the player shows must be the frame the film opens on.
run(["-i", BG, "-i", `${FRAMES}/f00000.png`,
  "-filter_complex", "[0:v]trim=end_frame=1,setpts=PTS-STARTPTS[b];[b][1:v]overlay=0:0",
  "-frames:v", "1", "-q:v", "3", "-y", `${PUB}/film-qualify-poster.jpg`], "poster");
console.log(`poster: ${mb(`${PUB}/film-qualify-poster.jpg`)}`);

// 4) prove the gaps are deliberate beats rather than clipped tails.
//    On the VOICE-ONLY track on purpose: once the bed is under it there is no silence anywhere in
//    the film by design, so pointing silencedetect at the mix would report nothing and prove
//    nothing. Intelligibility of the finished mix is answered by scripts/film/verify-audio.mjs.
const det = run(["-i", `${V}/vo-qualify.wav`, "-af", "silencedetect=n=-38dB:d=0.25", "-f", "null", "-"], "silence");
const marks = [...det.matchAll(/silence_(start|end): ([\d.]+)/g)].map((m) => `${m[1]}@${(+m[2]).toFixed(2)}`);
console.log(`\nsilence: ${marks.join(" ")}`);
console.log("\nscheduled line boundaries:");
for (const s of sched) console.log(`  ${s.start.toFixed(2)} -> ${s.end.toFixed(2)}`);
