"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  label: string;
  q: string;
  kind: "county" | "city" | "zip";
  count?: number;
  href?: string;
  county?: string;
}

/** Location autocomplete (live-site parity: the quick-search suggests areas as you type).
 * Progressive enhancement over a plain input — with JS off the surrounding form still
 * submits ?q=. ARIA combobox with arrow-key navigation. */
export function LocationSuggest({
  id,
  name = "q",
  placeholder,
  className,
  defaultValue = "",
  dark = false,
  onPick,
}: {
  id: string;
  name?: string;
  placeholder: string;
  className: string;
  defaultValue?: string;
  /** Dropdown on a dark hero vs a white page. */
  dark?: boolean;
  /** When set, selection calls this instead of navigating (search page filters). */
  onPick?: (s: Suggestion) => void;
}) {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const needle = value.trim();
    if (needle.length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/idx/suggest?q=${encodeURIComponent(needle)}`);
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setItems(data.suggestions);
        setOpen(data.suggestions.length > 0);
        setActive(-1);
      } catch {
        setOpen(false);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(s: Suggestion) {
    setOpen(false);
    setValue(s.q);
    if (onPick) return onPick(s);
    router.push(s.href ?? `/search?q=${encodeURIComponent(s.q)}`);
  }

  return (
    <div ref={wrapRef} className="relative flex-1">
      <input
        id={id}
        type="search"
        name={name}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, items.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, -1));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            pick(items[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={className}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Location suggestions"
          className={`absolute inset-x-0 top-full z-30 mt-1 overflow-hidden border shadow-lg ${
            dark ? "border-paper/20 bg-ink" : "border-ink/15 bg-white"
          }`}
        >
          {items.map((s, i) => (
            <li key={s.kind + s.q} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left text-sm ${
                  dark
                    ? i === active ? "bg-white/15 text-paper" : "text-paper/90"
                    : i === active ? "bg-mist text-ink" : "text-ink-soft"
                }`}
              >
                <span>{s.label}</span>
                <span className={`shrink-0 text-[11px] uppercase tracking-[0.12em] ${dark ? "text-paper/50" : "text-stone"}`}>
                  {s.count ? `${s.count.toLocaleString("en-US")} homes` : s.kind}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
