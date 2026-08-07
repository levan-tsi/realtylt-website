// Round 24 §4: the plan quiz, driven end to end (design: docs/parity/DESIGN-ROUND24.md).
// Full buyer path -> the tailored plan must show priceForMonthly's own answer, the search
// link must carry exactly the chosen tokens, and the optional hand-off must POST the
// qualifier + consent. **/api/lead IS INTERCEPTED — the local form posts to the LIVE CRM
// webhook otherwise ([[infra-lead-webhook-is-live]]).
import { chromium } from "playwright";

const base = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
await c.route("**/api/media/**", (r) => r.abort());

let leadBody = null;
await c.route("**/api/lead", async (route) => {
  leadBody = JSON.parse(route.request().postData() ?? "null");
  await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
});

const p = await c.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));

let pass = 0, fail = 0;
const check = (name, ok, detail = "") => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "ok " : "FAIL"} ${name}${detail ? " | " + detail : ""}`);
};

// 1. The rail's entry: /plan?quiz=1 opens the takeover on arrival.
await p.goto(base + "/plan?quiz=1", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(2500);
check("?quiz=1 opens the takeover", await p.locator('[role="dialog"]').isVisible());
await p.screenshot({ path: "docs/design-r24/quiz-step1-1440.png" });

// 2. The buyer path.
const pickShape = async (label) => {
  await p.locator('[role="dialog"] button', { hasText: label }).first().click();
  await p.waitForTimeout(450);
};
await pickShape("Buying");
await pickShape("3 to 6 months");
await p.screenshot({ path: "docs/design-r24/quiz-monthly-1440.png" });
await pickShape("$3,200");
await pickShape("Pre-approved");
await pickShape("Dutchess County, NY");
await pickShape("Queens, NY");
await pickShape("Continue");
await pickShape("House");
await pickShape("Central air");
await pickShape("Garage");
await p.screenshot({ path: "docs/design-r24/quiz-musthaves-1440.png" });
await pickShape("See my plan");
await p.waitForTimeout(1500);

check("takeover closed after the last step", !(await p.locator('[role="dialog"]').isVisible()));

// Owner's round-24b report ("see my plan... nothing happened"): closing must LAND on the
// plan — scrolled to the top of the viewport and holding focus, not merely existing.
await p.waitForTimeout(900); // smooth scroll settles
const landing = await p.evaluate(() => {
  const el = document.getElementById("your-plan-heading");
  const r = el?.getBoundingClientRect();
  return { top: r ? Math.round(r.top) : null, focused: document.activeElement?.id === "your-plan-heading" };
});
check("plan is scrolled into the eye line", landing.top !== null && landing.top >= -10 && landing.top < 260, `top=${landing.top}`);
check("plan heading holds focus", landing.focused);

// 3. The tailored plan on the page.
const planText = await p.locator("section:has(#your-plan-heading)").textContent();
check("ceiling equals the bridge's own answer for $3,200/mo", planText?.includes("$585,000") ?? false);
check("next stage is the search (pre-approved buyer)", planText?.includes("Search with the map") ?? false);
check("both chosen areas listed", (planText?.includes("Dutchess") && planText?.includes("Queens")) ?? false);

const searchHref = await p.locator('a:has-text("See matching homes")').getAttribute("href");
const sp = new URLSearchParams((searchHref ?? "").split("?")[1] ?? "");
check(
  "search link carries exactly the chosen tokens",
  sp.get("homeType") === "house" && sp.get("priceMax") === "585000" && sp.get("centralAir") === "1" && sp.get("garageMin") === "1" && !sp.get("county"),
  searchHref ?? "no href",
);

// Live counts arrive for the chosen areas.
await p.waitForTimeout(4000);
const planText2 = await p.locator("section:has(#your-plan-heading)").textContent();
check("live counts rendered", /active homes/.test(planText2 ?? ""));
await p.screenshot({ path: "docs/design-r24/quiz-plan-1440.png", fullPage: false });

// 4. The hand-off POST: qualifier + consent, intercepted.
await p.fill('input[name="name"]', "Probe Person");
await p.fill('input[name="email"]', "probe@example.com");
await p.fill('input[name="phone"]', "917-555-0100");
await p.check('input[name="consentToContact"]');
await p.click('button:has-text("Send my plan")');
await p.waitForTimeout(1200);
check("success status shown", await p.locator('[role="status"]:has-text("Plan sent")').isVisible());
check("lead POST intercepted", !!leadBody);
if (leadBody) {
  const q = leadBody.qualifier ?? {};
  check(
    "qualifier carries the answers + searchUrl",
    q.path === "buying" && q.monthlyBudget === "3200" && q.priceCeiling === "585000" && q.homeType === "house" &&
      (q.areas ?? "").includes("dutchess") && (q.mustHaves ?? "").includes("centralAir") && (q.searchUrl ?? "").startsWith("/search?"),
    JSON.stringify(q).slice(0, 140),
  );
  check("consent rides as the checkbox value", leadBody.consentToContact === "true");
  check("interest reason is the buying one", leadBody.interestReason === "I'm interested in buying a home");
}

// 5. Escape mid-quiz keeps the plan: reopen, Escape, plan still there.
await p.click('button:has-text("Keep planning")');
await p.waitForTimeout(500);
await p.keyboard.press("Escape");
await p.waitForTimeout(400);
check("Escape closes and the plan stays", !(await p.locator('[role="dialog"]').isVisible()) && (await p.locator("#your-plan-heading").isVisible()));

// 6. 390: the takeover is a usable sheet.
const m = await b.newContext({ viewport: { width: 390, height: 844 } });
await m.route("**/api/media/**", (r) => r.abort());
await m.route("**/api/lead", (r) => r.fulfill({ status: 200, body: "{}" }));
const mp = await m.newPage();
await mp.goto(base + "/plan?quiz=1", { waitUntil: "domcontentloaded", timeout: 60000 });
await mp.waitForTimeout(2500);
check("390 takeover visible", await mp.locator('[role="dialog"]').isVisible());
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("390 no horizontal overflow", overflow === 0, `overflow=${overflow}`);
await mp.screenshot({ path: "docs/design-r24/quiz-step1-390.png" });
await m.close();

// 7. JS-off honesty: the served HTML is the static page, quiz layered on only with JS.
const html = await (await fetch(base + "/plan")).text();
check("static /plan HTML keeps the four stages", html.includes("Four stages"));
check("static /plan HTML carries no tailored plan", !html.includes("Your plan so far"));

console.log("page errors:", errs.length ? errs : "none");
console.log(`PASS ${pass} FAIL ${fail}`);
process.exit(fail === 0 ? 0 : 1);
