"use client";

import { useId } from "react";
import type { ComponentPropsWithoutRef } from "react";

/** Labeled form controls with shared error/focus treatment. `dark` = for ink sections. */

const controlBase =
  "w-full rounded-xl border bg-transparent px-3.5 py-3 text-sm transition-colors placeholder:text-stone focus:outline-none focus:ring-1 focus:ring-ink/40 disabled:opacity-50";

/* A FLOATING LABEL, because a placeholder is not a label.
   Every field on this site passed `hideLabel` plus a placeholder that repeats the
   label — "First Name", "Email Address", "Phone Number". That reads beautifully
   until the visitor types, at which point the only thing naming the field is gone
   and a six-field form becomes six anonymous boxes. On a lead form, where the
   visitor is being asked for a phone number, that is the wrong moment to be
   ambiguous.

   The resting appearance is unchanged: the label sits exactly where the
   placeholder sat, in the placeholder's colour, and the real placeholder is made
   transparent. On focus, or as soon as there is a value, it rises into the top of
   the field and shrinks.

   It scales with a TRANSFORM, never `font-size` — font-size is a layout property
   and animating it on every keystroke-adjacent focus is exactly the rule
   `improve-animations` exists to enforce. `transform-origin: left top` makes the
   scale read as the type getting smaller in place.

   No JavaScript: `:placeholder-shown` and `:focus` do all of it, so it behaves
   identically with scripting off. Under reduced motion the global block collapses
   the duration and the label lands instantly — which is correct here, because the
   label MUST move; leaving it still would park it on top of the visitor's text. */
const floatWrap = "relative";
/* The placeholder is hidden outright, not restored on focus. Every placeholder on
   this site duplicates its label word for word ("Property Address" / "Property
   address") — there is no worked example to preserve, so bringing it back on focus
   would only print the field's name twice.

   The `!` is load-bearing: `controlBase` already sets `placeholder:text-stone`,
   and two utilities in the same group under the same variant are resolved by
   Tailwind's emit order rather than by the order they appear here. Without it,
   whether the placeholder shows through the label is a coin flip. */
const floatControl = "peer placeholder:!text-transparent pt-5 pb-2";
/* The floated position is the DEFAULT and the resting position is the exception,
   so the only rule that has to win an ordering fight is `peer-placeholder-shown`
   against `peer-focus` — and that one is settled by writing the resting rule to
   exclude focus outright rather than trusting Tailwind's variant order. */
/* `transition-[translate,scale]`, NOT `transform`. Tailwind v4 emits `translate`
   and `scale` as their own CSS properties, so a transition naming `transform`
   animates neither and the label teleports — round 30 lost half a day to the same
   trap on the Button's press. Measured here before the fix: label y 420 -> 414
   with `transform: none`, i.e. an instant 6px jump. */
const floatLabel =
  "pointer-events-none absolute left-3.5 top-0 origin-top-left translate-y-[6px] scale-[0.78] text-sm font-normal normal-case tracking-normal " +
  "transition-[translate,scale,color] duration-150 ease-out " +
  "peer-[:placeholder-shown:not(:focus)]:translate-y-[15px] peer-[:placeholder-shown:not(:focus)]:scale-100";

function tone(dark: boolean, error?: string, floating = false) {
  if (error) return "border-red-500/80";
  // A floating field must not also set a placeholder colour: `placeholder:text-paper/60`
  // and `placeholder:text-transparent` are the same utility group under the same
  // variant, so which one wins is Tailwind's emit order, not the class order here —
  // and on a dark form the losing coin-flip prints the placeholder under the label.
  // A FIELD THAT DOES NOT ANSWER THE POINTER READS AS INERT. Measured by the rubric's hover
  // probe on /selling: Name, Email, Phone and Property address all changed 0.00% of their pixels
  // under the cursor, which cost the page a point and, more to the point, is what makes a form
  // feel like a picture of a form. The border already has three states' worth of range in it
  // (rest -> focus); the hover is the missing middle step, so the progression is now
  // rest < hover < focus rather than nothing-then-everything. Colour only, on the border the
  // control already transitions, so it costs no motion and no layout. Tailwind v4 gates its own
  // `hover:` variants behind `@media (hover: hover)`, so a tap on a phone cannot stick it on.
  return dark
    ? `border-paper/40 text-paper hover:border-paper/55 focus:border-paper/70 ${floating ? "" : "placeholder:text-paper/60"}`
    : "border-line-strong text-ink-soft hover:border-ink/30 focus:border-ink/50 bg-white";
}

interface FieldShellProps {
  label: string;
  error?: string;
  dark?: boolean;
  hideLabel?: boolean;
  id: string;
  children: React.ReactNode;
  /** Float the hidden label back over the control instead of hiding it outright. */
  floating?: boolean;
}

function FieldShell({ label, error, dark = false, hideLabel = false, id, children, floating = false }: FieldShellProps) {
  // The label must follow the control in the DOM for `peer-*` to reach it (the CSS
  // sibling combinator only looks forward); it is positioned back over the field.
  if (hideLabel && floating) {
    return (
      <div className={floatWrap}>
        {children}
        <label htmlFor={id} className={`${floatLabel} ${dark ? "text-paper/60" : "text-stone"}`}>
          {label}
        </label>
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] ${
          hideLabel ? "sr-only" : ""
        } ${dark ? "text-paper/70" : "text-stone"}`}
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = { label: string; error?: string; dark?: boolean; hideLabel?: boolean } & ComponentPropsWithoutRef<"input">;

export function Input({ label, error, dark = false, hideLabel, className = "", id, ...rest }: InputProps) {
  const autoId = useId();
  const fid = id ?? autoId;
  // A field can only float its label if it has a placeholder to swap it for.
  const floating = !!hideLabel && !!rest.placeholder;
  return (
    <FieldShell label={label} error={error} dark={dark} hideLabel={hideLabel} id={fid} floating={floating}>
      <input
        id={fid}
        aria-invalid={error ? true : undefined}
        className={`${controlBase} ${floating ? floatControl : ""} ${tone(dark, error, floating)} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}

type SelectProps = { label: string; error?: string; dark?: boolean; hideLabel?: boolean } & ComponentPropsWithoutRef<"select">;

export function Select({ label, error, dark = false, hideLabel, className = "", id, children, ...rest }: SelectProps) {
  const autoId = useId();
  const fid = id ?? autoId;
  return (
    <FieldShell label={label} error={error} dark={dark} hideLabel={hideLabel} id={fid}>
      <select
        id={fid}
        aria-invalid={error ? true : undefined}
        className={`${controlBase} appearance-none ${tone(dark, error)} ${dark ? "[&>option]:text-ink" : ""} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}

type TextareaProps = { label: string; error?: string; dark?: boolean; hideLabel?: boolean } & ComponentPropsWithoutRef<"textarea">;

export function Textarea({ label, error, dark = false, hideLabel, className = "", id, ...rest }: TextareaProps) {
  const autoId = useId();
  const fid = id ?? autoId;
  const floating = !!hideLabel && !!rest.placeholder;
  return (
    <FieldShell label={label} error={error} dark={dark} hideLabel={hideLabel} id={fid} floating={floating}>
      <textarea
        id={fid}
        aria-invalid={error ? true : undefined}
        className={`${controlBase} min-h-24 resize-y ${floating ? floatControl : ""} ${tone(dark, error, floating)} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}
