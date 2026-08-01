// Background plate for the WORKFLOW AUTOMATION film: the b-roll cut, with no overlay on it.
//
// WHY THE FILM IS TWO LAYERS. Putting the clips inside the HTML stage and seeking a <video> per
// frame means the bundled Chromium has to decode H.264 (it often cannot) and every frame depends
// on a seek completing before the screenshot fires. Compositing in ffmpeg instead is
// deterministic: this script builds the picture bed, render.mjs draws the type on transparent
// PNGs, and assemble.mjs lays one over the other. Nothing can land on a stale video frame.
//
// NOTHING IS UPSCALED. Every clip is natively 1280x720, so the whole film is authored at
// 1280x720 and the shipped file is the master.
//
// THE CUTS ARE THE MEASURED LINE BOUNDARIES, read out of schedule.json rather than typed in.
// The previous three films copied the numbers across by hand, which works right up until a line
// is re-recorded and one of the three files is not updated. Here the boundaries are DERIVED, so
// a re-run of vo.mjs re-cuts the picture automatically and the two cannot drift.
//
// FOUR OF THE NINE BEATS ARE BLACK, and they alternate with the footage rather than sitting next
// to each other. Three of them are held CARDS (the by-hand log, the wired chain, the rule) and a
// list of timed rows or a six node spine in hairline type does not survive a sunlit kitchen
// underneath it. The fourth is the moment the picture deliberately falls away and the hook number
// is the only thing left on screen.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/workflow/bg.mjs
import { spawnSync } from "node:child_process";
import { mkdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";
import { FPS, W, H, gapEnd, FILM_LEN } from "./cut.mjs";

const FOOTAGE = "scripts/film/footage";
const OUT = "scripts/_scratch-video/workflow-bg";

/** [beat, clip or null for black, in-point, from, to, what the shot is doing here].
 *  `from`/`to` are FILM times taken from the schedule; the segment length follows. */
const PLAN = [
  ["A1 the hook, on the desk", "shot7-signup-callback", 0.4, 0, 4.4, "the laptop and the phone the whole article is about"],
  ["A2 the number alone", null, 0, 4.4, gapEnd(0), "black: the picture falls away and 25 is all that is left"],
  ["B1 nobody sees it", "shot2-empty-office", 1.0, gapEnd(0), gapEnd(1), "the office the form lands in, at night, empty"],
  ["B2 the same lead by hand", null, 0, gapEnd(1), gapEnd(2), "black, because four timed rows only read on black"],
  ["B3 forty times a month", "shot5-morning-ring", 0.6, gapEnd(2), gapEnd(3), "sunrise: the morning it finally gets read"],
  ["D  the chain, wired", null, 0, gapEnd(3), gapEnd(4), "black: a six node spine in hairline type needs it"],
  ["E  answered on the site", "shot3-reply-glow", 0.4, gapEnd(4), gapEnd(5), "the reply already on their phone"],
  ["F  the rule", null, 0, gapEnd(5), gapEnd(6), "black: the one line in this film worth remembering"],
  ["G  the close", "shot6-keys-porch", 0.31, gapEnd(6), FILM_LEN, "keys changing hands on a porch"],
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
for (const [beat, clip, inPoint, from, to, why] of PLAN) {
  const dur = +(to - from).toFixed(3);
  if (Math.abs(from - t) > 0.005) throw new Error(`beat ${beat} starts at ${from} but the cut is at ${t}`);
  const seg = `${OUT}/seg${parts.length}.mp4`;
  if (clip) {
    const src = `${FOOTAGE}/${clip}.mp4`;
    if (!existsSync(src)) throw new Error(`missing footage: ${src}`);
    // -ss before -i is the fast seek; re-encoding to a common 30fps profile is what makes the
    // concat safe. setsar=1 matters: a mismatched aspect ratio makes concat refuse.
    run(["-ss", String(inPoint), "-t", String(dur), "-i", src,
      "-vf", `fps=${FPS},scale=${W}:${H}:flags=lanczos,setsar=1,format=yuv420p`,
      "-an", "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-y", seg], beat);
  } else {
    run(["-f", "lavfi", "-i", `color=c=black:s=${W}x${H}:r=${FPS}:d=${dur}`,
      "-vf", "setsar=1,format=yuv420p", "-c:v", "libx264", "-crf", "14", "-preset", "medium",
      "-y", seg], beat);
  }
  console.log(`${String(t.toFixed(2)).padStart(6)} -> ${(t + dur).toFixed(2).padStart(6)}  ${beat.padEnd(26)} ${(clip ?? "(black)").padEnd(22)} ${why}`);
  parts.push(seg);
  t += dur;
}

// concat via the demuxer: no re-encode of the segments, so the picture is encoded exactly once
// before the overlay pass.
const list = `${OUT}/list.txt`;
writeFileSync(list, parts.map((p) => `file '${p.split("/").pop()}'`).join("\n"));
run(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-y", `${OUT}/bg.mp4`], "concat");

const mb = (p) => (statSync(p).size / 1048576).toFixed(1) + "MB";
console.log(`\nbg.mp4: ${mb(`${OUT}/bg.mp4`)}  total ${t.toFixed(2)}s @ ${FPS}fps ${W}x${H}  (FILM_LEN ${FILM_LEN})`);
