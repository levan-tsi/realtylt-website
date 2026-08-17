import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type Variant = "primary" | "outline" | "outline-light" | "light" | "ghost";
type Size = "md" | "lg";

/* Matched to live realtylt.com buttons: black CTAs (14px/600 uppercase, ls 1.4px,
   radius 4px, pad 12px 20px), 2px black outline "SEE MORE"-style, 1px white
   outline on dark heroes. */
/* MOTION (round 30). Three changes, each with a reason:
   - `transition-all` -> the four properties that actually move. `all` also transitions things
     nobody meant to animate — the focus ring's outline among them, so a keyboard Tab used to
     fade its own ring in over 200ms, which is the one moment that must be instantaneous.
   - `duration-150` with the site curve, down from 200ms. Emil's rule and Apple's agree: a
     press must answer inside ~160ms or the control feels like it is thinking.
   - a real PRESS. Every variant previously "pressed" by cancelling its hover lift, which does
     nothing at all for a visitor who never hovered — every touch device, i.e. most of them.
     `active:scale-[0.97]` is felt on any input. Kept at 0.97: below about 0.95 a wide CTA
     visibly shrinks its own text. */
/** THE SITE'S PRESS, NAMED (round 31).
 *
 * Round 30 put this on <Button> and then measured the rest of both pages: the /search filter
 * chips, the GRID/MAP toggle, the county buttons, the rails' arrows and the carousel dots —
 * every one of them ordinary DOM, every one of them answering a press with nothing at all.
 * They are not Buttons and turning them into Buttons would be a refactor, not a motion round,
 * so the treatment is exported instead of copied. One string, one source of truth: a control
 * that presses on this site presses in exactly this way, or it is a bug.
 *
 * `translate` and `scale` are named explicitly because Tailwind v4 emits them as their own CSS
 * properties, not inside `transform` — a transition listing only `transform` animates neither,
 * and both the hover lift and the press would snap.
 *
 * It also replaces `transition-colors` wherever it lands, which is worth more than it sounds:
 * Tailwind's colour list includes `outline-color`, so every one of those controls was fading
 * its own focus ring's colour in over 150ms on Tailwind's weak default curve. That is the same
 * defect round 30 fixed on <Button> by dropping `transition-all`, still standing everywhere
 * else. */
export const PRESS =
  "transition-[translate,scale,background-color,box-shadow,color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

/** THE SAME PRESS, FOR A SEGMENTED CONTROL — the group dips, not the half.
 *
 * Put on the half, `scale-[0.97]` looks wrong, and this was photographed rather than argued:
 * the group is `flex overflow-hidden rounded-xl border`, so the PARENT owns the radius and the
 * border. A half that shrinks pulls inside that clip and opens a pale sliver along its straight
 * edges — the press reads as a rendering artifact, not as a press (docs/design-r31/
 * seg-black-forced-097.png). Scaled at the container, the border and the corners stay perfect
 * and the whole control dips as one object, which is also the truer statement: you pressed the
 * toggle, not one half of it (docs/design-r31/seg-container-forced-097.png).
 *
 * Same 0.97, same 150ms, same curve, same reduced-motion opt-out. One press, moved to the
 * element that can carry it. */
export const PRESS_GROUP =
  "transition-[scale] duration-150 ease-out [&:has(button:active)]:scale-[0.97] motion-reduce:transition-none motion-reduce:[&:has(button:active)]:scale-100";

const base = `inline-flex items-center justify-center gap-2 font-sans font-bold ${PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river disabled:cursor-not-allowed disabled:opacity-50`;

const variants: Record<Variant, string> = {
  primary:
    "rounded-xl uppercase tracking-[0.1em] bg-ink text-paper hover:-translate-y-0.5 hover:bg-ink-soft hover:shadow-lift",
  outline:
    "rounded-xl uppercase tracking-[0.1em] border-2 border-ink text-ink hover:bg-ink hover:text-paper",
  "outline-light":
    "rounded-xl uppercase tracking-[0.1em] border border-paper text-paper hover:bg-paper hover:text-ink",
  light:
    "rounded-xl uppercase tracking-[0.1em] bg-paper text-ink hover:-translate-y-0.5 hover:bg-mist hover:shadow-lift",
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
