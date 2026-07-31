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
