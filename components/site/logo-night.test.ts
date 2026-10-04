import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

/** THE NIGHT LOGO IS HIS LOGO, LIFTED (round 66; the owner: "bring my actual logo back, whatever
 * colour it has").
 *
 * His file (public/logo-realtylt.png, kept for print and the share card) is two colours antialiased
 * by alpha alone: the wordmark, the frame and the T in navy #0e2d52, the R mark and the Y's stroke in
 * #27a7df. The navy is 1.33:1 on the night ground, so the night file is the same pixels with the navy
 * lifted to #3d74b8 (his navy's OKLCH hue, 255; 3.85:1 on #131417, 3.1 at worst over the phone's
 * Hudson, measured on the page in scripts/_scratch-r66/logo/), the mark and every alpha untouched, so
 * the R and the Y's stroke stay a second colour (1.75:1 against the wordmark). This holds the night
 * file to that recipe pixel by pixel and the day file to what it is. */
const ROOT = path.resolve(__dirname, "../..");
const read = (f: string) => sharp(path.join(ROOT, f)).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
const hex = (d: Buffer, i: number) => "#" + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("");

describe("the night logo", () => {
  it("is his file with the navy lifted to #3d74b8 and nothing else changed", async () => {
    const day = await read("public/logo-realtylt.png");
    const night = await read("public/logo-realtylt-night.png");
    expect([night.info.width, night.info.height]).toEqual([5670, 1167]);
    expect([day.info.width, day.info.height]).toEqual([5670, 1167]);
    const counts = { dayNavy: 0, dayMark: 0, dayOther: 0, nightLift: 0, nightMark: 0, nightOther: 0, alphaMoved: 0, misplaced: 0 };
    for (let i = 0; i < day.data.length; i += 4) {
      if (day.data[i + 3] !== night.data[i + 3]) counts.alphaMoved++;
      if (day.data[i + 3] === 0) continue;
      const d = hex(day.data, i), n = hex(night.data, i);
      if (d === "#0e2d52") counts.dayNavy++;
      else if (d === "#27a7df") counts.dayMark++;
      else counts.dayOther++;
      if (n === "#3d74b8") counts.nightLift++;
      else if (n === "#27a7df") counts.nightMark++;
      else counts.nightOther++;
      // Every navy pixel became the lift and every mark pixel stayed the mark, in place.
      if ((d === "#0e2d52") !== (n === "#3d74b8")) counts.misplaced++;
    }
    expect(counts).toEqual({ dayNavy: 1_004_803, dayMark: 252_938, dayOther: 0, nightLift: 1_004_803, nightMark: 252_938, nightOther: 0, alphaMoved: 0, misplaced: 0 });
  });
});
