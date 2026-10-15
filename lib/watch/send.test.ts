import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendWatchMail } from "./send";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("SITE_EMAIL_SECRET", "test-secret");
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("the watch's mail transport (the CRM's ops-alert door)", () => {
  it("a 2xx is final: one post, never a retry that could send the mail twice", async () => {
    fetchMock.mockResolvedValueOnce(json({ ok: true, status: "sent" }));
    expect(await sendWatchMail("s", "<p>h</p>", "t")).toBe("sent");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://app.realtylt.com/api/site/ops-alert");
    expect(JSON.parse(init.body)).toEqual({ subject: "s", text: "t", html: "<p>h</p>" });
  });

  it("a non-2xx is retried once, 5 s later, and the result says what came back both times", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Bad Gateway", { status: 502 })).mockResolvedValueOnce(json({ ok: true, status: "sent" }));
    const result = sendWatchMail("s", "<p>h</p>");
    await vi.advanceTimersByTimeAsync(4_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toBe("sent (on the retry; first try: 502 Bad Gateway)");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("no answer within 10 s, then a failure: both are in the result", async () => {
    fetchMock
      .mockRejectedValueOnce(new DOMException("The operation was aborted due to timeout", "TimeoutError"))
      .mockResolvedValueOnce(new Response("boom", { status: 500 }));
    const result = sendWatchMail("s", "<p>h</p>");
    await vi.advanceTimersByTimeAsync(5_000);
    expect(await result).toBe("error:first try no answer within 10 s; retry after 5 s 500 boom");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("a 'skipped' answer is final and carries the door's reason", async () => {
    fetchMock.mockResolvedValueOnce(json({ ok: true, status: "skipped", reason: "no connected mailbox" }));
    expect(await sendWatchMail("s", "<p>h</p>")).toBe("skipped: no connected mailbox");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("with no secret it computes nothing to send: no-transport, no post", async () => {
    vi.stubEnv("SITE_EMAIL_SECRET", "");
    vi.stubEnv("LEAD_THANKYOU_SECRET", "");
    expect(await sendWatchMail("s", "<p>h</p>")).toBe("no-transport");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
