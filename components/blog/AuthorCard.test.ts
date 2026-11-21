import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthorCard } from "./AuthorCard";

/** The author card closes every post with who wrote it and how to reach him (round 15).
 * Rendered, not read from source, because what matters is the words a reader gets. Since
 * 2026-11-20 every post here is real estate, so there is one card (the AI posts and their
 * assessments card moved to their own site). */
const html = renderToStaticMarkup(createElement(AuthorCard, { author: "Levan Tsiklauri" }));
const text = html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

describe("AuthorCard", () => {
  it("never calls him a broker", () => {
    expect(text).not.toMatch(/broker/i);
  });

  it("carries his direct number, his email and the booking link", () => {
    expect(html).toContain('href="tel:+19148752424"');
    expect(html).toContain("(914) 875-2424");
    expect(html).toContain('href="mailto:levan@realtylt.com"');
    expect(html).toContain('href="/connect"');
    expect(html).toContain('href="/who-we-are"');
    expect(html).not.toContain("415-7185");
    expect(text).toContain("Levan Tsiklauri (LT)");
  });

  it("gives his standing as a Realtor and salesperson with his brokerage", () => {
    expect(text).toContain("Realtor®, licensed real estate salesperson, United RE Hudson Valley Edge");
  });

  it("says nothing about the AI business", () => {
    expect(text).not.toMatch(/\bAI\b|assessment|assistant described in this post/);
    expect(html).not.toContain("/ai");
  });

  it("holds its contact links at 44px tall and carries no em dash", () => {
    const contacts = html.match(/<a [^>]*href="(tel:|mailto:|\/connect)[^"]*"[^>]*>/g) ?? [];
    expect(contacts).toHaveLength(3);
    for (const a of contacts) expect(a).toContain("min-h-11");
    expect(text).not.toMatch(/—/);
  });
});
