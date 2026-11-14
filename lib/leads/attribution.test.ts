import { describe, expect, it } from "vitest";
import { attributionLine, originOf, parseAttribution } from "./attribution";
import { parseLead } from "./index";

describe("originOf: the one line a person reads", () => {
  it("names the search engine from the referrer", () => {
    expect(originOf({ referrer: "www.google.com/" })).toBe("Google search");
    expect(originOf({ referrer: "www.bing.com/search" })).toBe("Bing search");
  });
  it("an ad click beats the referrer, and a tagged link beats an untagged one", () => {
    expect(originOf({ referrer: "www.google.com/", click: "google" })).toBe("Google Ads");
    expect(originOf({ referrer: "l.facebook.com/", utm_source: "newsletter", utm_medium: "email" })).toBe("Campaign: newsletter / email");
  });
  it("no referrer is Direct, an unknown site is a referral by its host, an assistant is named", () => {
    expect(originOf({ landing: "/connect" })).toBe("Direct");
    expect(originOf(undefined)).toBe("Direct");
    expect(originOf({ referrer: "www.homeservicebase.com/list" })).toBe("Referral: homeservicebase.com");
    expect(originOf({ referrer: "chatgpt.com/" })).toBe("AI assistant: chatgpt.com");
  });
});

describe("parseAttribution: nothing a form sends is trusted", () => {
  it("keeps known short strings and drops everything else", () => {
    const a = parseAttribution({
      first: { referrer: "www.google.com/", landing: "/blog/x", junk: "no", click: "nope", utm_source: "x".repeat(500) },
      tz: "America/Chicago",
      extra: { deep: true },
    });
    expect(a).toEqual({
      origin: "Campaign: " + "x".repeat(200),
      first: { referrer: "www.google.com/", landing: "/blog/x", utm_source: "x".repeat(200) },
      tz: "America/Chicago",
    });
  });
  it("refuses a zone that is not a zone, and returns nothing for nothing", () => {
    expect(parseAttribution({ tz: "<script>" })).toBeUndefined();
    expect(parseAttribution("google")).toBeUndefined();
    expect(parseAttribution(undefined)).toBeUndefined();
  });
  it("the folded line carries the first page and a different return visit", () => {
    const a = parseAttribution({ first: { referrer: "www.google.com/", landing: "/blog/x" }, last: { click: "google", landing: "/connect" } })!;
    expect(attributionLine(a)).toBe("[Source] Google search · first page /blog/x · came back from Google Ads");
  });
});

describe("parseLead carries the source", () => {
  const base = { name: "Dana Smith", email: "dana@example.com", message: "Call me" };
  it("attaches it and folds one line into the message", () => {
    const parsed = parseLead({ ...base, attribution: { first: { referrer: "www.google.com/", landing: "/selling" }, tz: "America/New_York" } }, "/connect");
    if (parsed.kind !== "lead") throw new Error("expected a lead");
    expect(parsed.lead.attribution?.origin).toBe("Google search");
    expect(parsed.lead.attribution?.tz).toBe("America/New_York");
    expect(parsed.lead.message).toBe("Call me\n\n[Source] Google search · first page /selling");
  });
  it("a form that sends none is exactly the lead it was", () => {
    const parsed = parseLead(base, "/connect");
    if (parsed.kind !== "lead") throw new Error("expected a lead");
    expect(parsed.lead.attribution).toBeUndefined();
    expect(parsed.lead.message).toBe("Call me");
  });
});
