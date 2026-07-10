// Generate the branded OG image (1200x630) → public/og.png
import fs from "node:fs";
import { chromium } from "playwright";

const html = `<!doctype html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Nunito:wght@400;700&family=Spline+Sans+Mono:wght@500&display=swap');
  * { margin:0; box-sizing:border-box }
  body { width:1200px; height:630px; background:#101820; font-family:Nunito,sans-serif; color:#FAFAF8; overflow:hidden; position:relative }
  .wrap { position:relative; height:100%; padding:72px 80px; display:flex; flex-direction:column; justify-content:space-between; z-index:2 }
  .mark { display:flex; align-items:center; gap:14px }
  .rt { font-family:'Spline Sans Mono',monospace; font-weight:500; font-size:30px; color:#2B6CB0; border:3px solid #2B6CB0; padding:2px 10px }
  .name { font-size:30px; font-weight:700; letter-spacing:0.18em }
  .name b { color:#2B6CB0 }
  h1 { font-family:Fraunces,serif; font-size:98px; font-weight:600; line-height:1.02; letter-spacing:-0.02em }
  h1 span { color:#E8B04B }
  .sub { font-family:'Spline Sans Mono',monospace; font-size:20px; letter-spacing:0.22em; text-transform:uppercase; color:rgba(250,250,248,0.55) }
  svg.river { position:absolute; right:-40px; top:-30px; height:720px; z-index:1; opacity:0.9 }
</style></head><body>
  <svg class="river" viewBox="0 0 360 560" fill="none">
    <path d="M150 8 C 143 60, 172 95, 163 135 S 138 205, 152 245 S 178 300, 167 340 S 149 400, 172 445 S 192 505, 180 556" stroke="rgba(43,108,176,0.4)" stroke-width="14" stroke-linecap="round"/>
    <path d="M150 8 C 143 60, 172 95, 163 135 S 138 205, 152 245 S 178 300, 167 340 S 149 400, 172 445 S 192 505, 180 556" stroke="#E8B04B" stroke-width="3" stroke-linecap="round"/>
    <circle cx="163" cy="135" r="7" fill="#E8B04B"/><circle cx="152" cy="245" r="7" fill="#E8B04B"/>
    <circle cx="167" cy="340" r="7" fill="#E8B04B"/><circle cx="172" cy="445" r="7" fill="#E8B04B"/>
  </svg>
  <div class="wrap">
    <div class="mark"><span class="rt">RT</span><span class="name">REALTY<b>LT</b></span></div>
    <h1>Let&rsquo;s find<br><span>home</span>.</h1>
    <p class="sub">Hudson Valley · Six counties · One river</p>
  </div>
</body></html>`;

fs.writeFileSync("scripts/_og.html", html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto(`file:///${process.cwd().replace(/\\/g, "/")}/scripts/_og.html`, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await p.screenshot({ path: "public/og.png" });
await b.close();
fs.unlinkSync("scripts/_og.html");
console.log("public/og.png written");
