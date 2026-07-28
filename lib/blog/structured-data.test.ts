import { describe, expect, it } from "vitest";
import { articleJsonLd, articleStructuredData, breadcrumbJsonLd } from "./structured-data";
import type { Article } from "./types";
import { SITE } from "@/lib/site";

const md = (markdown: string): Article => ({
  slug: "sample-post",
  title: "A Sample Post",
  date: "2026-07-13",
  excerpt: "An excerpt.",
  cover: "/images/listings/house-01.jpg",
  author: "Levan Tsiklauri",
  source: "static",
  placeholder: false,
  body: { kind: "markdown", markdown },
});

describe("articleJsonLd", () => {
  it("is a BlogPosting with author, publisher, dates, and an absolute image", () => {
    const ld = articleJsonLd(md("## H\n\nSome body words here.")) as Record<string, unknown>;
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe("A Sample Post");
    expect(ld.image).toEqual([`${SITE.url}/images/listings/house-01.jpg`]);
    expect(ld.datePublished).toBe("2026-07-13");
    expect(ld.dateModified).toBe("2026-07-13");
    expect((ld.author as Record<string, unknown>).name).toBe("Levan Tsiklauri");
    expect((ld.publisher as Record<string, unknown>)["@type"]).toBe("Organization");
    expect(ld.wordCount).toBeGreaterThan(0);
  });

  it("leaves an already-absolute cover untouched", () => {
    const a = md("body");
    a.cover = "https://cdn.example/x.jpg";
    expect((articleJsonLd(a) as Record<string, unknown>).image).toEqual(["https://cdn.example/x.jpg"]);
  });
});

describe("breadcrumbJsonLd", () => {
  it("is a three-level Home > Blog > title trail", () => {
    const ld = breadcrumbJsonLd(md("body")) as Record<string, unknown>;
    expect(ld["@type"]).toBe("BreadcrumbList");
    const items = ld.itemListElement as Array<Record<string, unknown>>;
    expect(items.map((i) => i.name)).toEqual(["Home", "Blog", "A Sample Post"]);
    expect(items[2].item).toBe(`${SITE.url}/blog/sample-post`);
  });
});

describe("articleStructuredData", () => {
  it("emits BlogPosting + BreadcrumbList and no FAQPage for an ordinary post", () => {
    const blocks = articleStructuredData(md("## Section\n\nText.")) as Array<Record<string, unknown>>;
    expect(blocks.map((b) => b["@type"])).toEqual(["BlogPosting", "BreadcrumbList"]);
  });

  it("adds FAQPage when the body has a Frequently-asked section", () => {
    const post = md(
      ["## Frequently asked questions", "### Is it free?", "Yes it is.", "### Really?", "Really."].join("\n"),
    );
    const blocks = articleStructuredData(post) as Array<Record<string, unknown>>;
    expect(blocks.map((b) => b["@type"])).toEqual(["BlogPosting", "BreadcrumbList", "FAQPage"]);
    const faq = blocks[2].mainEntity as Array<Record<string, unknown>>;
    expect(faq).toHaveLength(2);
    expect(faq[0].name).toBe("Is it free?");
  });

  it("adds VideoObject only when the article actually serves a film", () => {
    const plain = md("## Section\n\nText.");
    expect(articleStructuredData(plain).map((b) => (b as Record<string, unknown>)["@type"])).not.toContain(
      "VideoObject",
    );

    const withFilm: Article = {
      ...plain,
      updated: "2026-07-28",
      film: {
        src: "/video/film-1140pm.mp4",
        poster: "/video/film-1140pm-poster.jpg",
        width: 1280,
        height: 720,
        duration: "PT31S",
        name: "A film",
        description: "What it shows.",
      },
    };
    const blocks = articleStructuredData(withFilm) as Array<Record<string, unknown>>;
    const video = blocks.find((b) => b["@type"] === "VideoObject")!;
    expect(video).toBeDefined();
    // Absolute URLs, or Google reads them as relative to schema.org.
    expect(video.contentUrl).toBe(`${SITE.url}/video/film-1140pm.mp4`);
    expect(video.thumbnailUrl).toEqual([`${SITE.url}/video/film-1140pm-poster.jpg`]);
    expect(video.uploadDate).toBe("2026-07-28");
    expect(video.duration).toBe("PT31S");
  });
});
