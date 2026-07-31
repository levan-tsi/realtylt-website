// ElevenLabs VO for the DATABASE REACTIVATION film, in the owner's cloned voice (LT).
//
// ORDER MATTERS: this runs BEFORE the stage and before the background cut. The rule the last two
// films established is that shot lengths are DERIVED FROM THE VOICE, never guessed, so we
// generate the lines, MEASURE them off the real files, and emit a schedule that both the stage
// and the b-roll cut are then built against. Retiming a stage to a real person's voice is
// correct. Speeding up a real person's voice is not.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/reactivation/vo.mjs [--keep]
//
// The key is a Windows USER env var and a running shell does not inherit a fresh setx:
//   export ELEVENLABS_API_KEY=$(powershell -NoProfile -Command "(Get-ItemProperty HKCU:\\Environment).ELEVENLABS_API_KEY")
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const LT = "7AxhG2AEa5XhwSrAudqY"; // the owner's clone; he confirmed it is his.
const OUT = "scripts/_scratch-video/reactivation-vo";
const keep = process.argv.includes("--keep");

// The hook rule (r/NewTubers 349-video study): open with a CONCRETE, CHECKABLE number that pays
// off the promise. No atmosphere, no warmup. The two-thirds figure is the page's own cited
// statistic (NAR 2025 Home Buyers and Sellers Generational Trends, Exhibit 7-1: 38% referred by a
// friend, neighbor or relative plus 28% who used the agent previously). The three-month figure is
// 47 CFR 64.1200(f)(5), quoted on the page. Nothing here claims a capability the service page
// does not already claim.
const LINES = [
  "Two thirds of sellers hire an agent they already knew, or the one a friend sent them.",
  "Every one of them asked somebody a question first. Some of them asked you.",
  "In twenty twenty three. And nobody has called them since.",
  "This is what works the list you already paid for.",
  "It checks the date first. An inquiry gives you three months under the do not call rules.",
  "Then it opens with what that person actually asked about, and it follows the answer.",
  "Most still say no, and it writes down why. The few who are ready get booked.",
  "The cheapest appointment you will book this month. Realty L T dot com, slash A I.",
];

// Headroom after each line. A beat, not a dropout: in a sound-off feed the caption IS the
// script, so these gaps are only where a shot is allowed to land, never where the words stop.
const GAP = [0.6, 0.4, 0.8, 0.45, 0.7, 0.45, 0.65];
const LEAD_IN = 0.35;

const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("ELEVENLABS_API_KEY is not in the environment");
mkdirSync(OUT, { recursive: true });

/** Duration in seconds, measured off the real file rather than estimated from the text. */
function measure(file) {
  const r = spawnSync(ffmpegPath, ["-i", file], { encoding: "utf8", maxBuffer: 32e6 });
  const m = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(r.stderr || "");
  if (!m) throw new Error(`could not measure ${file}`);
  return +m[1] * 3600 + +m[2] * 60 + +m[3];
}

for (let i = 0; i < LINES.length; i++) {
  const file = `${OUT}/line${i}.mp3`;
  if (keep && existsSync(file)) continue;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${LT}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        text: LINES[i],
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 },
      }),
    },
  );
  if (!res.ok) throw new Error(`line${i}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`line${i} generated`);
}

const sched = [];
let t = LEAD_IN;
for (let i = 0; i < LINES.length; i++) {
  const dur = measure(`${OUT}/line${i}.mp3`);
  sched.push({ i, start: +t.toFixed(2), dur: +dur.toFixed(2), end: +(t + dur).toFixed(2), text: LINES[i] });
  t += dur + (GAP[i] ?? 0);
}
writeFileSync(`${OUT}/schedule.json`, JSON.stringify(sched, null, 1));

for (const s of sched) {
  console.log(`${s.start.toFixed(2).padStart(6)} -> ${s.end.toFixed(2).padStart(6)}  (${s.dur.toFixed(2)}s)  ${s.text.slice(0, 62)}`);
}
console.log(`\nLAST WORD ENDS AT ${sched.at(-1).end.toFixed(2)}s`);
