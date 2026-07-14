/** JSON-LD for an article page, mirrored on lib/services/index.ts so both surfaces feed
 * crawlers the same shapes. Pure functions, unit-tested without rendering React.
 *
 * `BlogPosting` says what the article is and who published it; `BreadcrumbList` places it;
 * `FAQPage` is the part an assistant quotes verbatim, emitted only when the body actually
 * contains a Q&A section (see lib/blog/toc.ts `extractFaqs`). Each block is rendered in its
 * own <script> by the page so a malformed one cannot take the others down. */

import { SITE } from "@/lib/site";
import type { Article } from "./types";
import { extractFaqs, readingTime, type FaqPair } from "./toc";

export function articleUrl(article: Article): string {
  return `${SITE.url}/blog/${article.slug}`;
}

/** Site-relative cover → absolute; an already-absolute (Supabase) cover is left alone. */
export function absoluteCover(article: Article): string {
  return article.cover.startsWith("http") ? article.cover : `${SITE.url}${article.cover}`;
}

export function articleJsonLd(article: Article) {
  const url = articleUrl(article);
  const wordCount =
    article.body.kind === "markdown"
      ? article.body.markdown.trim().split(/\s+/).filter(Boolean).length
      : article.body.paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: [absoluteCover(article)],
    datePublished: article.date,
    // No separate edited timestamp is tracked yet; publish date is the honest dateModified.
    dateModified: article.date,
    inLanguage: "en-US",
    wordCount,
    author: {
      "@type": "Person",
      name: article.author,
      url: `${SITE.url}/who-we-are`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      legalName: SITE.legalName,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/og.png` },
    },
  };
}

export function breadcrumbJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl(article) },
    ],
  };
}

export function faqJsonLd(faqs: FaqPair[], article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${articleUrl(article)}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Every JSON-LD block an article page emits, in order. FAQPage only when a Q&A section
 * exists in a markdown body. */
export function articleStructuredData(article: Article): object[] {
  const blocks: object[] = [articleJsonLd(article), breadcrumbJsonLd(article)];
  if (article.body.kind === "markdown") {
    const faqs = extractFaqs(article.body.markdown);
    if (faqs.length) blocks.push(faqJsonLd(faqs, article));
  }
  return blocks;
}

/** Re-exported so pages import reading time from the same place as the JSON-LD. */
export { readingTime };
