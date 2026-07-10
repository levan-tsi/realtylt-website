import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "outline" | "outline-light" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-sans font-bold tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-porchlight text-ink hover:bg-porchlight-deep hover:text-paper active:translate-y-px shadow-[0_8px_24px_-10px_rgb(232_176_75/0.55)]",
  outline: "border border-ink/70 text-ink hover:bg-ink hover:text-paper active:translate-y-px",
  "outline-light":
    "border border-paper/50 text-paper hover:bg-paper hover:text-ink active:translate-y-px",
  ghost: "text-river hover:text-ink underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
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
