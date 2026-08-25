import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE CHAT WIDGET'S ENDPOINT MUST BE REACHABLE UNDER OUR OWN CSP.
 *
 * On 2026-08-20 the chat cutover (115ec56) changed one line in `public/rlt-chat.js` — WEBHOOK_URL
 * moved from the n8n webhook to the CRM's `/api/chat/agent` on realtylt-crm-web.vercel.app. The
 * CSP in next.config.ts still listed only the n8n host, so on production every message a visitor
 * sent was refused by the browser before it left the page: "Refused to connect because it violates
 * the document's Content Security Policy". Measured, not guessed — a fetch to that origin from the
 * site's own page context returns "Failed to fetch".
 *
 * Nothing failed loudly. The widget still opened, still accepted typing, still looked alive. Two
 * files that have to agree lived in different directories and drifted, which is the whole class of
 * bug this guards: any future re-point of the widget (back to n8n, on to somewhere else) fails here
 * until the CSP follows it.
 */
const ROOT = path.resolve(__dirname, "..");

function widgetEndpointOrigins(): string[] {
  const js = fs.readFileSync(path.join(ROOT, "public", "rlt-chat.js"), "utf8");
  // Every host the widget fetches from must clear the CSP, not only the message endpoint. Since
  // 2026-08-24 the widget also POSTs SESSION_URL to mint its session id + ownership token (C1);
  // if that host is not allowed, the widget cannot start a session and silently falls back to a
  // memoryless local id. Both live values, not the commented-out rollback line above WEBHOOK_URL.
  const keys = ["WEBHOOK_URL", "SESSION_URL"];
  return keys.map((k) => {
    const m = js.match(new RegExp("^\\s*" + k + ":\\s*['\"]([^'\"]+)['\"]", "m"));
    if (!m) throw new Error(`rlt-chat.js: no ${k} found`);
    return new URL(m[1]).origin;
  });
}

function connectSrc(): string[] {
  const cfg = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  const m = cfg.match(/"connect-src ([^"]*)"/);
  if (!m) throw new Error("next.config.ts: no connect-src directive found");
  return m[1].split(/\s+/).filter(Boolean);
}

/** 'self' and wildcard hosts both count, the same way a browser counts them. */
function allows(sources: string[], origin: string): boolean {
  const { host, protocol } = new URL(origin);
  return sources.some((s) => {
    if (s === "'self'") return false; // a cross-origin endpoint is never 'self' here
    let src = s;
    if (src.startsWith("https://")) src = src.slice(8);
    else if (src.startsWith("http://")) src = src.slice(7);
    else if (protocol !== "https:") return false;
    if (src.startsWith("*.")) return host === src.slice(2) || host.endsWith("." + src.slice(2));
    return src === host;
  });
}

describe("the chat widget and the site's CSP", () => {
  it("reads both files at all (the scan must not silently match nothing)", () => {
    const origins = widgetEndpointOrigins();
    expect(origins).toHaveLength(2);
    origins.forEach((o) => expect(o).toMatch(/^https:\/\//));
    expect(connectSrc().length).toBeGreaterThan(5);
  });

  it("allows every origin the widget posts to (message endpoint AND session mint)", () => {
    const sources = connectSrc();
    for (const origin of widgetEndpointOrigins()) {
      expect(
        allows(sources, origin),
        `connect-src does not allow ${origin}, so the browser refuses the widget's request to it`,
      ).toBe(true);
    }
  });

  it("recognises a wildcard source, so the matcher is not accidentally exact-only", () => {
    expect(allows(["https://*.example.com"], "https://a.example.com")).toBe(true);
    expect(allows(["https://*.example.com"], "https://example.com")).toBe(true);
    expect(allows(["https://*.example.com"], "https://a.notexample.com")).toBe(false);
    expect(allows(["'self'"], "https://elsewhere.test")).toBe(false);
  });
});
