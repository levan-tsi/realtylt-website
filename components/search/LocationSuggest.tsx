"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

interface Suggestion {
  label: string;
  q: string;
  kind: "county" | "city" | "zip" | "address";
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
  anchor = "input",
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
  /** "form": the dropdown spans the nearest positioned ancestor (a composed search bar that
   * wraps input + button in one container) instead of just the input's own box. */
  anchor?: "input" | "form";
}) {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  /** The label `pick` just wrote into the input, so the query effect can tell a choice from
   * typing. Null whenever the next change is genuinely the visitor's. */
  const pickedRef = useRef<string | null>(null);
  /** True until the query effect has run once, so a value that arrived from the URL is never
   * treated as something the visitor typed. */
  const firstRunRef = useRef(true);
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  /** Where to draw the popup, in viewport coordinates. Null until measured (and on the server),
   * which is also the signal to fall back to the old in-flow absolute positioning. */
  const [anchorRect, setAnchorRect] = useState<{ left: number; top: number; width: number } | null>(null);

  /** Measure the control the popup hangs off. `anchor="form"` means the whole search
   * instrument, not just the input, so the dropdown lines up with the bar rather than with the
   * text field inside it. Re-measured on scroll and resize because the popup is fixed: it does
   * not travel with the page on its own. */
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = anchor === "form" ? wrapRef.current?.closest("form") ?? wrapRef.current : wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setAnchorRect({ left: r.left, top: r.bottom + 8, width: r.width });
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, anchor, items.length]);

  useEffect(() => {
    const needle = value.trim();
    // NEVER open on mount. The initial value comes from the URL (`?q=` / `?city=`), not from
    // anybody typing, so searching it means the page can load with a dropdown already covering
    // its own results. This is also the second half of the picked-value problem below: choosing
    // a city on /search rewrites the URL, which remounts this component with the chosen name as
    // its defaultValue — a fresh instance, a fresh ref, and the list reopened 2.6s later.
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    // A value we put in the box ourselves is a CHOICE, not a query. `pick` closes the list and
    // then writes the chosen label into the input, which used to look exactly like typing: the
    // effect re-ran, fetched suggestions for the thing they just picked, and re-opened the list
    // over the results. On the home page nobody saw it, because picking navigates away. On
    // /search you stay on the page, and it came back 400ms later and sat there.
    if (pickedRef.current !== null && needle === pickedRef.current) {
      pickedRef.current = null;
      return;
    }
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
      const t = e.target as Node;
      // The list is PORTALLED to <body>, so it is no longer inside wrapRef. Without this the
      // mousedown that begins a click on an option counts as an outside click, the list
      // unmounts, and the click never lands on anything.
      if (wrapRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(s: Suggestion) {
    setOpen(false);
    // Tell the query effect that this next value change is ours. Cleared the moment it is used,
    // so editing the text afterwards searches normally again.
    pickedRef.current = s.q.trim();
    setValue(s.q);
    // An ADDRESS is a destination, not a filter. On /search, onPick would swallow it and
    // re-filter the grid the visitor is already looking at, when what they asked for was
    // that one house. Areas still hand off to onPick so the search page can filter in place.
    if (s.kind === "address" && s.href) return router.push(s.href);
    if (onPick) return onPick(s);
    router.push(s.href ?? `/search?q=${encodeURIComponent(s.q)}`);
  }

  /** Out of the hero entirely once measured. Before measurement (and during SSR) it renders
   * in place, so a no-JS or first-paint visitor still gets a sane control. */
  const portal = (node: ReactNode) =>
    anchorRect && typeof document !== "undefined" ? createPortal(node, document.body) : node;

  return (
    <div ref={wrapRef} className={anchor === "form" ? "flex-1" : "relative flex-1"}>
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
        /* Close when focus leaves the control. The only other thing that closes this list is a
           mousedown outside it, which a keyboard visitor never produces — so tabbing off the
           input used to leave the popup on screen. That was harmless while the list was an
           in-flow absolute child being clipped by the hero; since round 19 portalled it to
           <body> as position:fixed at z-60 it is global, so an orphaned list floats over the
           page and covers the very control Tab just moved to.
           relatedTarget is the element about to receive focus: null when the window itself
           loses focus (close, correctly), and inside the list only if an option ever takes
           focus. Options do not — selection is aria-activedescendant and their mousedown is
           prevented so the input keeps focus through a click — but guarding it here means a
           later change to that cannot silently close the list mid-pick. */
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && listRef.current?.contains(next)) return;
          setOpen(false);
        }}
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
      {open && portal(
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Location suggestions"
          /* FIXED + PORTALLED, and this was a real bug rather than a refinement: on the home
             page NONE of these were clickable. The hero is `isolate overflow-hidden`, so an
             absolutely-positioned dropdown anchored to the search bar near the hero's bottom
             edge was both clipped by the hero AND out-painted by the scroll cue and the section
             below it — document.elementFromPoint at each option's centre returned the scroll
             cue, never the option. It looked fine in a screenshot, which is why it survived.
             A combobox popup cannot live inside a clipping, isolated ancestor. */
          style={anchorRect ? { position: "fixed", left: anchorRect.left, top: anchorRect.top, width: anchorRect.width } : undefined}
          className={`${anchorRect ? "z-[60]" : `absolute inset-x-0 top-full z-30 ${anchor === "form" ? "mt-2" : "mt-1"}`} overflow-hidden rounded-xl border shadow-lift ${
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
                  {s.count ? `${s.count.toLocaleString("en-US")} homes` : s.kind === "address" ? "View home" : s.kind}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
