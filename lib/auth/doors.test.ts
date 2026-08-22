import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthDoors, __resetAuthDoorsCache } from "@/lib/auth/doors";

const ORIGINAL_FETCH = globalThis.fetch;

function settings(body: Record<string, unknown>, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response);
}

describe("getAuthDoors", () => {
  beforeEach(() => {
    __resetAuthDoorsCache();
    process.env.SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key";
  });
  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
    vi.restoreAllMocks();
  });

  it("reads the project's live settings, not a build-time flag", async () => {
    globalThis.fetch = settings({ disable_signup: false, external: { google: true, github: false } });
    expect(await getAuthDoors()).toEqual({ signupOpen: true, google: true, apple: false });
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(String(url)).toBe("https://project.supabase.co/auth/v1/settings");
  });

  /** Apple is read the same way Google is, and independently of it. Without this the `apple`
   * field could be hard-false for ever and every other case here would still pass, because they
   * all expect it false. The owner asked for Apple sign-in on 2026-08-22; the day he configures
   * it on the project, the button has to appear on its own. */
  it("reads each provider on its own, so one being off does not hide the other", async () => {
    globalThis.fetch = settings({ disable_signup: false, external: { google: false, apple: true } });
    expect(await getAuthDoors()).toEqual({ signupOpen: true, google: false, apple: true });
  });

  // The live state of the RealtyLT project on 2026-08-18, unchanged when re-measured 2026-08-22.
  it("reports every door shut when signup is disabled and no provider is on", async () => {
    globalThis.fetch = settings({ disable_signup: true, external: { google: false } });
    expect(await getAuthDoors()).toEqual({ signupOpen: false, google: false, apple: false });
  });

  it("treats an unreachable auth server as SHUT, never as open", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
    expect(await getAuthDoors()).toEqual({ signupOpen: false, google: false, apple: false });
  });

  it("treats a non-OK response as SHUT", async () => {
    globalThis.fetch = settings({ msg: "no" }, 500);
    expect(await getAuthDoors()).toEqual({ signupOpen: false, google: false, apple: false });
  });

  // A missing key is not a false: an older gateway that stops sending `disable_signup` must not
  // silently open the sign-up form.
  it("treats a missing field as SHUT", async () => {
    globalThis.fetch = settings({ external: {} });
    expect(await getAuthDoors()).toEqual({ signupOpen: false, google: false, apple: false });
  });

  it("is inert when Supabase is not configured at all", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    globalThis.fetch = settings({ disable_signup: false, external: { google: true } });
    expect(await getAuthDoors()).toEqual({ signupOpen: false, google: false, apple: false });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("caches, so the header does not pay a round trip per page load", async () => {
    const f = settings({ disable_signup: false, external: { google: true } });
    globalThis.fetch = f;
    await getAuthDoors();
    await getAuthDoors();
    await getAuthDoors();
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("keeps serving the last known answer when a refresh after the TTL fails", async () => {
    vi.useFakeTimers();
    try {
      globalThis.fetch = settings({ disable_signup: false, external: { google: true } });
      expect(await getAuthDoors()).toEqual({ signupOpen: true, google: true, apple: false });
      vi.advanceTimersByTime(90_000); // past the 60s TTL
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("down"));
      // A blip must not sign every visitor out of the sign-up form for a minute.
      expect(await getAuthDoors()).toEqual({ signupOpen: true, google: true, apple: false });
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
