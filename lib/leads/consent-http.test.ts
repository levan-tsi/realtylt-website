import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/lead/route";
import { CONSENT_SELLER, CONSENT_TEXT, CONSENT_VERSION } from "./consent";

/** CONSENT, OVER A REAL SOCKET.
 *
 * `consent.test.ts` calls `parseLead` directly, which proves the record is built correctly but
 * cannot prove the ROUTE hands it on. The handoff for this round asked for the forgery attempt
 * to be made "over HTTP too", and the reason is specific: everything that makes the record
 * evidence rather than a claim — the server clock, the caller's IP, the agreement text — is
 * stamped on the request path, and a unit test supplies those itself.
 *
 * So this drives the real `POST` handler across a real socket, and captures what the CRM would
 * actually receive by pointing `CRM_LEAD_WEBHOOK` at a second local server. That matters: the
 * route's own response says only `{ok:true}`, so asserting on it would prove nothing about what
 * was recorded. The captured webhook body IS the lead as the CRM sees it.
 *
 * Nothing here can reach production — the webhook env var is overwritten with a loopback URL
 * for the lifetime of this file and restored afterwards.
 */

let hook: http.Server;
let app: http.Server;
let appUrl = "";
let captured: Record<string, any>[] = [];
const realWebhook = process.env.CRM_LEAD_WEBHOOK;

const listen = (s: http.Server) =>
  new Promise<number>((resolve) => s.listen(0, "127.0.0.1", () => resolve((s.address() as AddressInfo).port)));

/** Each request gets its own client IP: the route throttles at 8/min per IP, and a shared one
 * would turn later assertions into 429s that look like consent failures. */
let ipCounter = 0;
const nextIp = () => `198.51.100.${(ipCounter++ % 250) + 1}`;

async function post(
  body: unknown,
  opts: { ip?: string; contentType?: string | null; raw?: string } = {},
) {
  const ip = opts.ip ?? nextIp();
  const headers: Record<string, string> = { "x-forwarded-for": ip };
  if (opts.contentType !== null) headers["content-type"] = opts.contentType ?? "application/json";
  const res = await fetch(appUrl, {
    method: "POST",
    headers,
    body: opts.raw ?? JSON.stringify(body),
  });
  return { res, json: await res.json().catch(() => null), ip };
}

/** The lead the CRM received for a given email — the record under test. */
const received = (email: string) => captured.find((l) => l.email === email);

beforeAll(async () => {
  hook = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        captured.push(JSON.parse(raw));
      } catch {
        captured.push({ __unparseable: raw });
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end('{"ok":true}');
    });
  });
  const hookPort = await listen(hook);
  process.env.CRM_LEAD_WEBHOOK = `http://127.0.0.1:${hookPort}/hook`;
  // LEAD_TEST_MODE would short-circuit to the stub writer and never build a webhook payload,
  // which is exactly the half of the path this file exists to test.
  delete process.env.LEAD_TEST_MODE;

  app = http.createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const body = Buffer.concat(chunks);
    // Hop-by-hop headers are meaningless to a Request and undici rejects some of them.
    const skip = new Set(["connection", "keep-alive", "transfer-encoding", "host"]);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (skip.has(k) || v == null) continue;
      headers.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    const response = await POST(
      new Request(`http://127.0.0.1${req.url}`, { method: "POST", headers, body }),
    );
    res.writeHead(response.status, { "content-type": "application/json" });
    res.end(Buffer.from(await response.arrayBuffer()));
  });
  const appPort = await listen(app);
  appUrl = `http://127.0.0.1:${appPort}/api/lead`;
});

afterAll(async () => {
  if (realWebhook === undefined) delete process.env.CRM_LEAD_WEBHOOK;
  else process.env.CRM_LEAD_WEBHOOK = realWebhook;
  await Promise.all([
    new Promise((r) => hook.close(r)),
    new Promise((r) => app.close(r)),
  ]);
});

describe("consent over HTTP — what the CRM actually receives", () => {
  it("stamps the whole agreement onto a lead that ticked the box", async () => {
    const email = "granted@example.com";
    const { res, ip } = await post({
      name: "Ada Lovelace",
      email,
      phone: "917-555-0142",
      interestReason: "I'm interested in buying a home",
      consentToContact: true,
      source: "/listing/KEY123",
    });
    expect(res.status).toBe(200);
    const c = received(email)?.consent;
    expect(c).toBeDefined();
    expect(c.granted).toBe(true);
    expect(c.text).toBe(CONSENT_TEXT);
    expect(c.version).toBe(CONSENT_VERSION);
    expect(c.seller).toBe(CONSENT_SELLER);
    expect(c.phone).toBe("917-555-0142");
    expect(c.source).toBe("/listing/KEY123");
    // The IP is read from the request, never from the body.
    expect(c.ip).toBe(ip);
    // Server clock, not the client's.
    expect(Math.abs(Date.now() - Date.parse(c.at))).toBeLessThan(60_000);
  });

  /** A declined box and no box at all mean opposite things to whoever is about to press dial. */
  it("records a refusal rather than dropping it", async () => {
    const email = "declined@example.com";
    await post({ name: "Ada", email, phone: "917-555-0143", interestReason: "I'm interested in buying a home" });
    expect(received(email)?.consent?.granted).toBe(false);
    expect(received(email)?.consent?.text).toBe(CONSENT_TEXT);
  });

  it("submits perfectly well unticked — agreeing is never a condition", async () => {
    const email = "optional@example.com";
    const { res } = await post({
      name: "Ada",
      email,
      phone: "917-555-0144",
      interestReason: "I'm interested in selling a home",
    });
    expect(res.status).toBe(200);
    expect(received(email)).toBeDefined();
  });

  it("carries no consent at all when there is no number to call", async () => {
    const email = "nophone@example.com";
    await post({ name: "Ada", email, interestReason: "I'm interested in buying a home", consentToContact: true });
    expect(received(email)).toBeDefined();
    expect(received(email)!.consent).toBeUndefined();
  });

  /** The forgery attempt the handoff asked for, made the way an attacker would make it. */
  it("overwrites every field a forged body tries to supply but `granted`", async () => {
    const email = "forged@example.com";
    const { ip } = await post({
      name: "Mallory",
      email,
      phone: "917-555-0145",
      interestReason: "I'm interested in buying a home",
      consentToContact: true,
      consent: {
        granted: true,
        at: "1999-01-01T00:00:00.000Z",
        ip: "1.1.1.1",
        text: "I agree to absolutely anything forever",
        version: "forged.v1",
        seller: "Someone Else",
        source: "/somewhere-they-never-were",
        phone: "000-000-0000",
      },
    });
    const c = received(email)?.consent;
    expect(c.at).not.toBe("1999-01-01T00:00:00.000Z");
    expect(new Date(c.at).getUTCFullYear()).toBeGreaterThan(2020);
    expect(c.ip).toBe(ip);
    expect(c.text).toBe(CONSENT_TEXT);
    expect(c.version).toBe(CONSENT_VERSION);
    expect(c.seller).toBe(CONSENT_SELLER);
    expect(c.phone).toBe("917-555-0145");
    expect(c.source).not.toBe("/somewhere-they-never-were");
  });

  /** `granted` is the one thing the client decides, so it must not be forgeable INTO a yes by
   * any spelling other than a real tick. */
  it.each([
    ["yes", false],
    ["1", false],
    [1, false],
    ["TRUE", false],
    [{}, false],
    [["true"], false],
    ["true", true],
    ["on", true],
    [true, true],
  ])("reads consentToContact=%p as granted=%p", async (input, expected) => {
    const email = `coerce-${JSON.stringify(input)}@example.com`;
    await post({
      name: "Ada",
      email,
      phone: "917-555-0146",
      interestReason: "I'm interested in buying a home",
      consentToContact: input,
    });
    expect(received(email)?.consent?.granted).toBe(expected);
  });
});

describe("the lead route's front door", () => {
  it("refuses a body that is not JSON-typed", async () => {
    const { res } = await post({ name: "Ada" }, { contentType: "application/x-www-form-urlencoded" });
    expect(res.status).toBe(415);
  });

  it("refuses an oversized body before parsing it", async () => {
    const { res } = await post(null, {
      raw: JSON.stringify({ name: "Ada", message: "x".repeat(20_000) }),
    });
    expect(res.status).toBe(413);
  });

  it("refuses malformed JSON", async () => {
    const { res } = await post(null, { raw: "{not json" });
    expect(res.status).toBe(400);
  });

  it("throttles a single IP rather than letting it hammer the CRM", async () => {
    const ip = "198.51.100.254";
    const codes: number[] = [];
    for (let i = 0; i < 10; i++) {
      const { res } = await post(
        { name: "Ada", email: `flood${i}@example.com`, interestReason: "I'm interested in buying a home" },
        { ip },
      );
      codes.push(res.status);
    }
    expect(codes.filter((c) => c === 429).length).toBeGreaterThan(0);
  });
});
