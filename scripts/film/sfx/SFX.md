# Sound ledger

Every effect, and the exact prompt that produced it. Generation is NOT deterministic: re-running a
prompt gives a different take, so these files are irreplaceable and are committed on purpose.
Regenerate with `node scripts/film/sfx-gen.mjs --force`, which will give you DIFFERENT takes.

Source: ElevenLabs sound-generation, `prompt_influence` 0.6, on the same account as the LT voice
clone. Commercially licensed, which is why this rather than library music: a paid ad cannot carry
a music-licensing claim.

`kind` is what the mix does with it. **amb** is a steady bed, looped to fill a picture beat and
crossfaded at every boundary. **hit** is a single event placed in a GAP between narrated lines,
never over a word.

| file | kind | length | prompt |
|---|---|---|---|
| `amb-night-interior.mp3` | amb | 18s | Microphone placed close beside a refrigerator running at night in a kitchen. Steady mechanical compressor hum and a low rumble. Continuous and unchanging for the whole recording, no events. Clearly audible, recorded close at a normal healthy level, full and present. No music, no melody, no synth pad, no voices, no speech, no narration. |
| `amb-dawn-kitchen.mp3` | amb | 18s | Microphone close to a kettle of water simmering steadily on a kitchen stove. One continuous unbroken wash of steam hiss and rolling water for the entire recording. No whistle, no bubbling bursts, no clicks, nothing starts or stops. Clearly audible, recorded close at a normal healthy level, full and present. No music, no melody, no synth pad, no voices, no speech, no narration. |
| `amb-porch-morning.mp3` | amb | 18s | Outdoor atmosphere on a wooden porch on a summer morning. One continuous unbroken wash of gentle wind through leafy trees for the entire recording, with faint birdsong far away in the background. No close bird calls, no sudden chirps, nothing starts or stops. Clearly audible, recorded close at a normal healthy level, full and present. No music, no melody, no synth pad, no voices, no speech, no narration. |
| `amb-open-air.mp3` | amb | 18s | Outdoor wind atmosphere high above a wide river valley. Broadband moving air, an open airy hiss, a sense of height and distance. Continuous and unchanging for the whole recording, no birds, no events, no tone. Clearly audible, recorded close at a normal healthy level, full and present. No music, no melody, no synth pad, no voices, no speech, no narration. |
| `amb-desk-day.mp3` | amb | 18s | Microphone close to a window air-conditioning unit running in a room during the day, with muffled street traffic outside behind it. One continuous unbroken rush of moving air for the entire recording, broad and airy. Nothing starts or stops. Clearly audible, recorded close at a normal healthy level, full and present. No music, no melody, no synth pad, no voices, no speech, no narration. |
| `amb-void.mp3` | amb | 18s | A deep steady low-frequency rumble filling an enormous empty concrete hall, broad and continuous, like heavy machinery running far below. Unchanging for the whole recording, nothing happens. Clearly audible, recorded close at a normal healthy level, full and present. No music, no melody, no synth pad, no voices, no speech, no narration. |
| `hit-phone-buzz.mp3` | hit | 3s | A smartphone vibrating twice against a hard kitchen counter, then silence. Close, dry, realistic. No music, no melody, no synth pad, no voices, no speech, no narration. |
| `hit-notify.mp3` | hit | 2s | One single soft message notification tone on a phone, gentle and modern, then silence. No music, no melody, no synth pad, no voices, no speech, no narration. |
| `hit-phone-ring.mp3` | hit | 4s | A mobile phone ringing on a kitchen counter in the morning, two rings, realistic, then silence. No music, no melody, no synth pad, no voices, no speech, no narration. |
| `hit-keys.mp3` | hit | 2s | A small set of house keys jingling once as they are handed over, close and dry, then silence. No music, no melody, no synth pad, no voices, no speech, no narration. |

## Verification

`node scripts/film/sfx-verify.mjs` proves each file is what it claims: a bed must contain no
speech and must be steady (a bed with a door slam in it is not a bed), and every file must be free
of the music the prompts forbid. Nobody on this project can listen to these, so they are measured.
