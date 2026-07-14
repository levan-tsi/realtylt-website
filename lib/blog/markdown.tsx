/** A deliberately small, safe Markdown renderer for CRM-published article bodies.
 *
 * WHY NOT a markdown library: every HTML-emitting parser hands you a string that must
 * then go through `dangerouslySetInnerHTML`, which means the site's XSS safety depends on
 * a sanitiser being configured correctly forever. This renderer emits REACT NODES, never
 * HTML — raw `<script>` in a post body is just text on the page. Injection is impossible
 * by construction, and there is no new dependency to keep patched.
 *
 * Supported subset (documented for the CRM editor in docs/BLOG-CMS.md):
 *   #/## heading · ### heading · ####+ small heading
 *   paragraphs (blank-line separated) · - or * bullet list · 1. numbered list
 *   > blockquote · --- horizontal rule
 *   **bold** · *italic* · `code` · [text](https://… | mailto:… | /internal)
 * Anything else renders as literal text.
 */

import type { ReactNode } from "react";
import { parseHeadings } from "./toc";

/** http(s), mailto, or a site-relative path. Rejects javascript:, data:, and the
 * protocol-relative `//host` form. */
const SAFE_HREF = /^(?:https?:\/\/|mailto:|\/(?!\/))/i;

const INLINE =
  /\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\s]+)\)/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;

  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${m.index}`;

    if (m[1] !== undefined) {
      out.push(<strong key={key} className="font-bold text-ink-soft">{m[1]}</strong>);
    } else if (m[2] !== undefined) {
      out.push(<em key={key}>{m[2]}</em>);
    } else if (m[3] !== undefined) {
      out.push(
        <code key={key} className="rounded-[3px] bg-mist px-1.5 py-0.5 text-[0.92em] text-ink-soft">
          {m[3]}
        </code>,
      );
    } else if (m[4] !== undefined && m[5] !== undefined) {
      const href = m[5];
      if (SAFE_HREF.test(href)) {
        const external = /^https?:\/\//i.test(href);
        out.push(
          <a
            key={key}
            href={href}
            className="text-river underline underline-offset-4 transition-colors hover:text-porchlight-deep"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {m[4]}
          </a>,
        );
      } else {
        // Unsafe scheme — keep the words, drop the link.
        out.push(m[4]);
      }
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** One rendered block, plus heading metadata so the page can group blocks into <section>s
 * and give each an anchor. `id`/`headingLevel` are set only for headings. */
interface Block {
  node: ReactNode;
  id?: string;
  headingLevel?: number;
}

/** Markdown → block records. The single parser behind both `renderMarkdown` (flat nodes)
 * and `renderMarkdownSections` (grouped). Heading ids come from parseHeadings in document
 * order, so they match the table of contents exactly. */
function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const headings = parseHeadings(markdown);
  let hIdx = 0;
  const blocks: Block[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // --- / *** horizontal rule
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push({ node: <hr key={`hr-${key++}`} className="my-12 border-t border-[#e3e6ea]" /> });
      i++;
      continue;
    }

    // # heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = inline(heading[2].trim(), `h${key}`);
      const k = `h-${key++}`;
      // parseHeadings walks the same lines in the same order, so this id belongs to this
      // heading — the ToC link and this anchor cannot drift apart.
      const id = headings[hIdx++]?.id;
      if (level <= 2) {
        blocks.push({
          id,
          headingLevel: level,
          node: (
            <h2
              key={k}
              id={id}
              className="prose-h scroll-mt-28 text-[26px] font-bold leading-[1.2] tracking-[-0.01em] text-ink md:text-[32px]"
            >
              {content}
            </h2>
          ),
        });
      } else if (level === 3) {
        blocks.push({
          id,
          headingLevel: level,
          node: (
            <h3
              key={k}
              id={id}
              className="prose-h mt-10 scroll-mt-28 text-lg font-bold leading-snug text-ink-soft md:text-xl"
            >
              {content}
            </h3>
          ),
        });
      } else {
        blocks.push({
          id,
          headingLevel: level,
          node: (
            <h4 key={k} id={id} className="mt-8 scroll-mt-28 text-xs font-bold uppercase tracking-[0.16em] text-stone">
              {content}
            </h4>
          ),
        });
      }
      i++;
      continue;
    }

    // > blockquote (consecutive lines) — rendered as a pull quote
    if (/^\s*>\s?/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({
        node: (
          <blockquote
            key={`q-${key++}`}
            className="pull-quote relative my-12 pl-7 text-xl font-light leading-relaxed text-ink-soft md:text-2xl md:leading-relaxed"
          >
            {inline(quoted.join(" ").trim(), `q${key}`)}
          </blockquote>
        ),
      });
      continue;
    }

    // - / * bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({
        node: (
          // Bare <li> on purpose — bullets and spacing come from `.prose-custom ul li` in
          // globals.css so the markup stays clean (and the renderer's unit test can match it).
          <ul key={`ul-${key++}`} className="prose-ul my-7 leading-[1.7] text-stone">
            {items.map((it, n) => (
              <li key={n}>{inline(it, `ul${key}-${n}`)}</li>
            ))}
          </ul>
        ),
      });
      continue;
    }

    // 1. numbered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push({
        node: (
          <ol key={`ol-${key++}`} className="prose-ol my-7 leading-[1.7] text-stone">
            {items.map((it, n) => (
              <li key={n}>{inline(it, `ol${key}-${n}`)}</li>
            ))}
          </ol>
        ),
      });
      continue;
    }

    // paragraph — consecutive non-blank lines that don't start another block
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s|\s*>|\s*[-*]\s|\s*\d+[.)]\s)/.test(lines[i]) &&
      !/^\s*([-*_])\1{2,}\s*$/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length) {
      blocks.push({
        node: (
          <p key={`p-${key++}`} className="mt-6 leading-[1.75] text-stone">
            {inline(para.join(" "), `p${key}`)}
          </p>
        ),
      });
    }
  }

  return blocks;
}

/** Markdown → React nodes. Never returns HTML strings. */
export function renderMarkdown(markdown: string): ReactNode[] {
  return parseBlocks(markdown).map((b) => b.node);
}

/** A run of blocks under one rendered <h2>. The lead run before the first h2 has a null
 * heading. The page wraps each in a revealed <section> — so the ToC anchors land on real
 * landmarks and sections rise into view as you scroll. */
export interface ArticleSection {
  id: string | null;
  headingId: string | null;
  nodes: ReactNode[];
}

export function renderMarkdownSections(markdown: string): ArticleSection[] {
  const blocks = parseBlocks(markdown);
  const sections: ArticleSection[] = [];
  let current: ArticleSection = { id: "lead", headingId: null, nodes: [] };

  for (const b of blocks) {
    // A rendered <h2> (markdown level 1 or 2) opens a new section.
    if (b.headingLevel !== undefined && b.headingLevel <= 2) {
      if (current.nodes.length) sections.push(current);
      current = { id: b.id ?? null, headingId: b.id ?? null, nodes: [b.node] };
    } else {
      current.nodes.push(b.node);
    }
  }
  if (current.nodes.length) sections.push(current);
  return sections;
}
