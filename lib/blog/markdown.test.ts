import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

/** Render a markdown body exactly as the /blog/[slug] page would. */
const html = (md: string) => renderToStaticMarkup(createElement("div", null, renderMarkdown(md)));

describe("renderMarkdown — blocks", () => {
  it("renders headings, paragraphs, lists, quote and rule", () => {
    const out = html(
      [
        "## Section",
        "",
        "First line",
        "still the same paragraph.",
        "",
        "### Sub",
        "",
        "- one",
        "- two",
        "",
        "1. first",
        "2. second",
        "",
        "> a quote",
        "",
        "---",
      ].join("\n"),
    );
    expect(out).toContain("<h2");
    expect(out).toContain("Section");
    expect(out).toContain("First line still the same paragraph.");
    expect(out).toContain("<h3");
    expect(out).toContain("<ul");
    expect(out).toContain("<li>one</li>");
    expect(out).toContain("<ol");
    expect(out).toContain("<li>second</li>");
    expect(out).toContain("<blockquote");
    expect(out).toContain("a quote");
    expect(out).toContain("<hr");
  });

  it("keeps the heading order legal (# and ## both become h2 — the page owns the h1)", () => {
    expect(html("# Top")).toContain("<h2");
    expect(html("# Top")).not.toContain("<h1");
    expect(html("#### Tiny")).toContain("<h4");
  });

  it("returns nothing for empty/whitespace bodies", () => {
    expect(renderMarkdown("")).toHaveLength(0);
    expect(renderMarkdown("\n\n   \n")).toHaveLength(0);
  });
});

describe("renderMarkdown — inline", () => {
  it("renders bold, italic and code", () => {
    const out = html("A **bold** and *italic* and `code` line.");
    expect(out).toContain("<strong");
    expect(out).toContain("bold</strong>");
    expect(out).toContain("<em>italic</em>");
    expect(out).toContain("<code");
  });

  it("opens external links safely and keeps internal links in-tab", () => {
    const ext = html("See [Redfin](https://redfin.com/x).");
    expect(ext).toContain('href="https://redfin.com/x"');
    expect(ext).toContain('target="_blank"');
    expect(ext).toContain('rel="noopener noreferrer"');

    const int = html("See [our contact page](/connect).");
    expect(int).toContain('href="/connect"');
    expect(int).not.toContain("target=");
  });
});

describe("renderMarkdown — injection safety (React nodes, never HTML)", () => {
  it("renders a raw <script> tag in the body as visible text, not an element", () => {
    const out = html('Hello <script>alert("xss")</script> world');
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("renders a raw <img onerror> as text", () => {
    const out = html('<img src=x onerror="alert(1)">');
    expect(out).not.toContain("<img");
    expect(out).toContain("&lt;img");
  });

  it("strips a javascript: link but keeps its words", () => {
    const out = html("[click me](javascript:alert(1))");
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("<a ");
    expect(out).toContain("click me");
  });

  it("strips a protocol-relative link (//evil.example)", () => {
    const out = html("[go](//evil.example/x)");
    expect(out).not.toContain("<a ");
    expect(out).toContain("go");
  });

  it("strips a data: link", () => {
    const out = html("[x](data:text/html;base64,PHN2Zz4=)");
    expect(out).not.toContain("<a ");
    expect(out).not.toContain("data:text/html");
  });
});
