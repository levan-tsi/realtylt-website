// The sound bed for a film: room tone that follows the picture, plus the two or three sounds the
// narration is actually describing.
//
// WHY THE FILMS NEEDED THIS. Every one of them is narration over digital silence. Silence has no
// floor, so each cut lands on nothing and the whole thing reads as a slideshow with a voiceover.
// A bed does not make a film "cinematic" by being noticeable - it does it by being there, so the
// picture cuts and the sound cuts agree.
//
// THE BED IS DERIVED FROM THE PICTURE, not written beside it. It reads PLAN out of the film's own
// cut.mjs, the same list bg.mjs cuts the footage from, so a beat physically cannot have a picture
// without a sound or drift out of alignment with one. That is the same fix that FILM_LEN and
// FADE_AT got after a re-recorded line faded a whole render to black.
//
// EVERY LEVEL IS MEASURED, NOT TYPED. The source beds were generated at wildly different
// loudnesses (-8.4 to -48.8 LUFS), so each one's gain is computed at build time from its own
// integrated loudness. Re-take a bed and the mix corrects itself instead of quietly going wrong.
//
// A BLACK CARD IS NOT SILENCE. Four of the workflow film's nine beats are black, and dropping the
// sound out under them is heard as a fault rather than as a pause. They get amb-void: a deep
// steady floor that is audibly a room rather than audibly nothing.
//
// THE CROSSFADES ARE THE POINT AS MUCH AS THE BEDS ARE. Each beat's bed is placed half a
// crossfade early and runs half a crossfade long, so neighbours overlap and every picture cut is
// carried by a sound that eases rather than snaps. A hard cut in picture AND sound at the same
// instant is what makes a sequence of generated clips feel like a slideshow.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/bed.mjs workflow
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import ffmpegPath from "ffmpeg-static";

const SFX = "scripts/film/sfx";
const V = "scripts/_scratch-video";

/** Where the bed sits under a -16 LUFS narration. Broadcast practice puts a bed roughly 18 to 22
 *  LU under dialogue; this is the middle of that, and it is verified rather than asserted -
 *  scripts/film/verify-audio.mjs transcribes the finished film and a bed that masks the voice
 *  shows up as missing words. */
export const BED_LUFS = -36;
/** Events sit above the bed because they are supposed to be noticed, and still well under the
 *  voice because they are not the point. */
export const HIT_LUFS = -26;
/** Crossfade between beats. Long enough to ease a cut, short enough not to smear two rooms. */
export const XF = 0.6;

const run = (args, tag) => {
  const r = spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 64e6 });
  if (r.status !== 0) {
    console.error(`FFMPEG FAIL [${tag}]\n` + (r.stderr || "").slice(-1800));
    process.exit(1);
  }
  return r.stderr || "";
};

/** Integrated loudness. The LAST `I:` in the log is the summary; the first is an early frame and
 *  reads -70 for everything. */
const loudCache = new Map();
function lufs(file) {
  if (loudCache.has(file)) return loudCache.get(file);
  const all = [...run(["-i", file, "-af", "ebur128", "-f", "null", "-"], `lufs ${file}`)
    .matchAll(/I:\s+(-?[\d.]+) LUFS/g)];
  const v = all.length ? +all.at(-1)[1] : null;
  if (v === null) throw new Error(`cannot measure loudness of ${file}`);
  loudCache.set(file, v);
  return v;
}

export async function buildBed(topic) {
  const cut = await import(`./${topic}/cut.mjs`);
  const { PLAN, HITS = [], FILM_LEN, FADE, FADE_AT, sched } = cut;
  mkdirSync(V, { recursive: true });
  const out = `${V}/bed-${topic}.wav`;

  const inputs = [];
  const filters = [];
  const labels = [];

  // --- the beds -------------------------------------------------------------------------------
  PLAN.forEach((b, k) => {
    const src = `${SFX}/${b.amb}.mp3`;
    if (!existsSync(src)) throw new Error(`beat "${b.beat}" wants ${b.amb}, which does not exist`);

    const first = k === 0, last = k === PLAN.length - 1;
    const segStart = Math.max(0, b.from - XF / 2);
    const segEnd = Math.min(FILM_LEN, b.to + XF / 2);
    const len = +(segEnd - segStart).toFixed(3);

    // -stream_loop fills a beat longer than the 18s source; -t caps the read.
    inputs.push("-stream_loop", "-1", "-t", String(len), "-i", src);

    const gain = +(BED_LUFS - lufs(src)).toFixed(2);
    // The film's very first moment eases up from nothing rather than snapping on, and the last
    // beat falls with the picture: the bed's fade-out starts exactly where assemble.mjs fades the
    // image, so sound and picture go together instead of the audio outliving a black frame.
    const fadeIn = first ? 0.9 : XF;
    const outAt = last ? +(FADE_AT - segStart).toFixed(3) : +(len - XF).toFixed(3);
    const outFor = last ? FADE : XF;

    filters.push(
      `[${k}:a]aresample=48000,aformat=channel_layouts=mono,volume=${gain}dB,` +
      `afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${Math.max(0, outAt)}:d=${outFor},` +
      `adelay=${Math.round(segStart * 1000)}[b${k}]`,
    );
    labels.push(`[b${k}]`);
  });

  // --- the events -----------------------------------------------------------------------------
  // Placed in the SILENCE between two narrated lines, derived from the measured schedule, and
  // trimmed to the gap so a sound can never ring on underneath the next sentence.
  const placed = [];
  HITS.forEach((h, j) => {
    const src = `${SFX}/${h.sfx}.mp3`;
    if (!existsSync(src)) throw new Error(`hit wants ${h.sfx}, which does not exist`);
    const line = sched[h.afterLine];
    const next = sched[h.afterLine + 1];
    if (!line) throw new Error(`hit after line ${h.afterLine}, which does not exist`);
    const gapEnd = next ? next.start : FILM_LEN;
    const at = +(line.end + (h.nudge ?? 0)).toFixed(3);
    const room = +(gapEnd - at).toFixed(3);
    if (room <= 0.2) throw new Error(`no room for ${h.sfx} after line ${h.afterLine}: ${room}s`);

    const k = PLAN.length + j;
    inputs.push("-t", String(room), "-i", src);
    const gain = +(HIT_LUFS - lufs(src)).toFixed(2);
    filters.push(
      `[${k}:a]aresample=48000,aformat=channel_layouts=mono,volume=${gain}dB,` +
      `afade=t=out:st=${Math.max(0, room - 0.3)}:d=0.3,` +
      `adelay=${Math.round(at * 1000)}[h${j}]`,
    );
    labels.push(`[h${j}]`);
    placed.push({ ...h, at, room });
  });

  const mix = `${labels.join("")}amix=inputs=${labels.length}:normalize=0,` +
    `atrim=0:${FILM_LEN},asetpts=PTS-STARTPTS[bed]`;
  run([...inputs, "-filter_complex", `${filters.join(";")};${mix}`, "-map", "[bed]",
    "-ac", "1", "-ar", "48000", "-y", out], "bed");

  // Report what was built, with the measured gain each source needed, so a bed that is wildly out
  // of family is visible here rather than in the finished film.
  console.log(`bed for ${topic}: ${FILM_LEN}s -> ${out} (${(statSync(out).size / 1048576).toFixed(1)}MB)`);
  console.log(`  target ${BED_LUFS} LUFS bed / ${HIT_LUFS} LUFS events / ${XF}s crossfades`);
  for (const b of PLAN) {
    console.log(`  ${String(b.from.toFixed(2)).padStart(6)} -> ${b.to.toFixed(2).padStart(6)}  ` +
      `${b.amb.padEnd(20)} ${(lufs(`${SFX}/${b.amb}.mp3`) + " LUFS").padEnd(12)} ` +
      `gain ${(BED_LUFS - lufs(`${SFX}/${b.amb}.mp3`)).toFixed(1).padStart(6)}dB   ${b.beat}`);
  }
  for (const p of placed) {
    console.log(`  ${String(p.at.toFixed(2)).padStart(6)}         ${p.sfx.padEnd(20)} ` +
      `${p.room.toFixed(2)}s of gap    ${p.why}`);
  }
  console.log(`  measured: ${lufs(out)} LUFS`);
  return out;
}

// Only act as a command when this file IS the command. assemble.mjs imports buildBed, and an
// unguarded CLI block here exited the whole assembly before it started.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const topic = process.argv[2];
  if (topic) await buildBed(topic);
  else { console.error("usage: node scripts/film/bed.mjs <topic>"); process.exit(1); }
}
