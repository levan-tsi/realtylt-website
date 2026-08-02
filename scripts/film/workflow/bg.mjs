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
import { FPS, W, H, FILM_LEN, PLAN } from "./cut.mjs";

const FOOTAGE = "scripts/film/footage";
const OUT = "scripts/_scratch-video/workflow-bg";

mkdirSync(OUT, { recursive: true });
const run = (args, tag) => {
  const r = spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 64e6 });
  if (r.status !== 0) {
    console.error(`FFMPEG FAIL [${tag}]\n` + (r.stderr || "").slice(-1600));
    process.exit(1);
  }
  return r.stderr || "";
};

// TRANSITIONS, DERIVED FROM THE PLAN RATHER THAN LISTED SEPARATELY.
//
// The brief was "design them, do not just crossfade everything", and that is the right
// instruction: a dissolve between two unrelated generated clips is the single most slideshow-like
// thing a cut can do. So there is a grammar, and it comes from what each beat's NEIGHBOURS are:
//
//   footage -> black   the picture falls away, so the footage fades down into the card.
//   black -> footage   the picture returns, so the footage fades up out of the card.
//   footage -> footage a HARD CUT, always. Two real shots meeting is correct film grammar and
//                      needs no help; softening it is what makes a reel look like a wedding video.
//
// In this film every footage beat happens to be separated by a black card, so the vocabulary
// resolves to dips and lifts and there is no dissolve anywhere. That is the plan being honest
// about itself, not a limitation.
//
// TWO BOUNDARIES ARE DELIBERATELY EXEMPT, and both would be bugs if they were not:
//   - The FIRST beat never fades up. The poster is frame zero, and the hook number is the reason
//     anybody presses play, so frame zero has to be the picture rather than a black frame the
//     fade has not finished leaving yet.
//   - The LAST beat never fades down here, because assemble.mjs already fades the whole film at
//     FADE_AT. Doing both would darken the close twice over.
const DIP = 0.35;

let t = 0;
const parts = [];
PLAN.forEach(({ beat, clip, in: inPoint, from, to, why }, i) => {
  const dur = +(to - from).toFixed(3);
  if (Math.abs(from - t) > 0.005) throw new Error(`beat ${beat} starts at ${from} but the cut is at ${t}`);
  const seg = `${OUT}/seg${parts.length}.mp4`;
  const prev = PLAN[i - 1], next = PLAN[i + 1];
  const lift = clip && prev && !prev.clip && i > 0;          // arriving out of a black card
  const dip = clip && next && !next.clip;                     // leaving into a black card
  const moves = [lift && "lift", dip && "dip"].filter(Boolean).join("+") || "cut";

  if (clip) {
    const src = `${FOOTAGE}/${clip}.mp4`;
    if (!existsSync(src)) throw new Error(`missing footage: ${src}`);
    const fades = [
      lift ? `fade=t=in:st=0:d=${DIP}` : null,
      dip ? `fade=t=out:st=${(dur - DIP).toFixed(3)}:d=${DIP}` : null,
    ].filter(Boolean).join(",");
    // -ss before -i is the fast seek; re-encoding to a common 30fps profile is what makes the
    // concat safe. setsar=1 matters: a mismatched aspect ratio makes concat refuse.
    run(["-ss", String(inPoint), "-t", String(dur), "-i", src,
      "-vf", `fps=${FPS},scale=${W}:${H}:flags=lanczos,setsar=1${fades ? "," + fades : ""},format=yuv420p`,
      "-an", "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-y", seg], beat);
  } else {
    run(["-f", "lavfi", "-i", `color=c=black:s=${W}x${H}:r=${FPS}:d=${dur}`,
      "-vf", "setsar=1,format=yuv420p", "-c:v", "libx264", "-crf", "14", "-preset", "medium",
      "-y", seg], beat);
  }
  console.log(`${String(t.toFixed(2)).padStart(6)} -> ${(t + dur).toFixed(2).padStart(6)}  ${beat.padEnd(26)} ${(clip ?? "(black)").padEnd(22)} ${(clip ? moves : "-").padEnd(9)} ${why}`);
  parts.push(seg);
  t += dur;
});

// concat via the demuxer: no re-encode of the segments, so the picture is encoded exactly once
// before the overlay pass.
const list = `${OUT}/list.txt`;
writeFileSync(list, parts.map((p) => `file '${p.split("/").pop()}'`).join("\n"));
run(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-y", `${OUT}/bg.mp4`], "concat");

const mb = (p) => (statSync(p).size / 1048576).toFixed(1) + "MB";
console.log(`\nbg.mp4: ${mb(`${OUT}/bg.mp4`)}  total ${t.toFixed(2)}s @ ${FPS}fps ${W}x${H}  (FILM_LEN ${FILM_LEN})`);
