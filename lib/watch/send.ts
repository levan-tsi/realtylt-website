/** The watch's mail transport: Resend, because it is the one sender that also answers the
 * owner's other ask (platform emails from noreply@realtylt.com, no Gmail alias needed).
 *
 * NOT CONFIGURED YET (2026-09-17): the runtime has no mail credential. Until RESEND_API_KEY
 * exists in the Vercel env, sendWatchMail reports "no-transport" and the route still computes,
 * stores and returns the full report - so the watch is provable end to end before the key
 * lands, and arming it is ONLY adding the env var (plus verifying realtylt.com in Resend so
 * noreply@ may send: two DNS records, the owner has the DNS backup from the cutover).
 *
 * Interim coverage: the n8n IDX watcher keeps guard until this one is armed; when it is,
 * unpublish the n8n workflow so he is not told everything twice. */

export type SendResult = "sent" | "no-transport" | `error:${string}`;

export async function sendWatchMail(subject: string, html: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "no-transport";
  const to = process.env.WATCH_ALERT_TO || "levan@realtylt.com";
  const from = process.env.WATCH_MAIL_FROM || "RealtyLT <noreply@realtylt.com>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: "levan@realtylt.com", subject, html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return `error:${res.status} ${(await res.text()).slice(0, 120)}`;
    return "sent";
  } catch (e) {
    return `error:${String(e).slice(0, 120)}`;
  }
}
