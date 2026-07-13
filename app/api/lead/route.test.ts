import { beforeEach, describe, expect, it } from "vitest";
import { resetLeadRateLimitForTests } from "@/lib/leads";
import { POST } from "./route";

const json = "application/json";
function post(body: string, contentType?: string, ip?: string) {
  const headers: Record<string, string> = {};
  if (contentType) headers["content-type"] = contentType;
  if (ip) headers["x-forwarded-for"] = ip;
  return POST(new Request("http://localhost/api/lead", { method: "POST", headers, body }));
}

// Each test gets a fresh throttle window (tests here share one module instance).
beforeEach(() => resetLeadRateLimitForTests());

describe("POST /api/lead — input hardening", () => {
  it("rejects a non-JSON content-type with 415", async () => {
    const res = await post("{}", "text/plain");
    expect(res.status).toBe(415);
    expect((await res.json()).ok).toBe(false);
  });

  it("rejects a missing content-type with 415", async () => {
    const res = await post("{}");
    expect(res.status).toBe(415);
  });

  it("rejects an oversized body with 413", async () => {
    const big = JSON.stringify({ name: "A".repeat(20000), email: "a@b.com" });
    const res = await post(big, json);
    expect(res.status).toBe(413);
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await post("not json", json);
    expect(res.status).toBe(400);
  });

  it("drops a honeypot hit silently (200, no error) and never inserts", async () => {
    const res = await post(JSON.stringify({ name: "Bot", email: "b@b.com", rlt_hp: "x" }), json);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("rejects a missing name with 400 and a generic (non-echoing) message", async () => {
    const res = await post(JSON.stringify({ email: "a@b.com" }), json);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Name is required.");
  });
});

describe("POST /api/lead — per-IP rate limit", () => {
  // Honeypot body: the handler returns 200 without ever reaching the CRM webhook.
  const body = JSON.stringify({ name: "Bot", email: "b@b.com", rlt_hp: "x" });

  it("still passes normal submissions, then throttles the 9th in a window with 429", async () => {
    for (let i = 0; i < 8; i++) {
      expect((await post(body, json, "203.0.113.9")).status).toBe(200);
    }
    const res = await post(body, json, "203.0.113.9");
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      ok: false,
      error: "Too many requests. Please try again shortly.",
    });
  });

  it("keeps other IPs unaffected (windows are per-IP)", async () => {
    for (let i = 0; i < 9; i++) await post(body, json, "203.0.113.9");
    expect((await post(body, json, "198.51.100.7")).status).toBe(200);
  });
});
