// ElevenLabs VO for the AI-VOICE-AGENTS film, in the owner's cloned voice (LT).
//
// NODE, not Python, unlike the chat film's gen11.py. The `python` launcher on this machine was
// taking minutes to run a one-line script during this session, and a VO generator is not worth
// debugging an interpreter for. Node is already the render harness's language, `--use-system-ca`
// handles the AVG TLS interception the same way truststore did, and ffmpeg-static is already on
// disk for the measuring pass.
//
// ORDER MATTERS: this runs BEFORE the stage is built. The handoff's rule one is that shot
// lengths are DERIVED FROM THE VOICE, never guessed, so we generate the lines, measure them, and
// emit a schedule the stage is then cut to. Retiming a stage to a real person's voice is correct.
// Speeding up a real person's voice is not.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/voice/vo.mjs [--keep]
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const LT = "7AxhG2AEa5XhwSrAudqY"; // the owner's clone; he confirmed it is his.
const OUT = "scripts/_scratch-video/voice-vo";
const keep = process.argv.includes("--keep");

// The hook rule (r/NewTubers 349-video study): open with a CONCRETE, CHECKABLE number that pays
// off the promise. No atmosphere, no warmup. The seven-times figure is the page's own cited
// statistic (HBR 2011 / Oldroyd, 1.25M leads), and "get them on the phone" is a fair plain
// reading of that study's own definition of qualifying a lead: a meaningful conversation with a
// key decision maker. Nothing here claims a capability the service page does not already claim.
const LINES = [
  "Reach a lead within the hour, and you are seven times likelier to get them on the phone.",
  "But it is nine forty two on a Sunday, and you are at dinner.",
  "Four rings, then voicemail. Nobody leaves a message any more.",
  "They call the next agent.",
  "This is the voice that answers instead. It says it is an assistant, and that the call is recorded.",
  "It answers from your listings. What it cannot verify, it will not guess.",
  "It books from your real calendar, and writes the whole call to your C R M.",
  "Keep the next one. Realty L T dot com, slash A I.",
];

// Headroom after each line. A beat, not a dropout: in a sound-off feed the caption IS the
// script, so these gaps are only where a shot is allowed to land, never where the words stop.
const GAP = [0.55, 0.45, 0.3, 0.75, 0.5, 0.5, 0.7];
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
  console.log(`${s.start.toFixed(2).padStart(6)} -> ${s.end.toFixed(2).padStart(6)}  (${s.dur.toFixed(2)}s)  ${s.text.slice(0, 60)}`);
}
console.log(`\nLAST WORD ENDS AT ${sched.at(-1).end.toFixed(2)}s`);
