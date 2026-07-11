"use client";

import { useId } from "react";
import type { ComponentPropsWithoutRef } from "react";

/** Labeled form controls with shared error/focus treatment. `dark` = for ink sections. */

const controlBase =
  "w-full border bg-transparent px-3.5 py-3 text-sm transition-colors placeholder:text-stone focus:outline-none focus:ring-1 focus:ring-ink/40 disabled:opacity-50";

function tone(dark: boolean, error?: string) {
  if (error) return "border-red-500/80";
  return dark
    ? "border-paper/40 text-paper focus:border-paper/70 placeholder:text-paper/60"
    : "border-[#cccccc] text-ink-soft focus:border-ink/50 bg-white";
}

interface FieldShellProps {
  label: string;
  error?: string;
  dark?: boolean;
  hideLabel?: boolean;
  id: string;
  children: React.ReactNode;
}

function FieldShell({ label, error, dark = false, hideLabel = false, id, children }: FieldShellProps) {
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
  return (
    <FieldShell label={label} error={error} dark={dark} hideLabel={hideLabel} id={fid}>
      <input
        id={fid}
        aria-invalid={error ? true : undefined}
        className={`${controlBase} ${tone(dark, error)} ${className}`}
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
  return (
    <FieldShell label={label} error={error} dark={dark} hideLabel={hideLabel} id={fid}>
      <textarea
        id={fid}
        aria-invalid={error ? true : undefined}
        className={`${controlBase} min-h-24 resize-y ${tone(dark, error)} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}
