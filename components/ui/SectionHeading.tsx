import type { ReactNode } from "react";
import { ValleyUnderline } from "@/components/valley-line/ValleyLine";

/** Eyebrow (mono, tracked) + Fraunces headline + Valley Line flourish. */
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
          className={`mb-3 font-mono text-xs uppercase tracking-[0.22em] ${
            dark ? "text-porchlight" : "text-river"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <Tag
        className={`font-display text-3xl font-semibold leading-[1.12] tracking-tight md:text-[2.6rem] ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        {children}
      </Tag>
      <ValleyUnderline className={`mt-4 ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}
