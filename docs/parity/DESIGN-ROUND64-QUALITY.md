# Round 64: the map's quality (2026-09-27)

The owner: "polish map again. So even on the phone, if it's not good quality, maybe we should zoom in
more so it's better quality ... we shouldn't lose the quality of the map. Even on the computer."
Earlier, on his iPhone: "it looks like low quality because we're zoomed out and it looks a little
pixelated". Parks and water colours unchanged (his decision).

## 1. Where quality was lost (every stop photographed at device pixels on the production build)

Screens: 1440x900 at 2, 1920x1080 at 1 and 2, 390x844 at 3. Crops at 1:1, nearest-neighbour zoom
(scratch: `scripts/_scratch-r64/q/`, sheet `SHEET-A-ranked.jpg`).

- A plate is never enlarged on the common screens (phone 1170 at 1.0, laptop 2880 at 1.0, 1920 at 1x
  shows it at 0.67); only 1920 at 2x enlarges it 1.33 (left).
- 1. **The laptop films**: one clip at 1440 wide for every screen, so a 2x laptop showed it at twice
  its size (1920 at 1.33). The street grid went to mush mid-flight. The worst offender.
- 2. **The territory and the tail (hero, region), both aspects**: the far roads were dotted beads. The
  live style at zoom 9 to 10 drapes its hairlines on the terrain from a texture too coarse for them;
  rendering at twice the pixels and scaling down did NOT remove the beads, one zoom deeper did. On the
  phone's first screen this is the "pixelated" he saw.
- 3. The dense borough plates' AVIF (quality 50) softens building edges a little; quality 60 costs 60%
  more bytes for a difference barely visible at 1:1. Left.
- 4. The phone films (1170, crf 28) are a touch soft but hold the grid. Left.

## 2. What changed

- **The territory and region plates are deep renders in the live style** (`?pstyle=live&deep=1`,
  style.ts `PlateOpt.live`: `tiledLayers` with every zoom stop up one and every width doubled, so the
  picture's lines are the live ones, one zoom finer; the terrain level held as for every deep plate).
  make-plates.mjs `LIVE_DEEP`; the page itself never passes `plate`, and the live style is pinned
  byte for byte by style.test.ts. The hero<->dutchess and harbour<->region films recorded again with
  their territory end drawn the same way (make-flights.mjs: a live deep plate is its own drawing,
  shot twice and dissolved). Film ends against their plates: 0.00 to 0.04 levels, nothing over 16.
  Weight: the eight plate files +268 KB together (hero wide 2880 AVIF 189 -> 212 KB).
- **The laptop films at 2880 as well** (crf 46, from the lossless masters; `webm: [1440, 2880]`,
  plate-frame.ts `filmWidth` picks by the window's device width capped at 2x: a 1x laptop keeps the
  1440 clip, a 2x laptop and a 1920 screen take the 2880). 32 clips, 0.76 to 1.8 MB, 38.4 MB the set
  (the 1440 set is 12.4 MB). The recorder's size cap is per width now (2.4 MB at 2880).

## 3. The decode cost, measured before choosing 2880 (production build, same machine)

`scripts/_scratch-r64/q/transition.mjs` (the round 58 walk with a window size and density), frames
over 34 ms during flights, per walk:

| clips | 1440 x 900 at 2 | 1920 x 1080 at 1 |
|---|---|---|
| 1440 only (before) | 0, 1, 2, 2 | 0, 0, 0 |
| 2160 | 1, 2 | 0, 0 |
| 2880 | 1, 2, 1, 1 | 0, 0 |

No worse than the 1440 set, so 2880. The walk's clips played / fell back to the fade: 8 to 9 / 7 to 8
in every configuration (the walk waits 1.5 s a stop; a clip plays only once wholly buffered). On a
real line a 2880 clip (about 1.2 MB) takes longer to buffer than the 1440 (0.4 MB): if the laptop's
flights fade more often in the field, the 2160 set (0.7 MB a clip, measured above) is the step back.
Phone walk, before / after: 12 / 8, 9 frames over 34 ms (clips unchanged but the two re-recorded).

## 4. The gate

- Calibration (`_scratch-r58-calib.mjs`, hero, region, queens, dutchess-county): laptop and phone
  0.00 px except region, 0.10 px laptop / 0.06 phone. The region's new matrix projects exactly as the
  old one did (max 0.000 px over a grid of places and heights 0 to 400 m, `mcmp.mjs`), so that 0.1 px
  is the live map's own region camera against the plate's, not this change.
- Hover 50/50 at Queens and at the hero; phone taps 30/30 at the hero; tsc clean; vitest 2290
  (2288 + the live deep style's two).
- Seen: before/after crops at the same spots (`SHEET-B-after.jpg`), the first screen at 1440, 1920 and
  390 (`SHEET-B-first.jpg`): the approved framing unchanged, the roads continuous.

## 5. A trap for the next render

A plate shoot can come back with tiles missing (a band of the hero with no roads, the idle reached
with tiles not drawn) and its elevation read as 0 m; the second is now re-read until it settles
(make-plates.mjs). The first is caught by the film's end check (frame 0 against the plate): a shoot
that disagrees with its film end is shot again.
