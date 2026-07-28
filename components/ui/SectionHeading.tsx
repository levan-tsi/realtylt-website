import type { ReactNode } from "react";

/** Section heading. Sets the display face and one of two scale steps.
 *
 * `level="section"` (the default) is a peer section of a page. `level="sub"` is a heading
 * subordinate to one of those — a column head inside a section, not a section of its own.
 * Before round 11 every h2 on the site was the same `text-3xl md:text-4xl` with no way to say
 * which was which; see docs/parity/DESIGN-ROUND11.md.
 *
 * `bold` keeps the existing API (live's listing rails computed w700) but now means "one weight
 * step up in the same display face", not a different look — the light-next-to-bold contrast is
 * the site's signature and it should never become a second family or a second colour. */
export function SectionHeading({
  eyebrow,
  children,
  dark = false,
  align = "left",
  as: Tag = "h2",
  bold = false,
  level = "section",
}: {
  eyebrow?: string;
  children: ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  bold?: boolean;
  level?: "section" | "sub";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : ""}>
      {eyebrow && (
        <p className={`t-eyebrow mb-4 ${dark ? "text-paper/55" : "text-stone"}`}>{eyebrow}</p>
      )}
      <Tag
        className={`${level === "sub" ? "t-h3" : "t-h2"} ${bold ? "font-normal" : ""} ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        {children}
      </Tag>
    </div>
  );
}
