import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AuthorCard, CHAT_ASSISTANT_SLUG } from "./AuthorCard";

/** The author card closes every post with who wrote it and how to reach him (round 15).
 * Rendered, not read from source, because what matters is the words a reader gets. */
const render = (slug: string, consumer: boolean) =>
  renderToStaticMarkup(createElement(AuthorCard, { author: "Levan Tsiklauri", slug, consumer }));
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

const CASES = [
  ["seller-disclosure-requirements-new-york", true],
  ["home-inspection-checklist-hudson-valley-ny", true],
  ["ai-audit-small-business-what-not-to-automate", false],
  [CHAT_ASSISTANT_SLUG, false],
] as const;

describe("AuthorCard", () => {
  it.each(CASES)("never calls him a broker (%s)", (slug, consumer) => {
    expect(text(render(slug, consumer))).not.toMatch(/broker/i);
  });

  it.each(CASES)("carries his direct number, his email and the booking link (%s)", (slug, consumer) => {
    const html = render(slug, consumer);
    expect(html).toContain('href="tel:+19148752424"');
    expect(html).toContain("(914) 875-2424");
    expect(html).toContain('href="mailto:levan@realtylt.com"');
    expect(html).toContain('href="/connect"');
    expect(html).toContain('href="/who-we-are"');
    expect(html).not.toContain("415-7185");
    expect(text(html)).toContain("Levan Tsiklauri (LT)");
  });

  it("gives a RealtyLT post his standing as a Realtor and salesperson with his brokerage", () => {
    expect(text(render("seller-disclosure-requirements-new-york", true))).toContain(
      "Realtor®, licensed real estate salesperson, United RE Hudson Valley Edge",
    );
  });

  it("gives an AI post the audits line, and no real estate licence line", () => {
    const t = text(render("ai-audit-small-business-what-not-to-automate", false));
    expect(t).toContain("Runs RealtyLT and the AI audits for small businesses");
    expect(t).not.toContain("salesperson");
  });

  it("keeps the chat assistant's paragraph on its own post only", () => {
    expect(text(render(CHAT_ASSISTANT_SLUG, false))).toContain("I built the assistant described in this post");
    expect(render(CHAT_ASSISTANT_SLUG, false)).toContain('href="/ai#chat"');
    for (const [slug, consumer] of CASES.filter(([s]) => s !== CHAT_ASSISTANT_SLUG)) {
      expect(text(render(slug, consumer))).not.toContain("assistant described in this post");
      expect(render(slug, consumer)).not.toContain("/ai#chat");
    }
  });

  it("holds its contact links at 44px tall and carries no em dash", () => {
    for (const [slug, consumer] of CASES) {
      const html = render(slug, consumer);
      const contacts = html.match(/<a [^>]*href="(tel:|mailto:|\/connect)[^"]*"[^>]*>/g) ?? [];
      expect(contacts).toHaveLength(3);
      for (const a of contacts) expect(a).toContain("min-h-11");
      expect(text(html)).not.toMatch(/—/);
    }
  });
});
