// THE SEO AUDIT (final round beat 3, owner 2026-09-18): "double check the SEO if we're using
// correct amounts of internal and external linking and proper keywords and everything."
// A committed scorer, so "SEO checked" is a number and not a sentence.
//
// It reads what a CRAWLER THAT RUNS NO JAVASCRIPT gets: pages are fetched with a Bingbot UA and
// parsed as HTML, no browser. MEASURED 2026-09-18 (Next 15.3): with a Googlebot or Chrome UA a
// dynamically rendered page STREAMS its metadata into <body> (title at byte 37,260, </head> at
// 2,075 on /who-we-are) and React hoists it after hydration; Bingbot and facebookexternalhit
// are on Next's html-limited list and get it blocking, inside <head>. So the head checks below
// hold for the strictest reader. In dev EVERY page is dynamic; on prod the posts and services
// are static and carry their metadata in <head> for everyone.
// Surfaces = every <loc> in /sitemap.xml plus every /blog/* and /services/* on the indexes.
// /ai is another repo's page behind a rewrite and is not audited here.
//
//   META       title present, page part <= 60 chars (the " | RealtyLT" suffix may truncate
//              harmlessly); description 70-160; exactly one h1; canonical = own URL; og:title,
//              og:description, og:image, og:url (= canonical), twitter:card; no noindex;
//              titles, descriptions and h1s unique across the site
//   KEYWORDS   services: the primary keyword's words all appear in title+h1+description, and
//              some keyword phrase's words all appear in the first 100 words of prose
//   LINKS-IN   every post links its service page and >= 2 other posts; every service links
//              its post and >= 2 other services; nothing is an orphan (>= 1 inbound link from
//              a page that is not an index)
//   ANCHORS    every internal link in <main> gives a crawler real anchor text: visible text,
//              an img alt, or a title attribute. aria-label alone is NOT anchor text (Google's
//              link best practices name text, img alt and title; nothing else). No "click
//              here" / "read more" / "learn more" / "here" as the whole anchor.
//   LINKS-OUT  target=_blank carries rel noopener; citations are followed (no nofollow on an
//              editorial source); with --external every unique outbound URL is fetched:
//              404/410/5xx/DNS = FAIL, 401/403/429 = "bot-blocked, check by hand" (listed)
//   SITEMAP    every post and service is in the sitemap and every sitemap path resolves 200
//   JSON-LD    every block parses; posts carry BlogPosting (headline, datePublished, author),
//              services carry Service; FAQPage where the page shows FAQs
//
// Usage:
//   node scripts/seo-audit.mjs                 # everything except outbound fetches
//   node scripts/seo-audit.mjs --external      # also fetch every outbound link (slow, polite)
//   node scripts/seo-audit.mjs --only /blog/x  # one surface, every finding
//   node scripts/seo-audit.mjs --report out.json

import fs from "node:fs";

const BASE = process.env.BASE || "http://127.0.0.1:3100";
const BOT = "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";
const BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const TITLE_MAX = 60, DESC_MIN = 70, DESC_MAX = 160;
/** Hosts that answer a non-browser fetch with a status that is NOT a 401/403/429 although the
 * page is alive. Each entry is a measurement: developers.facebook.com returned 400 to fetch and
 * 200 "Versioning - Graph API" in Chromium on 2026-09-18. */
const BOT_WALLS = /^https:\/\/developers\.facebook\.com\//;
const LAZY_ANCHORS = new Set(["click here", "here", "read more", "learn more", "more", "this", "link"]);
const STOP = new Set(["for", "in", "of", "the", "a", "an", "to", "my", "your", "and", "with", "that", "on"]);

const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
const only = arg("--only");
const reportPath = arg("--report");
const doExternal = process.argv.includes("--external");

const dec = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;|&rsquo;|&lsquo;/g, "'").replace(/&quot;|&rdquo;|&ldquo;/g, '"')
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&[a-z]+;/g, " ");
const text = (html) => dec(html.replace(/<(script|style|noscript|svg)[\s>][\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i")); return m ? dec(m[1]) : null; };
const words = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
/** "agents" matches "agent", "invoicing" matches "invoice", "automated" matches "automation":
 * compare on a crude stem. Crude on purpose: it only ever has to agree with itself. */
const stem = (w) => (w.length <= 4 ? w : w.replace(/ies$/, "y").replace(/(?:ing|ion|ed|es|s|e)$/, ""));
const hasAll = (needle, hay) => { const h = new Set(words(hay).map(stem)); return words(needle).filter((w) => !STOP.has(w)).every((w) => h.has(stem(w))); };

async function get(path, ua = BOT) {
  const res = await fetch(`${BASE}${path}`, { headers: { "user-agent": ua }, redirect: "manual", signal: AbortSignal.timeout(90_000) });
  return { status: res.status, html: res.status === 200 ? await res.text() : "" };
}

/** Everything the checks need from one page, parsed once. Pure. */
export function parsePage(html) {
  const head = html.slice(0, Math.max(0, html.indexOf("</head>")));
  const metaTag = (key, val) => (html.match(new RegExp(`<meta[^>]*\\s${key}="${val}"[^>]*>`, "i")) || [null])[0];
  const content = (tag) => (tag ? attr(tag, "content") : null);
  const main = html.match(/<main[\s>][\s\S]*?<\/main>/i)?.[0] ?? "";
  const mainClean = main.replace(/<(script|style|noscript)[\s>][\s\S]*?<\/\1>/gi, " ");
  const links = [...mainClean.matchAll(/<a(\s[^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => {
    const tag = `<a${m[1]}>`;
    const inner = m[2];
    const alt = [...inner.matchAll(/<img[^>]*\salt="([^"]*)"/gi)].map((x) => dec(x[1])).join(" ").trim();
    return {
      href: attr(tag, "href") || "",
      text: text(inner),
      alt,
      title: attr(tag, "title") || "",
      aria: attr(tag, "aria-label") || "",
      rel: (attr(tag, "rel") || "").toLowerCase(),
      blank: /\starget="_blank"/i.test(tag),
    };
  });
  const prose = [...mainClean.matchAll(/<(p|li)[\s>][\s\S]*?<\/\1>/gi)].map((m) => text(m[0])).join(" ");
  const jsonld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => {
    try { return JSON.parse(m[1]); } catch (e) { return { PARSE_ERROR: String(e).slice(0, 80) }; }
  });
  return {
    title: dec((html.match(/<title>([^<]*)<\/title>/i) || [, ""])[1]),
    titleInHead: /<title>/i.test(head),
    description: content(metaTag("name", "description")) || "",
    robots: content(metaTag("name", "robots")) || "",
    canonical: attr((html.match(/<link[^>]*\srel="canonical"[^>]*>/i) || [""])[0] || "<x>", "href") || "",
    og: Object.fromEntries(["og:title", "og:description", "og:image", "og:url", "og:type"].map((k) => [k, content(metaTag("property", k)) || ""])),
    twitterCard: content(metaTag("name", "twitter:card")) || "",
    // Counted across the whole document: /search keeps its sr-only h1 outside <main> (the map
    // owns that box), and a crawler does not care which landmark an h1 sits in.
    h1s: [...html.replace(/<(script|style|noscript)[\s>][\s\S]*?<\/\1>/gi, " ").matchAll(/<h1[\s>][\s\S]*?<\/h1>/gi)].map((m) => text(m[0])),
    links,
    first100: words(prose).slice(0, 100).join(" "),
    hasFaqUi: /<details|faq/i.test(mainClean),
    jsonld,
  };
}

const typesOf = (blocks) => blocks.flatMap((b) => (Array.isArray(b) ? b : b["@graph"] || [b])).map((b) => b["@type"]).flat().filter(Boolean);
const pathOf = (url) => { try { return new URL(url, BASE).pathname.replace(/\/$/, "") || "/"; } catch { return url; } };

/** Service keyword arrays, read from source: the page does not print them. */
function serviceKeywords() {
  const out = {};
  for (const f of fs.readdirSync("content/services").filter((x) => x.endsWith(".ts") && !/^(index|types)\./.test(x))) {
    const s = fs.readFileSync(`content/services/${f}`, "utf8");
    const slug = (s.match(/slug:\s*"([^"]+)"/) || [])[1];
    const kw = (s.match(/keywords:\s*\[([\s\S]*?)\]/) || [, ""])[1];
    const posts = (s.match(/relatedPosts:\s*\[([\s\S]*?)\]/) || [, ""])[1];
    if (slug) out[slug] = { keywords: [...kw.matchAll(/"([^"]+)"/g)].map((m) => m[1]), relatedPosts: [...posts.matchAll(/"([^"]+)"/g)].map((m) => m[1]) };
  }
  return out;
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("seo-audit.mjs");
if (isMain) {
  const findings = {}; // path -> [string]
  const flag = (p, msg) => (findings[p] ||= []).push(msg);

  // ---- surfaces -------------------------------------------------------------------------
  const sm = await get("/sitemap.xml");
  const sitemapPaths = [...sm.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => pathOf(m[1]));
  const indexed = new Set();
  for (const idx of ["/blog", "/services"]) {
    const { html } = await get(idx);
    for (const m of html.matchAll(/href="(\/(?:blog|services)\/[a-z0-9-]+)"/g)) indexed.add(m[1]);
  }
  const all = [...new Set([...sitemapPaths, ...indexed])].filter((p) => p !== "/ai");
  const surfaces = only ? [only] : all;
  for (const p of indexed) if (!sitemapPaths.includes(p)) flag(p, "SITEMAP: on an index page but missing from sitemap.xml");

  // ---- fetch + parse --------------------------------------------------------------------
  const pages = {};
  for (const p of surfaces) {
    const { status, html } = await get(p);
    if (status !== 200) { flag(p, `STATUS ${status}`); continue; }
    pages[p] = parsePage(html);
  }

  const kw = serviceKeywords();
  const isPost = (p) => /^\/blog\/[a-z0-9-]+$/.test(p);
  const isService = (p) => /^\/services\/[a-z0-9-]+$/.test(p);
  /** post slug -> service path, from the services' own relatedPosts[0] (the topic's post). */
  const serviceOfPost = {};
  for (const [slug, v] of Object.entries(kw)) if (v.relatedPosts[0]) serviceOfPost[v.relatedPosts[0]] ??= `/services/${slug}`;

  // ---- per page -------------------------------------------------------------------------
  const seen = { title: {}, description: {}, h1: {} };
  const inbound = {}; // path -> Set(from)
  const external = {}; // url -> first page
  for (const [p, d] of Object.entries(pages)) {
    const core = d.title.replace(/\s*\|\s*RealtyLT\s*$/i, "");
    if (!d.title) flag(p, "META: no <title>");
    else if (core.length > TITLE_MAX) flag(p, `META: title ${core.length} chars > ${TITLE_MAX}: "${core}"`);
    if (!d.titleInHead) flag(p, "META: <title> is not inside <head> for a crawler");
    if (!d.description) flag(p, "META: no meta description");
    else if (d.description.length > DESC_MAX || d.description.length < DESC_MIN) flag(p, `META: description ${d.description.length} chars outside ${DESC_MIN}-${DESC_MAX}`);
    if (d.h1s.length !== 1) flag(p, `META: ${d.h1s.length} h1 elements`);
    if (/noindex/i.test(d.robots)) flag(p, `META: robots "${d.robots}" on a sitemap page`);
    if (!d.canonical) flag(p, "META: no canonical");
    else if (pathOf(d.canonical) !== p) flag(p, `META: canonical points at ${pathOf(d.canonical)}`);
    for (const k of ["og:title", "og:description", "og:image", "og:url"]) if (!d.og[k]) flag(p, `META: missing ${k}`);
    if (d.og["og:url"] && d.canonical && d.og["og:url"].replace(/\/$/, "") !== d.canonical.replace(/\/$/, "")) flag(p, `META: og:url ${d.og["og:url"]} != canonical`);
    if (!d.twitterCard) flag(p, "META: missing twitter:card");
    (seen.title[d.title] ||= []).push(p);
    if (d.description) (seen.description[d.description] ||= []).push(p);
    if (d.h1s[0]) (seen.h1[d.h1s[0]] ||= []).push(p);

    if (isService(p)) {
      const k = kw[p.split("/").pop()];
      if (!k || !k.keywords.length) flag(p, "KEYWORDS: no keywords array in source");
      else {
        const front = `${d.title} ${d.h1s.join(" ")} ${d.description}`;
        if (!hasAll(k.keywords[0], front)) flag(p, `KEYWORDS: primary "${k.keywords[0]}" not covered by title + h1 + description`);
        if (!k.keywords.some((x) => hasAll(x, d.first100))) flag(p, `KEYWORDS: no keyword phrase is covered by the first 100 words (${k.keywords.slice(0, 3).join(" | ")})`);
      }
    }

    const internal = d.links.filter((l) => l.href.startsWith("/") && !l.href.startsWith("//"));
    for (const l of internal) {
      const to = pathOf(l.href.split("#")[0] || "/");
      if (to !== p && !["/blog", "/services", "/"].includes(p)) (inbound[to] ||= new Set()).add(p);
      const anchor = (l.text || l.alt || l.title).trim();
      if (!anchor) flag(p, `ANCHORS: empty anchor text -> ${l.href}${l.aria ? ` (aria-label only: "${l.aria.slice(0, 50)}")` : ""}`);
      else if (LAZY_ANCHORS.has(anchor.toLowerCase())) flag(p, `ANCHORS: lazy anchor "${anchor}" -> ${l.href}`);
    }
    for (const l of d.links.filter((x) => /^https?:\/\//.test(x.href))) {
      const host = new URL(l.href).host;
      if (l.blank && !/noopener/.test(l.rel)) flag(p, `LINKS-OUT: target=_blank without rel=noopener -> ${l.href}`);
      const isShare = /facebook\.com\/sharer|linkedin\.com\/sharing|twitter\.com\/intent|x\.com\/intent/.test(l.href);
      if (!isShare && /nofollow/.test(l.rel) && !/ugc|sponsored/.test(l.rel)) flag(p, `LINKS-OUT: editorial source is nofollow -> ${host}`);
      if (!isShare) external[l.href.split("#")[0]] ??= p;
    }

    if (isPost(p)) {
      const slug = p.split("/").pop();
      const svc = serviceOfPost[slug];
      const posts = new Set(internal.map((l) => pathOf(l.href.split("#")[0])).filter((x) => isPost(x) && x !== p));
      if (svc && !internal.some((l) => pathOf(l.href.split("#")[0]) === svc)) flag(p, `LINKS-IN: does not link its service page ${svc}`);
      if (posts.size < 2) flag(p, `LINKS-IN: links ${posts.size} other posts (< 2)`);
      // A post's keyword is the phrase its slug was chosen for. The H1 is a story line and is
      // allowed to carry none of it; the <title> tag is not (BlogPost.seoTitle).
      const slugWords = [...new Set(words(slug).filter((w) => !STOP.has(w)).map(stem))];
      const titleWords = new Set(words(d.title).map(stem));
      const shared = slugWords.filter((w) => titleWords.has(w));
      if (shared.length < Math.min(3, slugWords.length)) flag(p, `KEYWORDS: <title> shares ${shared.length} words with the slug (< 3): "${d.title}"`);
      const t = typesOf(d.jsonld);
      if (!t.includes("BlogPosting")) flag(p, "JSON-LD: no BlogPosting");
      else {
        const bp = d.jsonld.flatMap((b) => (Array.isArray(b) ? b : b["@graph"] || [b])).find((b) => b["@type"] === "BlogPosting");
        for (const f of ["headline", "datePublished", "author", "image"]) if (!bp[f]) flag(p, `JSON-LD: BlogPosting missing ${f}`);
        if (bp.dateModified && bp.datePublished && bp.dateModified < bp.datePublished) flag(p, "JSON-LD: dateModified earlier than datePublished");
      }
    }
    if (isService(p)) {
      const slug = p.split("/").pop();
      const post = kw[slug]?.relatedPosts[0];
      const services = new Set(internal.map((l) => pathOf(l.href.split("#")[0])).filter((x) => isService(x) && x !== p));
      if (post && !internal.some((l) => pathOf(l.href.split("#")[0]) === `/blog/${post}`)) flag(p, `LINKS-IN: does not link its post /blog/${post}`);
      if (services.size < 2) flag(p, `LINKS-IN: links ${services.size} other services (< 2)`);
      const t = typesOf(d.jsonld);
      if (!t.includes("Service")) flag(p, "JSON-LD: no Service");
      if (d.hasFaqUi && !t.includes("FAQPage")) flag(p, "JSON-LD: FAQ on the page but no FAQPage");
    }
    for (const b of d.jsonld) if (b.PARSE_ERROR) flag(p, `JSON-LD: does not parse (${b.PARSE_ERROR})`);
  }

  if (!only) {
    for (const [kind, map] of Object.entries(seen)) for (const [val, ps] of Object.entries(map)) if (val && ps.length > 1) for (const p of ps) flag(p, `META: duplicate ${kind} shared with ${ps.filter((x) => x !== p).join(", ")}`);
    for (const p of Object.keys(pages)) if ((isPost(p) || isService(p)) && !(inbound[p] && inbound[p].size)) flag(p, "LINKS-IN: orphan (no inbound link from any non-index page)");
  }

  // ---- outbound -------------------------------------------------------------------------
  const blocked = [];
  if (doExternal) {
    const urls = Object.keys(external);
    console.log(`fetching ${urls.length} unique outbound links (4 at a time)...`);
    const check = async (url) => {
      for (const method of ["HEAD", "GET"]) {
        try {
          const res = await fetch(url, { method, headers: { "user-agent": BROWSER, accept: "text/html,*/*" }, redirect: "follow", signal: AbortSignal.timeout(25_000) });
          if (res.status < 400) return { ok: true };
          if (method === "HEAD") continue; // many hosts refuse HEAD; the GET decides
          return { ok: false, status: res.status };
        } catch (e) {
          if (method === "GET") return { ok: false, status: String(e.cause?.code || e.name || e).slice(0, 40) };
        }
      }
      return { ok: false, status: "?" };
    };
    const queue = [...urls];
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const url = queue.shift();
        const r = await check(url);
        if (r.ok) continue;
        if ([401, 403, 429, 999].includes(r.status) || BOT_WALLS.test(url)) blocked.push(`${r.status} ${url} (first on ${external[url]})`);
        else flag(external[url], `LINKS-OUT: BROKEN ${r.status} -> ${url}`);
      }
    }));
  }

  // ---- report ---------------------------------------------------------------------------
  const checked = Object.keys(pages).length;
  const failing = Object.keys(findings).sort();
  for (const p of failing) {
    console.log(`FAIL  ${p}`);
    const list = findings[p];
    for (const f of only ? list : list.slice(0, 5)) console.log("     ", f);
    if (!only && list.length > 5) console.log(`      ... ${list.length - 5} more (--only ${p})`);
  }
  if (blocked.length) {
    console.log(`\nBOT-BLOCKED outbound hosts (not a failure; open by hand once):`);
    for (const b of blocked) console.log("     ", b);
  }
  const total = failing.reduce((a, p) => a + findings[p].length, 0);
  console.log(`\n${checked - failing.filter((p) => pages[p]).length}/${checked} surfaces clean, ${total} findings${doExternal ? `, ${Object.keys(external).length} outbound links fetched` : " (outbound not fetched: --external)"}`);
  if (reportPath) fs.writeFileSync(reportPath, JSON.stringify({ at: new Date().toISOString(), base: BASE, checked, findings, blocked }, null, 1));
  process.exit(failing.length ? 1 : 0);
}
