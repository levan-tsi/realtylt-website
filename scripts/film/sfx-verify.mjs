// Prove each generated sound is what the ledger claims it is.
//
// WHY THIS IS NOT OPTIONAL. Nobody on this project can listen. The prompts all say "no music, no
// voices", but a prompt is a request, not a result: sound generation will happily put a synth pad
// under an "ambience", or a murmur of speech under a "quiet office", and either one would be
// mixed underneath a narrated film and shipped without a single person noticing. So every claim
// the ledger makes is measured instead of trusted.
//
// The three things that would actually ruin a bed, and how each is caught:
//
//   SPEECH      Transcribe it. A bed that yields any words has voices in it. This is the same
//               Scribe pass verify-audio.mjs uses, pointed at the opposite question: there we
//               demand every word, here we demand none.
//   AN EVENT    A bed is supposed to be unchanging, and a door slam inside one reads as a mistake
//               in the mix. Momentary loudness is sampled across the whole file; a steady bed
//               holds a narrow range, a bed with an event in it spikes.
//   MUSIC       Spectral flatness separates noise from tone. Room tone is broadband and flat;
//               a melody or a synth pad concentrates energy into partials and reads far lower.
//
// Events ("hit") are held to the INVERSE standard: a notification that does not spike is not a
// notification. Same measurements, opposite expectations, which is why one script covers both.
//
// THE THRESHOLDS ARE MEASURED, NOT GUESSED. See CALIBRATION below for the numbers this library
// actually produced; the gates sit outside the observed spread, so a future take has to be
// genuinely different to fail.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/sfx-verify.mjs
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";
import { SFX } from "./sfx-gen.mjs";

const DIR = "scripts/film/sfx";

// CALIBRATION, measured across this library 2026-08-01. Printed by this script, so re-run it
// after any --force regeneration and move the gates only with the new numbers in hand.
const BED_SPREAD_MAX = 12;     // dB of p95 over p50 before a bed counts as eventful
const BED_EVENTS_MIN = 6;      // ...and eventful is only OK if the events RECUR (texture, not a slam)
// CALIBRATED AGAINST DELIBERATELY GENERATED MUSIC, because a threshold picked by intuition was
// wrong: 0.06 rejected an air-conditioner bed, which is tonal for an honest reason. Two negative
// controls were generated and measured - an ambient music pad with a chord progression (flatness
// 0.0099) and a sustained synth drone (0.0134). Every real bed in this library, including the
// tonal one, measured 0.0455 or higher. So music is a factor of three away and the gate sits
// between them.
//
// The idea that did NOT survive contact with the controls: "music moves in pitch, a machine does
// not", measured as spectral-centroid variation. amb-void wandered MORE (CV 1.145) than the synth
// drone (0.961), so the measurement separates nothing. It is recorded here so nobody rebuilds it.
const BED_FLATNESS_MIN = 0.03;
// A bed generated at the noise floor has nothing to mix: lifting a -68 LUFS file to a usable
// level means +30dB, which brings its own codec noise up with it. The beds sit near -38 LUFS in
// the finished film, so this gate is that target with about 14dB of headroom - enough that any
// source passing it needs a modest lift rather than a rescue.
const BED_LUFS_MIN = -52;
const HIT_CREST_MIN = 8;       // dB of peak over RMS: an event has to actually be an event

const KEY = execSync(
  `powershell -NoProfile -Command "(Get-ItemProperty HKCU:\\Environment).ELEVENLABS_API_KEY"`,
  { encoding: "utf8" },
).trim();

const ff = (args) => spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 256e6 }).stderr || "";
const ffout = (args) => spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 256e6 }).stdout || "";

/** Integrated loudness, plus how much the level moves across the file.
 *
 *  `ebur128=framelog=verbose` prints NOTHING in this ffmpeg build - the first version of this
 *  function parsed for momentary values, found none, and reported a null range that the gate then
 *  read as a failure. Every bed "failed" on a probe that was not measuring anything. astats
 *  metadata is what actually works here.
 *
 *  astats `reset` counts DECODER FRAMES, not seconds, and the frames-per-second ratio depends on
 *  the file, so the windows are re-bucketed to about half a second using the measured duration
 *  rather than by assuming a frame size. */
function loudness(file, dur) {
  // The LAST `I:` in the log, not the first. ebur128 prints a running figure per frame and only
  // the Summary block at the end is the integrated result; taking the first match reported a flat
  // -70 LUFS (the gate floor) for every file in the library, including event sounds that actually
  // peak near -5.
  const all = [...ff(["-i", file, "-af", "ebur128", "-f", "null", "-"]).matchAll(/I:\s+(-?[\d.]+) LUFS/g)];
  const I = all.at(-1);
  const raw = [...ffout([
    "-i", file, "-af",
    "astats=metadata=1:reset=43,ametadata=mode=print:key=lavfi.astats.Overall.RMS_level:file=-",
    "-f", "null", "-",
  ]).matchAll(/RMS_level=(-?[\d.]+)/g)].map((m) => +m[1]).filter(Number.isFinite);

  if (raw.length < 4 || !dur) return { lufs: I ? +I[1] : null, spread: null, events: null };
  const per = dur / raw.length;
  const size = Math.max(1, Math.round(0.5 / per));
  const buckets = [];
  for (let i = 0; i + size <= raw.length; i += size) {
    const w = raw.slice(i, i + size);
    buckets.push(w.reduce((a, b) => a + b, 0) / w.length);
  }
  // p95 over p50, not max over min. Plain range called every bed unsteady for two reasons that
  // are not faults: a generated clip often fades up from digital silence, and birdsong is
  // supposed to punctuate a porch. Percentiles ignore both.
  const sorted = [...buckets].sort((a, b) => a - b);
  const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const p50 = at(0.5);
  return {
    lufs: I ? +I[1] : null,
    p50: +p50.toFixed(1),
    spread: +(at(0.95) - p50).toFixed(1),
    // How many half-seconds sit well above the median. Recurring texture (birds, a coffee maker)
    // shows up as MANY; a door slam or a music sting shows up as one or two. That is the only
    // thing that separates a bed with content in it from a bed with a mistake in it.
    events: buckets.filter((v) => v > p50 + 10).length,
  };
}

/** Peak over RMS. A steady bed is compact; a single event is not. */
function crest(file) {
  const s = ff(["-i", file, "-af", "astats=measure_overall=Peak_level+RMS_level:measure_perchannel=none", "-f", "null", "-"]);
  const pk = s.match(/Peak level dB:\s*(-?[\d.inf]+)/);
  const rms = s.match(/RMS level dB:\s*(-?[\d.inf]+)/);
  return pk && rms ? +(parseFloat(pk[1]) - parseFloat(rms[1])).toFixed(1) : null;
}

/** Mean spectral flatness. Broadband noise approaches 1; a tone or a melody sits near 0. */
function flatness(file) {
  const s = ffout(["-i", file, "-af", "aspectralstats=measure=flatness,ametadata=mode=print:file=-", "-f", "null", "-"]);
  const v = [...s.matchAll(/aspectralstats\.\d+\.flatness=([\d.eE+-]+)/g)].map((x) => +x[1]).filter(Number.isFinite);
  return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(4) : null;
}

function duration(file) {
  const s = ff(["-i", file]);
  const m = s.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? +(+m[1] * 3600 + +m[2] * 60 + +m[3]).toFixed(2) : null;
}

async function words(file) {
  const fd = new FormData();
  fd.set("model_id", "scribe_v1");
  fd.set("file", new Blob([readFileSync(file)]), "a.mp3");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST", headers: { "xi-api-key": KEY }, body: fd,
  });
  if (!r.ok) return { err: `${r.status}` };
  const p = await r.json();
  const w = (p.words ?? []).filter((x) => x.type === "word").map((x) => x.text);
  return { n: w.length, sample: w.slice(0, 8).join(" ") };
}

let bad = 0;
console.log("file                  kind  dur   LUFS    p50 spread events crest  flat  speech");
console.log("-".repeat(82));

for (const s of SFX) {
  const f = `${DIR}/${s.name}.mp3`;
  if (!existsSync(f)) { console.log(`${s.name.padEnd(21)} MISSING`); bad++; continue; }

  const d = duration(f), l = loudness(f, d), c = crest(f), fl = flatness(f), w = await words(f);
  const fails = [];

  if (d === null || Math.abs(d - s.seconds) > s.seconds * 0.15) fails.push(`duration ${d} wanted ~${s.seconds}`);
  if (w.err) fails.push(`transcribe ${w.err}`);
  else if (w.n > 0) fails.push(`SPEECH: "${w.sample}"`);

  if (s.kind === "amb") {
    // A loud stretch is allowed only if it RECURS. One spike in an otherwise flat bed is an
    // incident; a dozen are the texture the prompt asked for.
    if (l.spread === null) fails.push("could not measure steadiness");
    else if (l.spread > BED_SPREAD_MAX && l.events < BED_EVENTS_MIN)
      fails.push(`an incident, not texture: ${l.spread}dB spread over only ${l.events} moments`);
    if (fl === null || fl < BED_FLATNESS_MIN) fails.push(`tonal, likely music: flatness ${fl} < ${BED_FLATNESS_MIN}`);
    // A bed generated near the noise floor cannot be mixed UP into a film without dragging its
    // own encoding artefacts with it. Level belongs to the mix, so the source has to have some.
    if (l.lufs === null || l.lufs < BED_LUFS_MIN) fails.push(`generated at silence: ${l.lufs} LUFS < ${BED_LUFS_MIN}`);
  } else {
    if (c === null || c < HIT_CREST_MIN) fails.push(`no transient: crest ${c}dB < ${HIT_CREST_MIN}`);
  }

  if (fails.length) bad++;
  console.log(
    `${s.name.padEnd(21)} ${s.kind.padEnd(5)} ${String(d).padStart(5)} ${String(l.lufs).padStart(6)} ` +
    `${String(l.p50 ?? "-").padStart(6)} ${String(l.spread ?? "-").padStart(6)} ${String(l.events ?? "-").padStart(6)} ` +
    `${String(c).padStart(5)} ${String(fl).padStart(6)} ${String(w.n ?? "?").padStart(6)}` +
    (fails.length ? `\n    FAIL  ${fails.join("\n    FAIL  ")}` : ""),
  );
}

console.log(bad ? `\n${bad} sound(s) FAILED` : "\nevery sound is what the ledger says it is");
process.exit(bad ? 1 : 0);
