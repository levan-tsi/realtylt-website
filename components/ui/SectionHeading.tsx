import type { ReactNode } from "react";

/** Section heading matched to live realtylt.com: Lato 36px light, plain. */
export function SectionHeading({
  eyebrow,
  children,
  dark = false,
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  children: ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
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
        className={`font-sans text-3xl font-light leading-tight md:text-4xl ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        {children}
      </Tag>
    </div>
  );
}
