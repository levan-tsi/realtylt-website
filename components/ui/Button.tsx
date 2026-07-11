import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "outline" | "outline-light" | "ghost";
type Size = "md" | "lg";

/* Matched to live realtylt.com buttons: black CTAs (14px/600 uppercase, ls 1.4px,
   radius 4px, pad 12px 20px), 2px black outline "SEE MORE"-style, 1px white
   outline on dark heroes. */
const base =
  "inline-flex items-center justify-center gap-2 font-sans font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "rounded-[4px] uppercase tracking-[0.1em] bg-ink text-paper hover:bg-ink-soft active:translate-y-px",
  outline:
    "uppercase tracking-[0.1em] border-2 border-ink text-ink hover:bg-ink hover:text-paper active:translate-y-px",
  "outline-light":
    "uppercase tracking-[0.1em] border border-paper text-paper hover:bg-paper hover:text-ink active:translate-y-px",
  ghost: "text-ink hover:text-stone underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-3 text-sm",
  lg: "px-8 py-4 text-sm",
};

interface OwnProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = OwnProps & ComponentPropsWithoutRef<"button"> & { href?: undefined };
type AnchorProps = OwnProps & ComponentPropsWithoutRef<typeof Link> & { href: string };

export function Button(props: ButtonProps | AnchorProps) {
  const { variant = "primary", size = "md", className = "", ...rest } = props;
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in rest && rest.href !== undefined) {
    return <Link {...(rest as AnchorProps)} className={cls} />;
  }
  return <button type="button" {...(rest as ButtonProps)} className={cls} />;
}
