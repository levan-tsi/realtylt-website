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
 * this sends, or Mondays arrive twice.
 *
 * 2026-10-15: when the door answers non-2xx or cannot be reached, the watch tries once more
 * after 5 s, and the result says exactly what came back each time (the report's `mail`
 * field). A 2xx is final - retrying it could send the mail twice.
 *
 * 2026-10-16: the same alert reached the owner TWICE, 46 s apart, from one run. During a slow
 * database minute the door took 24 s and then 55 s to sign the runner in and send; the 10 s
 * limit gave up on the first post, the retry fired, and both posts were sent server-side.
 * Now the door gets 25 s, and NO ANSWER within that is final ("maybe-sent": the door may
 * still be sending, so it is never retried); only a connection error or a non-2xx retries. */

export type SendResult = "no-transport" | `sent${string}` | `maybe-sent${string}` | `skipped${string}` | `error:${string}`;

const RETRY_AFTER_MS = 5_000;
const DOOR_TIMEOUT_MS = 25_000;

type Attempt = { final: true; result: `sent${string}` | `maybe-sent${string}` | `skipped${string}` } | { final: false; error: string };

async function postToDoor(secret: string, body: string): Promise<Attempt> {
  let res: Response;
  try {
    res = await fetch("https://app.realtylt.com/api/site/ops-alert", {
      method: "POST",
      headers: { "x-rlt-site-secret": secret, "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(DOOR_TIMEOUT_MS),
    });
  } catch (e) {
    const timedOut = (e as { name?: unknown } | null)?.name === "TimeoutError";
    if (timedOut)
      return { final: true, result: `maybe-sent:no answer within ${DOOR_TIMEOUT_MS / 1000} s (the door may still be sending it; not retried, so it cannot go twice)` };
    return { final: false, error: String(e).slice(0, 120) };
  }
  if (!res.ok) return { final: false, error: `${res.status} ${(await res.text().catch(() => "")).slice(0, 120)}`.trim() };
  const out = (await res.json().catch(() => null)) as { ok?: boolean; status?: string; reason?: unknown } | null;
  if (out?.ok && out.status === "sent") return { final: true, result: "sent" };
  const reason = out ? (out.reason == null ? "" : `: ${String(out.reason).slice(0, 120)}`) : ": unreadable answer";
  return { final: true, result: `skipped${reason}` };
}

export async function sendWatchMail(subject: string, html: string, text?: string): Promise<SendResult> {
  const secret = process.env.SITE_EMAIL_SECRET || process.env.LEAD_THANKYOU_SECRET;
  if (!secret) return "no-transport";
  const body = JSON.stringify({
    subject: subject.slice(0, 200),
    text: (text ?? subject).slice(0, 5000),
    html,
  });
  const first = await postToDoor(secret, body);
  if (first.final) return first.result;
  await new Promise((resolve) => setTimeout(resolve, RETRY_AFTER_MS));
  const second = await postToDoor(secret, body);
  if (second.final) return `${second.result} (on the retry; first try: ${first.error})`;
  return `error:first try ${first.error}; retry after 5 s ${second.error}`;
}
