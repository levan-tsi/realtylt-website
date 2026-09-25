# Design round 59: the home page, the owner's sixth verdict

Branch `design/futuristic-r53`, worktree `~/realtylt-website-r53`, nothing pushed. The verdict
(2026-09-25, verbatim in `DESIGN-ROUND58.md` §7) asked three things, built one at a time:

1. **The lights, yellow like a light.** "Maybe make that yellow dots just yellow, like a light, but
   don't give brightness around it, maybe just a little bit, like five, ten percent, nothing more,
   or just a yellow dot."
2. **The counties with definition.** The county plates draw the whole street grid, the land and the
   buildings, and the county cameras come down to 8 to 10 km, so Poughkeepsie reads with no name.
3. **The flight back.** The transition moves the map again (a recorded film per adjacent flight).

## §1 The lights

### The cause

Round 58 halved the halo (3 to 4 px, alpha 0.46) and turned the neighbourhood glow off. The core
was warm white, `255, 248, 236`; the warmth had lived in the halo `255, 212, 158`. With the halo
halved, the point read WHITE on the black plate and the city "lost its brightness or vision".
Measured on the round 58 build: the light centres in Queens at 1440 averaged `226, 226, 222`
(`scripts/_scratch-r59-peaks.mjs`, local maxima with R at least 200 and R above B).

### The candidates

All on one build through two new knobs, `?core=r,g,b` (the core's colour) and `?ha=` (the halo's
strength), beside round 58's `?halo=` (the halo's radius scale) and `?glow=`. Frames at the
territory (145 km), Queens (10 km) and Dutchess (16 km), 1440 x 900 and 390 x 844, raw under
`scripts/_scratch-r59/1/` (gitignored), one directory a variant.

Core colour, halo alpha 0.08:

| | core | Queens 1440, mean light centre | reads as |
|---|---|---|---|
| r58 | 255, 248, 236, halo 0.46 | 226, 226, 222 | white, the complaint |
| D | 255, 232, 190 | 249, 249, 221 | white again beside the blue-white roads |
| B | 255, 222, 172 | 249, 247, 206 | pale yellow |
| **A** | **255, 212, 158** | **249, 240, 194** | **lamplight, apart from the roads** |
| C | 255, 200, 140 | 249, 230, 179 | leans amber, toward orange |

The centres read paler than the core because the sprite is ADDED to the plate (the ground under a
light adds its own grey-blue) and the halo adds its share; R clips first.

Halo strength with core A (radii unchanged, about 1.5 core radii, 3 to 4 px):

| halo alpha | Queens 1440, mean light centre | reads as |
|---|---|---|
| 0, a bare dot | 249, 227, 185 | a shade deeper and flatter, the edge hard |
| 0.05 | 249, 236, 192 | nearly the bare dot |
| **0.08** | **249, 240, 194** | **the edge of a lamp, no ring** |
| 0.10 | 249, 243, 197 | the same as 0.08 at a glance |
| 0.08 at 2 core radii (`?halo=1.25`) | 249, 240, 195 | no visible difference from 1.5 radii |

### The contact sheets

Each sheet is one crop across nine columns (r58 white, D, B, A, C at halo 0.08; A at 0, 0.05,
0.10; the final default), 1440 above and 390 below, at 2x nearest neighbour so a light's pixels
show:

- `docs/design-r59/lights-territory.jpg` (New York City at the territory's height; the phone row is
  the Bronx's edge at its own territory)
- `docs/design-r59/lights-queens.jpg`
- `docs/design-r59/lights-poughkeepsie.jpg` (the Dutchess stop)

### The default

- **Core `255, 212, 158`** (A): the halo's own warmth, a whitish-yellow lamp. D and B slip back
  toward the white he rejected, and at the territory they blend with the blue-white roads; C leans
  amber. A is one hue with the halo, never a saturated yellow.
- **Halo alpha 0.08 on a laptop, 0.10 on a phone** (`HALO_ALPHA`, `HALO_ALPHA_NARROW` in
  `components/home/g3d/glyph.ts`): inside his five to ten percent. The phone keeps round 57.3's
  rule of a slightly stronger light because its lights are read smaller.
- **Halo radius unchanged** (3 to 4 px, 1.48 to 1.58 core radii; the test holds it under 2).
- `HALO_RGB` is the same colour as the core. The neighbourhood glow stays off.
- **Overall brightness went down, not up** (the rule from his galaxy verdict): the mean of the NYC
  region at the territory, 1440, went from 22.23 to 21.69, and at Queens from 18.55 to 17.71.
- **The lit light** (hover, a focused card) still eases to white and 1.6x the core: a white point
  among yellow ones stands out more than before (`scripts/_scratch-r59/1/lit.png`).
- **The featured light's** halo is now a fifth up (x 1.2), not +0.08: on a halo of 0.08 the old
  term would have doubled it into a ring.
- With `?ha=0` the halo's radius falls to the core's, and a light's reach (culling, the keep-outs)
  counts the core too (`reachOf` = the largest of core, halo, glow).

### The comparison URLs for the owner

On the one build, the default beside the others:

- `/?core=255,248,236&ha=0.46` round 58's white
- `/?core=255,232,190` D, `/?core=255,222,172` B, `/?core=255,200,140` C
- `/?ha=0` a bare yellow dot, `/?ha=0.05`, `/?ha=0.10`

### The gates (the default build, :3102)

- tsc clean; vitest 2153 green (2147 before; six new truths in `glyph.test.ts`: the core's band,
  the halo at most 0.10 and 2 core radii, `?ha=`, `?core=` through lit and featured, the lit
  light brighter at the centre, the featured halo a whisper).
- Frames at all 20 stops at 1440 and 390 (`scripts/_scratch-r59/1/final/`).
- Hover 50 of 50 at Queens, 1440. The probe's phone path stopped on its own error
  (`window.__ml` undefined after a tap), not in the lights; not investigated in this section.
- Calibration 0.00 px (mean, p95, max) at hero, Queens, Dutchess county and Putnam, both widths:
  no light moved.
- Reduced motion: one 400 ms opacity fade, no scale.
- Contrast at 390: 0 texts under the floor at p95 and p99.

### The live map's cover

`scripts/make-ml-cover.mjs` loaded `/?cover=0`, which since round 58 is the plates page, so it
found no map. It now loads `/?cover=0&ground=ml`; the two covers
(`public/images/home-night-cover*.webp`, the `?ground=ml` comparison's load cover) were
re-photographed with the yellow lights. The visitor's default page (the plates) draws its lights
live and does not use them.

### Open

- On the phone, the lights under the words' scrim (the county list, the lead form) read as dim
  tan dots whatever their colour: the scrim, not the light. A question for the owner's look, not
  changed here.
