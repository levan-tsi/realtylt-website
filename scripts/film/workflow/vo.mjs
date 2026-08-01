// ElevenLabs VO for the WORKFLOW AUTOMATION film, in the owner's cloned voice (LT).
//
// ORDER MATTERS: this runs BEFORE the stage and before the background cut. The rule the last
// three films established is that shot lengths are DERIVED FROM THE VOICE, never guessed, so we
// generate the lines, MEASURE them off the real files, and emit a schedule that both the stage
// and the b-roll cut are then built against. Retiming a stage to a real person's voice is
// correct. Speeding up a real person's voice is not.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/workflow/vo.mjs [--keep]
//
// The key is a Windows USER env var and a running shell does not inherit a fresh setx:
//   export ELEVENLABS_API_KEY=$(powershell -NoProfile -Command "(Get-ItemProperty HKCU:\\Environment).ELEVENLABS_API_KEY")
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const LT = "7AxhG2AEa5XhwSrAudqY"; // the owner's clone; he confirmed it is his.
const OUT = "scripts/_scratch-video/workflow-vo";
const keep = process.argv.includes("--keep");

// The hook rule (r/NewTubers 349-video study): open with a CONCRETE, CHECKABLE number that pays
// off the promise. No atmosphere, no warmup. Both numbers in this film are on the page and both
// were read in the source: 25 minutes 26 seconds is Mark, Gonzalez and Harris (CHI 2005), and
// "one time in twenty" is the inverse of Zapier's documented 95-percent-in-7-days auto-pause.
//
// NO ACRONYMS. An earlier draft had "types the name into the CRM", which a text-to-speech model
// may read as a word rather than as letters, and there is no way to hear the result without
// listening to every take. The line says "the system" instead and loses nothing.
const LINES = [
  "The typing takes ninety seconds. Getting back to what you were doing took twenty five minutes.",
  "A form arrives at eleven forty seven. Nobody sees it until morning.",
  "Then somebody retypes the name into the system. Now there are two of them.",
  "Eight steps. Twelve minutes. Spread over three days. Forty times a month.",
  "Wired, it is one chain. Matched, checked, answered, routed, calendared.",
  "Nobody woke up. Nobody typed. It was answered while they were still on the site.",
  "Now the part nobody mentions. A chain that fails one time in twenty stays switched on.",
  "So log every run, and make every failure shout. Realty L T dot com, slash A I.",
];

// Headroom after each line. A beat, not a dropout: in a sound-off feed the caption IS the
// script, so these gaps are only where a shot is allowed to land, never where the words stop.
// The gap after line 6 is the longest in the cut on purpose: it is the one line in this film
// worth remembering, and it should be allowed to sit there.
const GAP = [0.6, 0.45, 0.45, 0.7, 0.5, 0.55, 0.9];
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
