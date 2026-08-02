// The sound library, generated once and committed.
//
// WHY A LEDGER AND NOT A CACHE. Generation is not deterministic: re-running a prompt gives a
// different take. So these files are the irreplaceable part, exactly like scripts/film/footage,
// and the prompt that produced each one is recorded beside it. shot7-signup-callback exists in
// the footage ledger with no prompt because nobody wrote it down at the time and it can never be
// regenerated. That does not happen again here.
//
// WHY AMBIENCE AND NOT MUSIC. These films are narrated end to end. Music under a continuously
// narrated explainer is the corporate-video tell, and it competes with the one thing the viewer
// is there for. What the films actually lack is a FLOOR: narration over digital silence is why
// they read as a slideshow with a voiceover. So the bed is room tone that agrees with the
// picture - a night office sounds like a night office - and the only non-ambient sounds are the
// two or three moments the narration is literally describing.
//
// EVERY PROMPT SAYS "no music, no voices". Generation will otherwise put a synth pad or a breath
// under an ambience, and a pad under a voiceover is precisely what this is avoiding. verify.mjs
// checks the result rather than trusting the prompt.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/sfx-gen.mjs          # generate whatever is missing
//   node scripts/film/sfx-gen.mjs --force  # regenerate everything (costs credits, new takes)
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const DIR = "scripts/film/sfx";
const NO = "No music, no melody, no synth pad, no voices, no speech, no narration.";

// NEVER ASK FOR A QUIET SOUND. The first version of these prompts described the beds the way they
// should sit in the finished film - "very faint", "barely audible", "almost inaudible" - and
// generation obeyed exactly, returning seven files at -68 to -70 LUFS. That is the noise floor:
// mixing one up to a usable level brings its own encoding artefacts up with it, and there is
// nothing underneath to recover. Level is decided in the mix, by BED_LUFS in mix.mjs. What the
// prompt asks for is the SOUND, recorded properly.
const LEVEL = "Clearly audible, recorded close at a normal healthy level, full and present.";

/** kind: "amb" is a steady bed that gets looped to fill a beat. "hit" is a single event placed in
 *  a gap between narrated lines. The distinction drives both the mix and the verification. */
export const SFX = [
  // --- beds -----------------------------------------------------------------------------------
  // ONE night interior, not two. There was a separate "empty office at night" bed, and three
  // takes of it came back at the noise floor while this one landed first time. Under narration at
  // -38 LUFS a compressor hum and an HVAC hum are the same sound, and a bed nobody can tell apart
  // is not worth a second file that can fail.
  { name: "amb-night-interior", kind: "amb", seconds: 18,
    prompt: `Microphone placed close beside a refrigerator running at night in a kitchen. Steady mechanical compressor hum and a low rumble. Continuous and unchanging for the whole recording, no events. ${LEVEL} ${NO}` },
  { name: "amb-dawn-kitchen", kind: "amb", seconds: 18,
    prompt: `Microphone close to a kettle of water simmering steadily on a kitchen stove. One continuous unbroken wash of steam hiss and rolling water for the entire recording. No whistle, no bubbling bursts, no clicks, nothing starts or stops. ${LEVEL} ${NO}` },
  { name: "amb-porch-morning", kind: "amb", seconds: 18,
    prompt: `Outdoor atmosphere on a wooden porch on a summer morning. One continuous unbroken wash of gentle wind through leafy trees for the entire recording, with faint birdsong far away in the background. No close bird calls, no sudden chirps, nothing starts or stops. ${LEVEL} ${NO}` },
  { name: "amb-open-air", kind: "amb", seconds: 18,
    prompt: `Outdoor wind atmosphere high above a wide river valley. Broadband moving air, an open airy hiss, a sense of height and distance. Continuous and unchanging for the whole recording, no birds, no events, no tone. ${LEVEL} ${NO}` },
  { name: "amb-desk-day", kind: "amb", seconds: 18,
    prompt: `Microphone close to a window air-conditioning unit running in a room during the day, with muffled street traffic outside behind it. One continuous unbroken rush of moving air for the entire recording, broad and airy. Nothing starts or stops. ${LEVEL} ${NO}` },
  { name: "amb-void", kind: "amb", seconds: 18,
    prompt: `A deep steady low-frequency rumble filling an enormous empty concrete hall, broad and continuous, like heavy machinery running far below. Unchanging for the whole recording, nothing happens. ${LEVEL} ${NO}` },

  // --- events ---------------------------------------------------------------------------------
  { name: "hit-phone-buzz", kind: "hit", seconds: 3,
    prompt: `A smartphone vibrating twice against a hard kitchen counter, then silence. Close, dry, realistic. ${NO}` },
  { name: "hit-notify", kind: "hit", seconds: 2,
    prompt: `One single soft message notification tone on a phone, gentle and modern, then silence. ${NO}` },
  { name: "hit-phone-ring", kind: "hit", seconds: 4,
    prompt: `A mobile phone ringing on a kitchen counter in the morning, two rings, realistic, then silence. ${NO}` },
  { name: "hit-keys", kind: "hit", seconds: 2,
    prompt: `A small set of house keys jingling once as they are handed over, close and dry, then silence. ${NO}` },
];

const KEY = execSync(
  `powershell -NoProfile -Command "(Get-ItemProperty HKCU:\\Environment).ELEVENLABS_API_KEY"`,
  { encoding: "utf8" },
).trim();

// --force regenerates. An optional name prefix limits it, so re-taking the beds does not throw
// away working event sounds and spend credits on new takes of them.
const force = process.argv.includes("--force");
const only = process.argv.slice(2).find((a) => !a.startsWith("--"))?.split(",");
mkdirSync(DIR, { recursive: true });

let made = 0;
for (const s of SFX) {
  const out = `${DIR}/${s.name}.mp3`;
  const wanted = force && (!only || only.some((o) => s.name.startsWith(o)));
  if (existsSync(out) && !wanted) { console.log(`have  ${s.name}`); continue; }
  const r = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: { "xi-api-key": KEY, "content-type": "application/json" },
    body: JSON.stringify({ text: s.prompt, duration_seconds: s.seconds, prompt_influence: 0.6 }),
  });
  if (!r.ok) { console.error(`FAIL ${s.name}: ${r.status} ${(await r.text()).slice(0, 200)}`); process.exit(1); }
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(out, buf);
  made++;
  console.log(`made  ${s.name}  ${(buf.length / 1024).toFixed(0)}KB  ${s.seconds}s`);
}

// The ledger is generated from the same table that generated the audio, so a prompt cannot be
// recorded wrongly or go missing.
const rows = SFX.map((s) => `| \`${s.name}.mp3\` | ${s.kind} | ${s.seconds}s | ${s.prompt} |`).join("\n");
writeFileSync(`${DIR}/SFX.md`, `# Sound ledger

Every effect, and the exact prompt that produced it. Generation is NOT deterministic: re-running a
prompt gives a different take, so these files are irreplaceable and are committed on purpose.
Regenerate with \`node scripts/film/sfx-gen.mjs --force\`, which will give you DIFFERENT takes.

Source: ElevenLabs sound-generation, \`prompt_influence\` 0.6, on the same account as the LT voice
clone. Commercially licensed, which is why this rather than library music: a paid ad cannot carry
a music-licensing claim.

\`kind\` is what the mix does with it. **amb** is a steady bed, looped to fill a picture beat and
crossfaded at every boundary. **hit** is a single event placed in a GAP between narrated lines,
never over a word.

| file | kind | length | prompt |
|---|---|---|---|
${rows}

## Verification

\`node scripts/film/sfx-verify.mjs\` proves each file is what it claims: a bed must contain no
speech and must be steady (a bed with a door slam in it is not a bed), and every file must be free
of the music the prompts forbid. Nobody on this project can listen to these, so they are measured.
`);
console.log(`\n${made} generated, ${SFX.length} in the ledger -> ${DIR}/SFX.md`);
