// Round-2 Task C: prove the DEPLOYED site serves real replicated MLS data.
// Usage: node scripts/verify-live-mls.mjs [base]   (default https://realtylt-website.vercel.app)
const BASE = process.argv[2] ?? "https://realtylt-website.vercel.app";
const COUNTIES = ["orange", "dutchess", "westchester", "putnam", "rockland", "ulster"];
// Fixture tells: ids H64xxxxx + local /images/listings/*.jpg photos.
const isFixtureListing = (l) => /^H64/.test(l.id) || (l.photos?.[0] ?? "").startsWith("/images/");

let fail = 0;
const t = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) fail++;
};

for (const county of COUNTIES) {
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api/idx/search?county=${county}&pageSize=5`);
  const ms = Date.now() - t0;
  const j = await res.json();
  const ls = j.listings ?? [];
  const real = ls.length > 0 && !ls.some(isFixtureListing);
  // Round 6: photos are the ON-DEMAND proxy (/api/media/{id}/{idx}), never stored Blob URLs.
  const proxyPhotos = ls.every((l) => l.photos.length === 0 || /^\/api\/media\//.test(l.photos[0]));
  t(
    `${county}: real data, no fixture`,
    res.ok && j.fixtureMode === false && real,
    `${ms}ms total=${j.total} first="${ls[0]?.address}, ${ls[0]?.city}" office="${ls[0]?.listOfficeName}"`,
  );
  t(`${county}: photos are on-demand proxy URLs (or none)`, proxyPhotos, `photo0=${ls[0]?.photos?.[0]?.slice(0, 72) ?? "(none)"}`);
  if (ms > 2000) t(`${county}: warm latency < 2s`, false, `${ms}ms`);
}

// Detail page of the first Dutchess listing renders address + compliance line.
const first = (await (await fetch(`${BASE}/api/idx/search?county=dutchess&pageSize=1`)).json()).listings?.[0];
if (first) {
  const html = await (await fetch(`${BASE}/listing/${first.id}`)).text();
  t(
    `listing/${first.id} SSR page`,
    html.includes(first.address) && /Listed with/i.test(html) && /One Key MLS/i.test(html),
    `${first.address}, ${first.city} $${first.price}`,
  );
}

// Snapshot freshness surfaces as dataLastUpdated.
const s = await (await fetch(`${BASE}/api/idx/search?pageSize=1`)).json();
const ageMin = (Date.now() - Date.parse(s.dataLastUpdated)) / 60000;
t("dataLastUpdated = recent replication timestamp", ageMin >= 0 && ageMin < 24 * 60, `${ageMin.toFixed(0)} min old`);

console.log(fail ? `\n${fail} FAILURE(S)` : "\nALL PASS");
process.exit(fail ? 1 : 0);
