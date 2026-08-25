/** ROUND E — read the LICENCE OFF THE SOURCE PAGE, for every candidate that might ship.
 *
 * The rule this exists to enforce: never an image whose licence page was not opened, and never
 * "probably fine". A search index saying "BY 2.0" is a third party's assertion about a photo
 * page; this fetches the photo page itself and prints what IT says, so the ledger row in
 * public/images/ATTRIBUTIONS.md is copied from the primary rather than from a search result.
 *
 * Flickr's photo page carries a `photo-license-url` / license label in its embedded model, plus
 * the owner's display name and the title, so all three ledger fields come off one document.
 *
 * Usage: node scripts/check-plate-licence.mjs <flickr photo page url> ...
 */
const UA = { "User-Agent": "realtylt-website-build/1.0 (levan@realtylt.com)" };

/** Flickr's numeric licence ids, from https://www.flickr.com/services/api/flickr.photos.licenses.getInfo.html
 * Only the three the project allows are named; anything else is printed as its raw id so it is
 * obvious that it was not recognised rather than quietly treated as safe. */
const LICENSES = {
  4: "CC BY 2.0",
  5: "CC BY-SA 2.0  << NOT ALLOWED",
  6: "CC BY-ND 2.0  << NOT ALLOWED",
  1: "CC BY-NC-SA 2.0  << NOT ALLOWED",
  2: "CC BY-NC 2.0  << NOT ALLOWED",
  3: "CC BY-NC-ND 2.0  << NOT ALLOWED",
  7: "No known copyright restrictions  << NOT A LICENCE",
  8: "United States Government Work",
  9: "CC0 1.0",
  10: "Public Domain Mark 1.0",
};

for (const page of process.argv.slice(2)) {
  const res = await fetch(page, { headers: UA });
  if (!res.ok) {
    console.log(`FETCH ${res.status}  ${page}`);
    continue;
  }
  const html = await res.text();
  const grab = (re) => {
    const m = html.match(re);
    return m ? m[1].replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).trim() : "";
  };
  const licenseId = grab(/"license"\s*:\s*"?(\d+)"?/);
  const licenseUrl = grab(/(https:\/\/creativecommons\.org\/(?:licenses|publicdomain)\/[a-z0-9\-.\/]+)/i);
  const title = grab(/"title"\s*:\s*\{\s*"_content"\s*:\s*"([^"]*)"/) || grab(/<meta property="og:title" content="([^"]*)"/);
  const owner =
    grab(/"realname"\s*:\s*"([^"]*)"/) ||
    grab(/"username"\s*:\s*"([^"]*)"/) ||
    grab(/"ownername"\s*:\s*"([^"]*)"/);
  const pathAlias = grab(/"pathAlias"\s*:\s*"([^"]*)"/);
  console.log(
    [
      LICENSES[licenseId] ?? `UNRECOGNISED id=${licenseId || "?"}`,
      licenseUrl || "(no CC url in page)",
      `title="${title}"`,
      `by="${owner}"${pathAlias ? ` (${pathAlias})` : ""}`,
      page,
    ].join("\n      "),
  );
  console.log("");
}
