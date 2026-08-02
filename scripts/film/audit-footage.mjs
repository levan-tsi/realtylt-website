// Build a frame grid for every clip so somebody can LOOK at it before it ships.
//
// WHY THIS EXISTS. The owner watched the films and caught, in one shot, a laptop that is silver
// in the first frame and space-grey a second later, a second laptop sitting on the same table,
// and a lid closing the wrong way round. None of that is visible in a single still, none of it is
// detectable by any measurement in this repo, and the clip had already been cut into a finished
// film and pushed to production.
//
// Generated footage fails in ways that only a SEQUENCE reveals: objects change colour or identity
// between frames, hands gain or lose fingers mid-gesture, a second copy of the hero prop appears
// in the background, text hallucinates onto a surface. A contact sheet at one frame per second is
// the cheapest way to see all of it at once.
//
// This does not judge anything. It makes the frames; a human or an agent with eyes reads them and
// decides. That division is the point: there is no measurement that can replace looking, so the
// tool's whole job is to make looking fast.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/audit-footage.mjs              # every clip in the library
//   node scripts/film/audit-footage.mjs shot10       # one, by name prefix
import { spawnSync } from "node:child_process";
import { readdirSync, mkdirSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const FOOTAGE = "scripts/film/footage";
const OUT = "docs/blog-flagship/footage-audit";
const COLS = 4;
const ROWS = 3;
const CELL = 440;

mkdirSync(OUT, { recursive: true });

const only = process.argv[2];
const clips = readdirSync(FOOTAGE)
  .filter((f) => f.endsWith(".mp4"))
  .filter((f) => !only || f.startsWith(only))
  .sort((a, b) => (+(a.match(/\d+/) ?? [0])[0]) - (+(b.match(/\d+/) ?? [0])[0]));

if (!clips.length) { console.error(`no clips matching "${only}"`); process.exit(1); }

/** xstack needs an explicit layout: column offsets are the widths to the left, row offsets are
 *  the heights above, and every term has to reference a real input index. */
const layout = () => {
  const cells = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const c = i % COLS, r = Math.floor(i / COLS);
    const x = c === 0 ? "0" : Array.from({ length: c }, (_, k) => `w${k}`).join("+");
    const y = r === 0 ? "0" : Array.from({ length: r }, (_, k) => `h${k * COLS}`).join("+");
    cells.push(`${x}_${y}`);
  }
  return cells.join("|");
};

for (const clip of clips) {
  const src = `${FOOTAGE}/${clip}`;
  const probe = spawnSync(ffmpegPath, ["-i", src], { encoding: "utf8" }).stderr || "";
  const m = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const dur = m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 10;

  const n = COLS * ROWS;
  // Sample across the WHOLE clip, inset slightly so the last cell is not the final black frame.
  const times = Array.from({ length: n }, (_, i) => +(0.15 + (i * (dur - 0.4)) / (n - 1)).toFixed(2));

  const args = [];
  for (const t of times) args.push("-ss", String(t), "-i", src);
  const chain =
    times.map((_, i) => `[${i}:v]scale=${CELL}:-1,drawtext=text='${times[i]}s':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.5[v${i}]`).join(";") +
    ";" + times.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${n}:layout=${layout()}[o]`;
  args.push("-filter_complex", chain, "-map", "[o]", "-frames:v", "1", "-y",
    `${OUT}/${clip.replace(/\.mp4$/, "")}.png`);

  const r = spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 64e6 });
  console.log(`${r.status === 0 ? "ok  " : "FAIL"} ${clip.padEnd(28)} ${dur.toFixed(2)}s  ${times[0]}s -> ${times.at(-1)}s`);
  if (r.status !== 0) console.error((r.stderr || "").slice(-500));
}

console.log(`\n${clips.length} sheet(s) -> ${OUT}/   READ THEM. Nothing here judges the footage.`);
