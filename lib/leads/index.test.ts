import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import { parseLead, submitLead } from "./index";

const validBody = {
  name: "Jane Buyer",
  email: "jane@example.com",
  phone: "(845) 555-0100",
  message: "Looking in Beacon",
  interestReason: "I'm interested in buying a home",
  rlt_hp: "", // honeypot, empty = human
};

describe("parseLead", () => {
  it("accepts a valid form body and stamps source + ISO timestamp", () => {
    const r = parseLead(validBody, "/selling");
    expect(r.kind).toBe("lead");
    if (r.kind !== "lead") return;
    expect(r.lead.name).toBe("Jane Buyer");
    expect(r.lead.email).toBe("jane@example.com");
    expect(r.lead.interestReason).toBe("I'm interested in buying a home");
    expect(r.lead.source).toBe("/selling");
    expect(new Date(r.lead.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("silently drops submissions with the honeypot filled", () => {
    const r = parseLead({ ...validBody, rlt_hp: "http://spam.example" }, "/");
    expect(r.kind).toBe("spam");
  });

  it("ignores a `website` field — Chrome autofills those for real visitors", () => {
    const r = parseLead({ ...validBody, website: "https://autofilled.example" }, "/");
    expect(r.kind).toBe("lead");
  });

  it("rejects a missing name or email", () => {
    expect(parseLead({ ...validBody, name: "  " }, "/").kind).toBe("invalid");
    expect(parseLead({ ...validBody, email: "not-an-email" }, "/").kind).toBe("invalid");
  });

  it("rejects an interest reason outside the six allowed options", () => {
    const r = parseLead({ ...validBody, interestReason: "hack the CRM" }, "/");
    expect(r.kind).toBe("invalid");
  });

  it("defaults a missing interest reason to 'Other reason to contact an agent'", () => {
    const { interestReason: _drop, ...rest } = validBody;
    const r = parseLead(rest, "/home-value");
    expect(r.kind).toBe("lead");
    if (r.kind !== "lead") return;
    expect(r.lead.interestReason).toBe("Other reason to contact an agent");
  });

  it("carries the optional property address (home-value flow)", () => {
    const r = parseLead({ ...validBody, address: "12 Main St, Beacon NY" }, "/home-value");
    if (r.kind !== "lead") throw new Error("expected lead");
    expect(r.lead.address).toBe("12 Main St, Beacon NY");
  });
});

describe("submitLead", () => {
  const lead = {
    name: "Jane Buyer",
    email: "jane@example.com",
    phone: "",
    message: "",
    interestReason: "I'm interested in buying a home" as const,
    source: "/",
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    if (fs.existsSync(".leads-dev.jsonl")) fs.unlinkSync(".leads-dev.jsonl");
  });

  it("stub mode: no webhook env → ok:true, stub:true, appended to .leads-dev.jsonl", async () => {
    vi.stubEnv("CRM_LEAD_WEBHOOK", "");
    const r = await submitLead(lead);
    expect(r).toEqual({ ok: true, stub: true });
    const line = fs.readFileSync(".leads-dev.jsonl", "utf8").trim().split("\n").pop()!;
    expect(JSON.parse(line).email).toBe("jane@example.com");
  });

  it("LEAD_TEST_MODE=1 forces stub mode even with a live webhook configured", async () => {
    vi.stubEnv("CRM_LEAD_WEBHOOK", "https://crm.example/leads");
    vi.stubEnv("LEAD_TEST_MODE", "1");
    const fetchMock = vi.fn().mockRejectedValue(new Error("webhook must never be called"));
    vi.stubGlobal("fetch", fetchMock);
    const r = await submitLead(lead);
    expect(r).toEqual({ ok: true, stub: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stub mode: read-only filesystem (Vercel) → still ok:true, lead logged in full", async () => {
    vi.stubEnv("CRM_LEAD_WEBHOOK", "");
    vi.spyOn(fs, "appendFileSync").mockImplementation(() => {
      throw Object.assign(new Error("EROFS: read-only file system"), { code: "EROFS" });
    });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const r = await submitLead(lead);
    expect(r).toEqual({ ok: true, stub: true });
    const logged = logSpy.mock.calls.flat().join("\n");
    expect(logged).toContain("jane@example.com"); // full lead JSON survives in function logs
  });

  it("webhook mode: POSTs JSON with bearer token and returns ok on 2xx", async () => {
    vi.stubEnv("CRM_LEAD_WEBHOOK", "https://crm.example/leads");
    vi.stubEnv("CRM_API_TOKEN", "tok_123");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const r = await submitLead(lead);
    expect(r.ok).toBe(true);
    expect(r.stub).toBeUndefined();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://crm.example/leads");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["Authorization"]).toBe("Bearer tok_123");
    expect(JSON.parse(init.body).name).toBe("Jane Buyer");
  });

  it("webhook mode: non-2xx → ok:false with error", async () => {
    vi.stubEnv("CRM_LEAD_WEBHOOK", "https://crm.example/leads");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    const r = await submitLead(lead);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("500");
  });

  it("webhook mode: network failure → ok:false, does not throw", async () => {
    vi.stubEnv("CRM_LEAD_WEBHOOK", "https://crm.example/leads");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    const r = await submitLead(lead);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("ECONNREFUSED");
  });
});
