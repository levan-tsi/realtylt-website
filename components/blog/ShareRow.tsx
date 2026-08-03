"use client";

import { useState } from "react";

/** Share cluster: copy-link (with a confirmed state) plus the places this actually gets sent.
 *
 * Inline SVG only — no emoji icons. `tone="light"` sits on the ink hero, `tone="dark"` on
 * paper. The copied url is the canonical passed in, never window.location (which is
 * localhost in dev).
 *
 * WHY THIS ORDER. It is not alphabetical and it is not "the big four". It is where a broker
 * actually sends a link, most-used first: Facebook is where real estate lives, LinkedIn is
 * where a piece aimed at business owners gets forwarded, WhatsApp is how anything gets sent
 * from a phone, X is the public room. Email is last because it is the fallback, not the habit.
 *
 * Facebook was missing entirely until 2026-08-03, on a real estate site.
 *
 * WHY FIVE AND NOT SIX. Reddit was built, measured and removed. A 390 phone gives the row
 * 358px; the copy pill takes 126 and each target 36 plus a 10 gap, so five is the last one
 * that fits on a single line. Six orphaned a lone circle onto a second row, and the only ways
 * to avoid that were to shrink the targets below 36px — which is already at the tap-target
 * floor this site just spent a round fixing — or to drop a target. Reddit is the one an agent
 * posting their own vendor's article looks like a spammer on, so Reddit is the one that went.
 *
 * The row still wraps, because a longer title or a larger text size can still push it. */
export function ShareRow({
  url,
  title,
  tone = "dark",
}: {
  url: string;
  title: string;
  tone?: "light" | "dark";
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context / permissions) — no-op, the links still work.
    }
  };

  const enc = encodeURIComponent;
  const targets = [
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      icon: (
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
      ),
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      icon: (
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0Z" />
      ),
    },
    {
      // wa.me is WhatsApp's own share endpoint: it opens the app on a phone and
      // web.whatsapp.com on a desktop, with no app id and no SDK.
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${enc(`${title} ${url}`)}`,
      icon: (
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      ),
    },
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
      icon: (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      ),
    },
    {
      label: "Share by email",
      href: `mailto:?subject=${enc(title)}&body=${enc(url)}`,
      icon: (
        <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm.4 2 8.6 5.6L20.6 7H3.4ZM20 8.9l-8 5.2-8-5.2V17h16V8.9Z" />
      ),
    },
  ];

  const iconBtn =
    tone === "light"
      ? "text-paper/70 hover:text-paper hover:border-paper/60 border-paper/25"
      : "text-stone hover:text-ink hover:border-ink/50 border-line-strong";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${iconBtn}`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
          {copied ? (
            <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path
              d="M9 15 15 9m-4.5-1.5.9-.9a3.2 3.2 0 0 1 4.5 4.5l-.9.9m-6 6-.9.9a3.2 3.2 0 0 1-4.5-4.5l.9-.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {copied ? "Copied" : "Copy link"}
      </button>
      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.label}
          className={`inline-grid h-9 w-9 place-items-center rounded-full border fill-current transition-colors ${iconBtn}`}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-[15px] w-[15px]">
            {t.icon}
          </svg>
        </a>
      ))}
    </div>
  );
}
