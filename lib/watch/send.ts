/** The watch's mail transport: the CRM's ops-alert door (round 51e, owner's architecture
 * decision 2026-09-17: "the CRM should handle all of those" - it holds his connected Gmail).
 *
 * POST https://app.realtylt.com/api/site/ops-alert with x-rlt-site-secret; body
 * {subject, text, html?}; answers {ok, status:'sent'|'skipped', reason}. The caller owns
 * cadence and dedupe (the judge's 6h same-problem throttle in checks.ts). Secret: the shared
 * site-email secret - on Vercel it is the LEAD_THANKYOU_SECRET value the CRM session set when
 * it flipped the thank-you env; SITE_EMAIL_SECRET wins if it is ever split out.
 *
 * Resend never shipped an email and is gone: this replaced it before any key existed. If the
 * env is absent the route still computes, stores and returns "no-transport" - but as of the
 * 51e flip the secret IS on prod, so the watch is ARMED (first proof: the digest fired after
 * this deploy, read back from his Gmail). The n8n IDX watcher must be unpublished now that
 * this sends, or Mondays arrive twice. */

export type SendResult = "sent" | "skipped" | "no-transport" | `error:${string}`;

export async function sendWatchMail(subject: string, html: string, text?: string): Promise<SendResult> {
  const secret = process.env.SITE_EMAIL_SECRET || process.env.LEAD_THANKYOU_SECRET;
  if (!secret) return "no-transport";
  try {
    const res = await fetch("https://app.realtylt.com/api/site/ops-alert", {
      method: "POST",
      headers: { "x-rlt-site-secret": secret, "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: subject.slice(0, 200),
        text: (text ?? subject).slice(0, 5000),
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return `error:${res.status} ${(await res.text()).slice(0, 120)}`;
    const out = (await res.json()) as { ok?: boolean; status?: string };
    return out.ok && out.status === "sent" ? "sent" : "skipped";
  } catch (e) {
    return `error:${String(e).slice(0, 120)}`;
  }
}
