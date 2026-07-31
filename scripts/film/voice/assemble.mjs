// Assembles the AI-voice-agents film from the lossless frame sequence + the LT narration.
//
// NOTHING IS SPLICED. Each line is an independent input placed at an absolute offset with
// adelay, so the assembly physically cannot clip a tail. That was the fault the owner heard in
// the first ffmpeg-mixed film, and it is now structurally impossible rather than patched.
//
// ONE ENCODE GENERATION for the master: it is built straight from the PNGs, not from an
// intermediate. The web copy is the only re-encode, at crf 18 rather than 20, because crf 20
// was measurably crushing the dark frames on the last film and the owner read that as "dimmed".
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/voice/assemble.mjs
import { spawnSync } from "node:child_process";
import { readFileSync, mkdirSync, statSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const V = "scripts/_scratch-video";
const DIR = `${V}/voice-vo`;
const FRAMES = "scripts/_scratch-video/voice-frames";
const OUT = "scripts/_scratch-video";
const PUB = "public/video";
const sched = JSON.parse(readFileSync(`${DIR}/schedule.json`, "utf8"));

const FILM_LEN = 45.0;   // last word lands at 43.66; the rest is the hold
const FADE_AT = 44.5;    // 0.5s to black

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
run([...inputs, "-filter_complex", `${delays};${mix}`, "-map", "[vo]", "-ac", "1", "-ar", "48000",
  "-y", `${V}/vo-voice.wav`], "vo-mix");
console.log(`vo track: ${mb(`${V}/vo-voice.wav`)}`);

// 2) the 1080p master, straight from the PNG sequence
run(["-framerate", "30", "-i", `${FRAMES}/f%05d.png`, "-i", `${V}/vo-voice.wav`,
  "-vf", `fade=t=out:st=${FADE_AT}:d=0.5`,
  "-map", "0:v", "-map", "1:a",
  "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
  "-y", `${OUT}/voice-master-1080.mp4`], "master");
console.log(`master: ${mb(`${OUT}/voice-master-1080.mp4`)}`);

// 3) the web copy that actually ships
run(["-i", `${OUT}/voice-master-1080.mp4`, "-vf", "scale=1280:720",
  "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
  "-y", `${PUB}/film-942pm.mp4`], "web");
console.log(`web:    ${mb(`${PUB}/film-942pm.mp4`)}`);

// 4) the poster IS frame zero. The hook number is the whole reason anybody stops scrolling, so
//    the still the player shows before play must be the same frame the film opens on.
run(["-i", `${FRAMES}/f00000.png`, "-vf", "scale=1280:720", "-q:v", "3",
  "-y", `${PUB}/film-942pm-poster.jpg`], "poster");
console.log(`poster: ${mb(`${PUB}/film-942pm-poster.jpg`)}`);

// 5) prove the gaps are deliberate beats rather than clipped tails
const det = run(["-i", `${V}/vo-voice.wav`, "-af", "silencedetect=n=-38dB:d=0.25", "-f", "null", "-"], "silence");
const marks = [...det.matchAll(/silence_(start|end): ([\d.]+)/g)].map((m) => `${m[1]}@${(+m[2]).toFixed(2)}`);
console.log(`\nsilence: ${marks.join(" ")}`);
console.log("\nscheduled line boundaries:");
for (const s of sched) console.log(`  ${s.start.toFixed(2)} -> ${s.end.toFixed(2)}`);
