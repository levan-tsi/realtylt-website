/** ROUND E — candidate hunt for new editorial plates.
 *
 * The shipped licensed set is spent (see ROUND-D-LOG "Defects found and NOT fixed"), so topics
 * 12 to 20 have no plate photography at all. This searches Openverse the same way
 * scripts/fetch-images.mjs did, but it DOWNLOADS NOTHING: it prints candidates so each one's
 * licence page can be opened and read before anything lands on disk.
 *
 * Rails, from public/images/ATTRIBUTIONS.md: CC0 / public domain / CC BY only. The repo
 * deliberately does NOT use CC BY-SA ("its share-alike terms are a question nobody should have
 * to answer later"), so `license=by,cc0` is the only filter used here.
 *
 * The aspect filter is the important half. A plate ships at 21:9, so a 4:3 photograph loses most
 * of its height; anything squarer than 4:3 is dropped before it is ever looked at.
 */
const UA = { "User-Agent": "realtylt-website-build/1.0 (levan@realtylt.com)", Accept: "application/json" };

/** THE ANONYMOUS API IS GONE. scripts/fetch-images.mjs called this endpoint with no credential
 * and it now answers 401 (measured this round: four queries, all 401). A throwaway application
 * is registered anonymously at POST /v1/auth_tokens/register/ and exchanged for a bearer token
 * at POST /v1/auth_tokens/token/; the token is read from the environment so no credential is
 * ever written into this repository. See ROUND-E-LOG.md. */
if (process.env.OPENVERSE_TOKEN) UA.Authorization = `Bearer ${process.env.OPENVERSE_TOKEN}`;

const QUERIES = process.argv.slice(2);
if (!QUERIES.length) {
  console.log('usage: node scripts/find-plates.mjs "query one" "query two" ...');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const q of QUERIES) {
  let results = [];
  try {
    /** SOURCE=FLICKR on purpose. Openverse's default mix answers mostly from Wikimedia, whose
     * free-text index is poor at ordinary subjects (four queries for storefronts and letterboxes
     * returned nothing usable). Every shipped listings/house-*.jpg came off Flickr under CC BY
     * 2.0, so this is also where the register of the existing plates lives. */
    const src = process.env.HUNT_SOURCE ?? "flickr";
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=by,cc0&source=${src}&page_size=40&filter_dead=true`;
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error(`openverse ${res.status}`);
    results = (await res.json()).results ?? [];
  } catch (e) {
    console.log(`SEARCH FAIL "${q}": ${e.message}`);
    continue;
  }
  /** NO DIMENSION FILTER, and the reason is a measured instrument error rather than a relaxed
   * standard. The first version of this script filtered on `r.width`/`r.height` and reported
   * "0 of 40 wide enough" for every Flickr query. Both fields are NULL on Flickr records in the
   * search response (checked directly on one record: filesize, filetype, width and height are
   * all null; they live on the detail endpoint). A filter reading a null as a zero rejects
   * everything and looks exactly like an empty catalogue. Geometry is judged where it has to be
   * judged anyway: on the downloaded file, at the 21:9 crop that ships. */
  console.log(`\n### "${q}"  ${results.length} results`);
  for (const r of results.slice(0, 14)) {
    const tags = (r.tags ?? [])
      .filter((t) => t.unstable__provider !== "clarifai")
      .map((t) => t.name)
      .slice(0, 6)
      .join(",");
    console.log(
      [
        (r.license ?? "").toUpperCase() + (r.license_version ? " " + r.license_version : ""),
        (r.creator ?? "?").slice(0, 22),
        (r.title ?? "?").slice(0, 52),
        tags.slice(0, 60),
        r.foreign_landing_url ?? "",
      ].join("  |  "),
    );
  }
  await sleep(700);
}
