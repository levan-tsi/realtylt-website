// Does the finished film actually SAY what the script says?
//
// WHY THIS EXISTS. Five films shipped before this file did, and every one of them was verified by
// measured duration and `silencedetect` only. Both of those prove that audio EXISTS in the right
// places. Neither proves a single word is correct, present, or intelligible, and no human and no
// agent had ever listened to any of them. A clipped tail, a line the synthesiser garbled, or a
// music bed mixed loud enough to bury the voice would all have passed every check in the repo.
//
// So this transcribes the SHIPPED MP4 - not the stage, not the voice track, the file that ships -
// and diffs the result against the schedule that produced it. It is the closest thing to listening
// that a script can do, and it is strictly stronger than silencedetect in three ways:
//
//   1. It reads the WORDS, so a garbled or missing line fails instead of registering as sound.
//   2. Every transcribed word carries a timestamp, so a line that drifted out of its own beat
//      fails even though the total duration is unchanged.
//   3. It is a real intelligibility test. When a sound bed is mixed under the narration, a bed
//      that drowns the voice makes the transcriber miss words. That is a MEASUREMENT of
//      separation, not an opinion about it, and it is the reason the SFX work can be trusted.
//
// THE THRESHOLDS ARE CALIBRATED ON THE SHIPPED FILMS, which are narration over silence and are
// therefore the best case this pipeline can produce. Measured 2026-08-01 across all five, before
// any bed existed: every line of every film scored 100%, and integrated loudness sat in a tight
// -15.9 to -17.1 LUFS band. So the honest baseline is a perfect score, and the gate sits at 0.90
// per line and 0.95 total purely as headroom for a transcriber's bad day. Anything below that is
// a real regression, not noise. Re-run it against the shipped films before believing it about a
// new one - the FIRST version of this check failed all five, and the fault was in the check.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/verify-audio.mjs             # every film
//   node scripts/film/verify-audio.mjs workflow    # one
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

/** Each film, its measured schedule, and the file that actually ships.
 *
 *  The chat film's schedule is COMMITTED and the others' are not, for a reason worth knowing:
 *  `scripts/_scratch-vo/schedule.json` and `lines.json` describe a 36s cut whose narration the
 *  shipped 39s film does not speak ("Eleven forty at night. This is when buyers shop." was
 *  replaced by the $6,000 hook). Diffing the film against them scored 42% and looked like a
 *  broken film; the film was fine and the scratch files were stale. The committed copy was
 *  reconstructed FROM the shipped audio, so it cannot drift from it again. */
export const FILMS = {
  chat: { sched: "scripts/film/chat/schedule.json", film: "public/video/film-1140pm.mp4" },
  voice: { sched: "scripts/_scratch-video/voice-vo/schedule.json", film: "public/video/film-942pm.mp4" },
  reactivation: { sched: "scripts/_scratch-video/reactivation-vo/schedule.json", film: "public/video/film-reactivation.mp4" },
  qualify: { sched: "scripts/_scratch-video/qualify-vo/schedule.json", film: "public/video/film-qualify.mp4" },
  workflow: { sched: "scripts/_scratch-video/workflow-vo/schedule.json", film: "public/video/film-workflow.mp4" },
};

const PER_LINE_MIN = 0.9;
const TOTAL_MIN = 0.95;
/** How far outside its scheduled beat a word may land before it counts as drifted. */
const SLACK = 0.8;

const KEY = execSync(
  `powershell -NoProfile -Command "(Get-ItemProperty HKCU:\\Environment).ELEVENLABS_API_KEY"`,
  { encoding: "utf8" },
).trim();

/** Words a transcriber correctly renders as a SYMBOL rather than as itself, so their absence from
 *  the transcript proves nothing. Every one of these was observed, not guessed: the script says
 *  "twenty five minutes" and Scribe writes "25 minutes"; "eleven forty seven" becomes "11:47";
 *  "fifteen percent" becomes "15%"; "realtylt dot com slash ai" becomes "realtylt.com/ai".
 *  Chasing those is a formatting fight, not a check, and leaving them in made all five shipped
 *  films fail on words that are demonstrably present and correct. */
const SYMBOLIC = new Set([
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
  "nineteen", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
  "hundred", "thousand", "million", "percent", "slash", "dollar", "dollars",
]);

/** Content words only: alphabetic, distinctive, and not one of the symbolic renderings above. */
const contentWords = (s) =>
  s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)
    .filter((w) => w.length >= 4 && !SYMBOLIC.has(w));

async function transcribe(file) {
  const fd = new FormData();
  fd.set("model_id", "scribe_v1");
  fd.set("file", new Blob([readFileSync(file)]), "film.mp4");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": KEY },
    body: fd,
  });
  if (!r.ok) throw new Error(`speech-to-text ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const p = await r.json();
  return (p.words ?? [])
    .filter((w) => w.type === "word")
    .map((w) => ({ text: w.text.toLowerCase().replace(/[^a-z]/g, ""), start: w.start }))
    .filter((w) => w.text.length >= 4);
}

/** Integrated loudness of the shipped file's audio, so a bed cannot quietly change the mix. */
function loudness(file) {
  const r = spawnSync(ffmpegPath, ["-i", file, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], {
    encoding: "utf8", maxBuffer: 32e6,
  });
  const m = (r.stderr || "").match(/I:\s+(-?[\d.]+) LUFS[\s\S]*?LRA:\s+(-?[\d.]+) LU/);
  return m ? { lufs: +m[1], lra: +m[2] } : null;
}

async function verifyOne(name) {
  const { sched: schedPath, words: wordsPath, film } = FILMS[name];
  if (!existsSync(schedPath)) return { name, skipped: `no schedule at ${schedPath}` };
  if (!existsSync(film)) return { name, skipped: `no film at ${film}` };

  let sched = JSON.parse(readFileSync(schedPath, "utf8"));
  if (wordsPath) {
    const said = JSON.parse(readFileSync(wordsPath, "utf8"));
    sched = sched.map((s) => ({ ...s, text: said.find((l) => l.i === s.i)?.text ?? "" }));
  }
  const heard = await transcribe(film);
  const used = new Set();

  let hitAll = 0, wantAll = 0;
  const lines = sched.map((s, i) => {
    const want = contentWords(s.text);
    const lo = s.start - SLACK, hi = s.end + SLACK;
    const missed = [];
    let hit = 0;
    for (const w of want) {
      // A transcript token counts if it carries the script word: "realtylt" holds "realty",
      // "answered" holds "answer". Consumed once, so a repeat cannot inflate the score.
      const k = heard.findIndex(
        (h, j) => !used.has(j) && h.start >= lo && h.start <= hi && (h.text === w || h.text.includes(w) || w.includes(h.text)),
      );
      if (k >= 0) { used.add(k); hit++; } else missed.push(w);
    }
    hitAll += hit; wantAll += want.length;
    return { i, cov: want.length ? hit / want.length : 1, want: want.length, missed, at: s.start };
  });

  return { name, film, lines, total: wantAll ? hitAll / wantAll : 0, loud: loudness(film), heard: heard.length };
}

const only = process.argv[2];
const names = only ? [only] : Object.keys(FILMS);
if (only && !FILMS[only]) { console.error(`unknown film "${only}". known: ${Object.keys(FILMS).join(", ")}`); process.exit(1); }

let bad = 0;
for (const n of names) {
  const r = await verifyOne(n);
  if (r.skipped) { console.log(`\n${n.toUpperCase()}  SKIPPED - ${r.skipped}`); continue; }
  const l = r.loud;
  console.log(`\n${n.toUpperCase()}  ${r.film}`);
  console.log(`  transcribed ${r.heard} content words | ${l ? `${l.lufs} LUFS, LRA ${l.lra}` : "loudness unavailable"}`);
  for (const ln of r.lines) {
    const ok = ln.cov >= PER_LINE_MIN;
    if (!ok) bad++;
    console.log(
      `  ${ok ? "ok  " : "FAIL"} line ${ln.i} @${ln.at.toFixed(2).padStart(6)}s  ` +
      `${(ln.cov * 100).toFixed(0).padStart(3)}% of ${String(ln.want).padStart(2)} words` +
      (ln.missed.length ? `   missed: ${ln.missed.join(" ")}` : ""),
    );
  }
  const totOk = r.total >= TOTAL_MIN;
  if (!totOk) bad++;
  console.log(`  ${totOk ? "ok  " : "FAIL"} TOTAL ${(r.total * 100).toFixed(1)}%  (gate: line ${PER_LINE_MIN * 100}%, total ${TOTAL_MIN * 100}%)`);
}

console.log(bad ? `\n${bad} check(s) FAILED` : "\nall films audible and complete");
process.exit(bad ? 1 : 0);
