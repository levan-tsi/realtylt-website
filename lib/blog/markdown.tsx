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

/** Markdown → React nodes. Never returns HTML strings. */
export function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
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
      blocks.push(<hr key={`hr-${key++}`} className="my-10 border-t border-[#e3e6ea]" />);
      i++;
      continue;
    }

    // # heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = inline(heading[2].trim(), `h${key}`);
      const k = `h-${key++}`;
      if (level <= 2) {
        blocks.push(
          <h2 key={k} className="mt-10 text-2xl font-bold leading-snug text-ink-soft md:text-[28px]">
            {content}
          </h2>,
        );
      } else if (level === 3) {
        blocks.push(
          <h3 key={k} className="mt-8 text-lg font-bold leading-snug text-ink-soft md:text-xl">
            {content}
          </h3>,
        );
      } else {
        blocks.push(
          <h4 key={k} className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-stone">
            {content}
          </h4>,
        );
      }
      i++;
      continue;
    }

    // > blockquote (consecutive lines)
    if (/^\s*>\s?/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={`q-${key++}`}
          className="my-8 border-l-2 border-porchlight pl-5 text-lg font-light italic leading-relaxed text-ink-soft"
        >
          {inline(quoted.join(" ").trim(), `q${key}`)}
        </blockquote>,
      );
      continue;
    }

    // - / * bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${key++}`} className="my-6 list-disc space-y-2 pl-6 leading-relaxed text-stone marker:text-porchlight">
          {items.map((it, n) => (
            <li key={n}>{inline(it, `ul${key}-${n}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // 1. numbered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${key++}`} className="my-6 list-decimal space-y-2 pl-6 leading-relaxed text-stone marker:font-bold marker:text-porchlight">
          {items.map((it, n) => (
            <li key={n}>{inline(it, `ol${key}-${n}`)}</li>
          ))}
        </ol>,
      );
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
      blocks.push(
        <p key={`p-${key++}`} className="mt-5 leading-relaxed text-stone">
          {inline(para.join(" "), `p${key}`)}
        </p>,
      );
    }
  }

  return blocks;
}
