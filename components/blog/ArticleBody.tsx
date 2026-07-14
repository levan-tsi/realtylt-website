import { renderMarkdownSections } from "@/lib/blog/markdown";
import { ArticleSection } from "./ArticleSection";

/** The long-form body: markdown grouped into <section> landmarks (one per H2) that each
 * rise into view on scroll. Server-rendered — the text is in the HTML with or without JS;
 * ArticleSection only adds the motion. The `.prose-custom` wrapper owns the typographic
 * rhythm (globals.css). */
export function ArticleBody({ markdown }: { markdown: string }) {
  const sections = renderMarkdownSections(markdown);
  return (
    <div className="prose-custom">
      {sections.map((s, i) => (
        // The heading inside carries the anchor id (from markdown.tsx), so the section
        // itself only needs aria-labelledby to become a named landmark.
        <ArticleSection key={s.id ?? `lead-${i}`} labelledBy={s.headingId || undefined}>
          {s.nodes}
        </ArticleSection>
      ))}
    </div>
  );
}
