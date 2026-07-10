import { describe, expect, it } from "vitest";
import { POST } from "./route";

const json = "application/json";
function post(body: string, contentType?: string) {
  const headers: Record<string, string> = {};
  if (contentType) headers["content-type"] = contentType;
  return POST(new Request("http://localhost/api/lead", { method: "POST", headers, body }));
}

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
