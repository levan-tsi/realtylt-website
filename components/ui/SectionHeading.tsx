import type { ReactNode } from "react";

/** Section heading matched to live realtylt.com: Lato 36px, light for info sections,
 * bold for the listing rails ("Featured Listings" etc — live computes w700 there). */
export function SectionHeading({
  eyebrow,
  children,
  dark = false,
  align = "left",
  as: Tag = "h2",
  bold = false,
}: {
  eyebrow?: string;
  children: ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  bold?: boolean;
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : ""}>
      {eyebrow && (
        <p
          className={`mb-2 text-xs font-bold uppercase tracking-[0.22em] ${
            dark ? "text-paper/60" : "text-stone"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <Tag
        className={`font-sans text-3xl leading-tight md:text-4xl ${bold ? "font-bold" : "font-light"} ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        {children}
      </Tag>
    </div>
  );
}
