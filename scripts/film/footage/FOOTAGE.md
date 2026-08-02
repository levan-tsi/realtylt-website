# Footage ledger

Every clip, and the exact prompt that produced it. Generation is NOT deterministic: re-running a
prompt gives a different take, so these files are the irreplaceable part of the repo and are
committed on purpose. Revisit that when ads multiply - six clips per ad across ~19 topics is roughly
285MB of binaries, and THAT is the argument for moving them off-repo, not the 13MB here today.

Source: Google Flow (labs.google/fx/tools/flow), **Omni Flash** model, 16:9, x1, visible
watermarking OFF, on the owner's personal Google AI Pro account `levan.realtylt@gmail.com`. Cost is
15 credits per clip. All clips are 1280x720 / 24fps, no usable audio.

## "The $6,000 lead" (`six-thousand-lead`)

| file | length | prompt |
|---|---|---|
| `shot1-1140pm-lead.mp4` | 8s | Night interior of a real estate kitchen, smartphone lighting up on the counter |
| `shot2-empty-office.mp4` | 8s | Empty real estate office at night, desks and listing boards, nobody there |
| `shot3-reply-glow.mp4` | 8s | Smartphone on a kitchen counter, chat thread glowing on screen, shallow depth of field |
| `shot4-hudson-aerial.mp4` | 10s | Cinematic aerial drone shot at golden hour over the Hudson River valley, slow steady forward push. A wide dark blue river curving between forested hills, a few shingled riverfront houses with small docks on the near bank, warm low sunlight raking across the treetops, long shadows, light haze in the distance. Late summer greens turning gold. Smooth continuous drone movement, no cuts. Photorealistic, cinematic color grade, shallow atmospheric depth. No text, no captions, no on-screen writing, no people, no vehicles. |
| `shot5-morning-ring.mp4` | 8s | Kitchen at sunrise, coffee maker brewing, phone on the counter ringing with an incoming call |
| `shot6-keys-porch.mp4` | 10s | Cinematic close shot in warm early morning light on the wooden front porch of a craftsman house with tapered columns. A hand passes a set of house keys into a woman's open palm. Shallow depth of field holding focus on the keys, a young couple soft and out of focus behind, the front door framing them. Golden backlight through the porch railing, fine dust in the air, gentle handheld movement. Photorealistic, 50mm, warm documentary feel, no dialogue. No text, no captions, no on-screen writing, no logos. |

Shots 1, 2, 3 and 5 were generated in an earlier session; their prompts above are reconstructed from
the Flow-assigned filenames, so treat them as descriptions rather than verbatim.

## Added later

| file | length | what it shows |
|---|---|---|
| `shot7-signup-callback.mp4` | 10s | A laptop open on a wooden desk in daylight with a phone lying face up beside it; slow push in, and the phone screen lights up with an incoming call in the last two seconds. Generated for the voice film (commit 6309f34) because none of the first six clips showed a form turning into a ringing phone. **Its prompt was not recorded at the time**, so this is a description of the take rather than a reconstruction of the prompt; a re-run cannot reproduce it and the file is therefore irreplaceable. Reused as the opening beat of the workflow film, where it is the desk the whole article is about. |

## Per-topic footage (2026-08-01)

**Why these exist.** The four films drew from the same seven clips, and two of them -
`shot6-keys-porch` and `shot2-empty-office` - appeared in EVERY film. Somebody who read two posts
watched the same keys-on-a-porch shot close both, which is the strongest "mass-produced" signal on
the whole blog and undoes the point of the treatment. These six give each film its own close and
one beat that only makes sense for its own topic. `shot6-keys-porch` now appears in ONE film (the
voice film, which was not re-cut) instead of four.

All 1280x720 / 24fps / 10.01s, same as the originals: same Flow settings, same model, nothing
upscaled, so they intercut with the existing library without a visible change in sharpness.

| file | used by | prompt |
|---|---|---|
| `shot8-porch-callback.mp4` | reactivation, the close | Cinematic shot in warm early morning light on the front porch of a suburban house. A woman in her forties stands holding a phone to her ear, listening, then breaking into a genuine relieved smile. Shallow depth of field holding focus on her face, soft golden backlight through the porch railing, fine dust in the air, gentle handheld movement. Photorealistic, 50mm, warm documentary feel, no dialogue. No text, no captions, no on-screen writing, no logos. |
| `shot9-desk-callback.mp4` | qualify, the close | Cinematic shot in warm morning light: a real estate agent sitting at a wooden desk beside a window, picking up a phone and settling in to make a call, calm and purposeful. Shallow depth of field, soft window light raking across the desk, a mug and a notepad beside them, gentle handheld movement. Photorealistic, 50mm, warm documentary feel, no dialogue. No text, no captions, no on-screen writing, no logos. |
| `shot10-laptop-close.mp4` | workflow, the close | Cinematic shot in warm late afternoon light: a person at a tidy wooden desk closing a laptop, standing up unhurried and walking out of frame, leaving the quiet room behind them. Low sun through a window, long shadows across the floor, shallow depth of field, gentle handheld movement. Photorealistic, 50mm, warm documentary feel, no dialogue. No text, no captions, no on-screen writing, no logos. |
| `shot11-old-records.mp4` | reactivation, "and nobody called" | Slow cinematic push through a dim real estate office at night. Stacks of paper folders on a desk and an open filing cabinet drawer full of old records, cold blue light from a window, fine dust drifting in the air, nobody present. Photorealistic, shallow depth of field, quiet and still. No text, no captions, no on-screen writing, no logos, no people. |
| `shot12-typing-notes.mp4` | workflow, the hook | Cinematic close shot of a pair of hands typing steadily on a laptop keyboard at a desk covered in handwritten paper notes and sticky notes, late evening, a warm desk lamp the only light. Shallow depth of field, no face visible, gentle handheld movement. Photorealistic, 50mm, warm documentary feel. No text, no captions, no on-screen writing, no logos. |
| `shot13-three-folders.mp4` | qualify, "three leads arrived" | Cinematic overhead shot of three identical plain manila folders lying side by side on a wooden desk in soft daylight. A hand enters the frame and picks up one of them, lifting it out of shot. Shallow depth of field, calm and deliberate, gentle handheld movement. Photorealistic, warm documentary feel. No text, no captions, no on-screen writing, no labels, no logos. |

**`shot8` performs an arc, and the in-point depends on it.** It listens with a worried face for its
first five seconds and only breaks into a smile around 6.5s. Entering at 1.85 plays the whole turn
under the closing line; entering later would open on the payoff and entering at 0 would end the
film on a frown. Sample a clip across its length before choosing an in-point.

### Downloading from Flow, which changed and cost real time

**The per-item three-dot menu is GONE** from the current Flow UI, and with it the "720p Original
Size" option this ledger used to recommend. The toolbar Download button is now the only control and
it produces the ~24MB export that **stalls forever** - measured here at exactly 24,231,398 bytes,
static across minutes, and ffmpeg reports no duration and no video stream, so it is genuinely
incomplete rather than merely slow.

What works: the `<video>` element's `src` is
`labs.google/fx/api/trpc/media.getMediaUrlRedirect?name=<id>`, which 302s to a **signed
flow-content.google URL**. Fetching that redirect from page JavaScript fails (the cross-origin hop
is CORS-blocked, and a `download` attribute is ignored on it), but navigating a tab to it and
reading the resulting address gives the signed URL, which `curl -sk` downloads in one go at native
720p. The media list VIRTUALISES, so scroll and re-query to collect every id.

**A new session unsticks the agent.** The approval card losing its buttons is in this file already;
the recorded fix, typing "Approve" as a message, worked twice and then stopped working entirely -
the agent restated its intent and never produced a card again. Clicking new-session and re-sending
the prompt fixed it immediately, and doing one clip per fresh session was reliable for the rest.

### What generation gets wrong, and how the cut works around it

- **Screen content is always gibberish.** Every phone screen in these clips carries unreadable
  pseudo-text. It survives because the cut never holds on a legible screen and never asks the
  viewer to read one: the meaning is carried by the caption typography instead. Do not plan a shot
  whose payoff is words on a device.
- **"Hand passes keys" produced a whole scene, not a close-up.** The first half of shot 6 is a wide
  of a man holding keys out; only the second half is the close-up that was asked for. The cut takes
  the second half (`trimBefore` 3.5s). Prompting a close-up gets you a scene containing one.
- **Prompt "no text, no captions, no on-screen writing"** explicitly, or Flow will sometimes burn in
  a title card.
