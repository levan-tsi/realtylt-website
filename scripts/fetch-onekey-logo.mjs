// Self-host the One Key MLS attribution mark (components/idx/MlsAttribution.tsx) from the
// MLS's OWN CDN. Live realtylt.com hotlinks the same mark off the IDX vendor's CDN; we do
// not depend on a third party for a compliance asset. Re-run only if One Key restyles it.
//
//   node scripts/fetch-onekey-logo.mjs
//
// Their filenames name the LOGO's colour; ours name the BACKGROUND it belongs on, because
// that is the choice the component makes.
import fs from "node:fs";

const SRC = "https://d18648vuu5q1nq.cloudfront.net/media/onekey/";
const FILES = [
  ["onekey_logo-onekey-dark.svg", "public/images/mls/onekey-mls-on-dark.svg"], // white mark
  ["onekey_logo-onekey-light.svg", "public/images/mls/onekey-mls.svg"], // near-black mark
];

fs.mkdirSync("public/images/mls", { recursive: true });
for (const [from, to] of FILES) {
  const r = await fetch(SRC + from, { signal: AbortSignal.timeout(25000) });
  const body = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(to, body);
  console.log(to, r.status, body.length + "B", "type=" + r.headers.get("content-type"));
  console.log("   head:", body.toString("utf8", 0, 200).replace(/\s+/g, " "));
}
