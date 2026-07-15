"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SITE, type InterestReason } from "@/lib/site";

/** The "raise your hand" + direct-message panel on a client report (owner spec §5b).
 * Both actions funnel through the site's own /api/lead pipeline (→ CRM lead + owner
 * notification), prefilled from the signed-in client's profile, and drop a `raise_hand`
 * activity so the agent sees the interest against the contact. */
export function TalkToAgent({
  reportTitle,
  interestReason,
  address,
}: {
  reportTitle: string;
  interestReason: InterestReason;
  address?: string;
}) {
  const { user, profile, track } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<"raise" | "send" | null>(null);
  const [done, setDone] = useState<null | "raise" | "send">(null);
  const [error, setError] = useState("");

  const name = (profile?.fullName || user?.email?.split("@")[0] || "RealtyLT client").trim();

  async function submit(kind: "raise" | "send") {
    if (!user) return;
    setBusy(kind);
    setError("");
    const body = {
      name,
      email: user.email ?? "",
      phone: profile?.phone ?? "",
      interestReason,
      address,
      message:
        kind === "send" && message.trim()
          ? `${message.trim()}\n\nRe: ${reportTitle}`
          : `Raised their hand from their portal report: ${reportTitle}`,
      source: "/portal/reports",
    };
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? `Something went wrong. Call or text ${SITE.phone}.`);
        setBusy(null);
        return;
      }
      track("raise_hand", undefined, { title: reportTitle, mode: kind });
      setDone(kind);
      if (kind === "send") setMessage("");
    } catch {
      setError(`We couldn't reach the server. Call or text ${SITE.phone}.`);
    }
    setBusy(null);
  }

  return (
    <section
      aria-labelledby="talk-heading"
      className="overflow-hidden rounded-[6px] bg-ink text-paper"
    >
      <div className="p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-porchlight">
          Your agent, on call
        </p>
        <h3 id="talk-heading" className="mt-2 text-2xl font-light md:text-3xl">
          Have a question, or ready to make a move?
        </h3>
        <p className="mt-2 max-w-xl text-sm text-paper/70">
          Levan reviews every report personally. Raise your hand and he&rsquo;ll reach out, or
          send a note and start the conversation right here.
        </p>

        {done === "raise" ? (
          <p
            role="status"
            className="mt-6 rounded-[4px] border border-porchlight/40 bg-porchlight/10 px-4 py-3 text-sm text-paper"
          >
            Got it. Your agent has been notified and will reach out shortly. Talk soon.
          </p>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => submit("raise")}
              disabled={busy !== null}
              className="rounded-[4px] bg-paper px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-mist disabled:opacity-60"
            >
              {busy === "raise" ? "Sending…" : "Raise my hand"}
            </button>
            <a
              href={SITE.phoneHref}
              className="rounded-[4px] border border-paper/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-white/10"
            >
              Call {SITE.phone}
            </a>
            <a
              href={`sms:${SITE.phoneE164}`}
              className="rounded-[4px] border border-paper/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-white/10"
            >
              Text
            </a>
          </div>
        )}

        {/* Direct message / chat */}
        <div className="mt-6 border-t border-paper/15 pt-6">
          <label htmlFor="talk-msg" className="text-xs font-bold uppercase tracking-[0.1em] text-paper/70">
            Send a direct message
          </label>
          {done === "send" ? (
            <p
              role="status"
              className="mt-2 rounded-[4px] border border-porchlight/40 bg-porchlight/10 px-4 py-3 text-sm text-paper"
            >
              Message sent. You&rsquo;ll usually hear back within the hour.
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <textarea
                id="talk-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Ask about this report, a comp, or next steps…"
                className="min-h-12 flex-1 resize-y rounded-[4px] border border-paper/30 bg-white/5 px-3.5 py-3 text-sm text-paper placeholder:text-paper/50 focus:border-paper/70 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => submit("send")}
                disabled={busy !== null || !message.trim()}
                className="h-fit shrink-0 rounded-[4px] bg-porchlight px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-porchlight-deep hover:text-paper disabled:opacity-50"
              >
                {busy === "send" ? "Sending…" : "Send"}
              </button>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-[4px] border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
