"use client";

import { useState } from "react";

/** Share cluster: copy-link (with a confirmed state) plus X, LinkedIn and email.
 * Inline SVG only — no emoji icons. `tone="light"` sits on the ink hero, `tone="dark"` on
 * paper. The copied url is the canonical passed in, never window.location (which is
 * localhost in dev). */
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
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
      icon: (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
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
      : "text-stone hover:text-ink hover:border-ink/50 border-[#d9dde3]";

  return (
    <div className="flex items-center gap-2.5">
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
