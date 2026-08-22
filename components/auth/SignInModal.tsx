"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAuth } from "@/components/auth/AuthProvider";
import { SITE } from "@/lib/site";

type Notice = { kind: "error" | "info"; text: string } | null;

export function SignInModal() {
  const {
    modalOpen,
    modalMode,
    signupOpen,
    googleEnabled,
    appleEnabled,
    closeSignIn,
    openSignIn,
    signInWithPassword,
    signUpWithPassword,
    sendMagicLink,
    signInWithOAuth,
    supabase,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  // Sign-up is a door the project can have shut (lib/auth/doors.ts). Fold the mode down here,
  // in ONE place, so every existing openSignIn("signup") call site — the saved nudge, the
  // portal wall, the save-search dialog — degrades to the sign-in form it can actually honour
  // instead of a form that answers every press with a refusal.
  const isSignup = modalMode === "signup" && signupOpen;
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset transient state each time the modal opens or switches mode.
  useEffect(() => {
    if (modalOpen) {
      setNotice(null);
      setBusy(false);
    }
  }, [modalOpen, modalMode]);

  // Esc to close.
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSignIn();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeSignIn]);

  // aria-modal is a promise: while this is open the page behind must not scroll and must not
  // be reachable by Tab. (Restoring focus to the trigger is AuthProvider's job — it has to
  // capture the element in the click handler, before this modal's autoFocus input takes it.)
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  // Tab is trapped inside the panel.
  const onPanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const f = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])',
    );
    if (!f || f.length === 0) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!modalOpen) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    const res = isSignup
      ? await signUpWithPassword({ name, email, password })
      : await signInWithPassword(email, password);
    setBusy(false);
    if (!res.ok) {
      setNotice({ kind: "error", text: res.error ?? "Something went wrong. Please try again." });
      return;
    }
    if (res.needsConfirm) {
      setNotice({
        kind: "info",
        text: "Check your email to confirm your account, then sign in.",
      });
      return;
    }
    closeSignIn();
  }

  // At least one social provider is live, so the stack and its "or" divider have something
  // to separate. With none configured the form simply starts where the copy ends.
  const socialShown = googleEnabled || appleEnabled;

  async function onOAuth(provider: "google" | "apple") {
    setBusy(true);
    setNotice(null);
    const res = await signInWithOAuth(provider);
    if (!res.ok) {
      setBusy(false);
      const name = provider === "google" ? "Google" : "Apple";
      setNotice({ kind: "error", text: res.error ?? `${name} sign-in is unavailable.` });
    }
    // On success the browser redirects away.
  }

  async function onMagicLink() {
    if (!email) {
      setNotice({ kind: "error", text: "Enter your email first, then request a link." });
      return;
    }
    setBusy(true);
    setNotice(null);
    const res = await sendMagicLink(email);
    setBusy(false);
    setNotice(
      res.ok
        ? { kind: "info", text: `We emailed a sign-in link to ${email}.` }
        : { kind: "error", text: res.error ?? "Could not send the link." },
    );
  }

  async function onForgot() {
    if (!email) {
      setNotice({ kind: "error", text: "Enter your email, then reset your password." });
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setNotice(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/portal/profile`,
    });
    setBusy(false);
    setNotice(
      error
        ? { kind: "error", text: error.message }
        : { kind: "info", text: `We emailed a password-reset link to ${email}.` },
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-10 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeSignIn();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onKeyDown={onPanelKeyDown}
        className="relative w-full max-w-[400px] rounded-2xl bg-white p-7 shadow-float"
      >
        <button
          type="button"
          onClick={closeSignIn}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-xl leading-none text-stone transition-colors hover:bg-mist hover:text-ink"
        >
          ×
        </button>

        <h2
          id="auth-modal-title"
          className="text-2xl font-bold text-ink-soft"
        >
          {isSignup ? "Sign up for free" : "Welcome back."}
        </h2>
        <p className="mt-1.5 text-sm text-stone">
          {isSignup
            ? "Create an account to save homes, get new-listing alerts, and view market reports."
            : "Sign in to your saved homes and searches."}
        </p>

        {/* Only offered when the provider is actually configured. supabase-js redirects the
            browser to /authorize before anything can be validated, so an unconfigured provider
            does not surface as an error we could phrase — it dumps the visitor on a Supabase
            JSON page. A button that cannot work is worse than no button. Apple joined Google
            here on 2026-08-22; both appear the moment the project reports them, and neither
            appears before. */}
        {/* `mt-5` down to `mt-4` and the divider to `my-3` when BOTH providers are offered.
            Measured at 320x568, the smallest phone we support: with Google and Apple stacked, the
            primary "Sign in" button's bottom landed at 569px in a 568px viewport. The overlay does
            scroll and the button IS reachable (proved with a wheel and with focus), so this was
            never a trap — but the primary action sitting one pixel below the fold at rest, on the
            device where scrolling is least discoverable, is not a thing to ship on a technicality. */}
        {socialShown && (
          <div className="mt-4 space-y-2.5">
            {googleEnabled && (
              <button
                type="button"
                onClick={() => onOAuth("google")}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line-strong bg-white px-5 py-3 text-sm font-bold text-ink-soft transition-colors hover:bg-mist disabled:opacity-50"
              >
                <svg aria-hidden viewBox="0 0 48 48" className="h-[18px] w-[18px]">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.3 13.3 17.6 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.8 6.6-9.5 6.6-16z" />
                  <path fill="#FBBC05" d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z" />
                  <path fill="#34A853" d="M24 48c6.4 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.4 0-11.7-3.8-13.5-9.2l-7.9 6.2C6.5 42.6 14.6 48 24 48z" />
                </svg>
                Continue with Google
              </button>
            )}
            {appleEnabled && (
              /* Apple's own guidance: the mark is solid black on a light ground, is not
                 recoloured, and the label reads "Continue with Apple" when it sits beside other
                 continue buttons. Same geometry as the Google button so the pair reads as one
                 stack rather than two visitors from different design systems. */
              <button
                type="button"
                onClick={() => onOAuth("apple")}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line-strong bg-white px-5 py-3 text-sm font-bold text-ink-soft transition-colors hover:bg-mist disabled:opacity-50"
              >
                <svg aria-hidden viewBox="0 0 384 512" className="h-[18px] w-[18px]" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                Continue with Apple
              </button>
            )}
          </div>
        )}

        {socialShown && (
          <div className="my-3 flex items-center gap-3 text-xs uppercase tracking-wider text-stone">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
        )}

        <form onSubmit={onSubmit} className={socialShown ? "space-y-3" : "mt-5 space-y-3"}>
          {isSignup && (
            <Input
              autoFocus
              label="Full name"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          )}
          <Input
            autoFocus={!isSignup}
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? "Create a password (8+ characters)" : "Your password"}
          />

          {!isSignup && (
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={onForgot}
                className="font-semibold text-porchlight-deep hover:underline"
              >
                Forgot your password?
              </button>
              <button
                type="button"
                onClick={onMagicLink}
                className="font-semibold text-porchlight-deep hover:underline"
              >
                Email me a link
              </button>
            </div>
          )}

          {notice && (
            <p
              role={notice.kind === "error" ? "alert" : "status"}
              className={`rounded-xl px-3 py-2 text-sm ${
                notice.kind === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-mist text-ink-soft"
              }`}
            >
              {notice.text}
            </p>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>

        {signupOpen ? (
          <p className="mt-4 text-center text-sm text-stone">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => openSignIn(isSignup ? "signin" : "signup")}
              className="font-bold text-porchlight-deep hover:underline"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        ) : (
          // Sign-up is switched off at the project. Say so here, where a visitor is deciding,
          // rather than after they have typed a name, an email and a password into a form that
          // was always going to refuse them. Same sentence the refusal used to give them.
          <p className="mt-4 text-center text-sm text-stone">
            New accounts aren&rsquo;t open yet. Call or text{" "}
            <a
              href={SITE.phoneHref}
              className="whitespace-nowrap font-bold text-porchlight-deep hover:underline"
            >
              {SITE.phone}
            </a>{" "}
            and we&rsquo;ll set one up for you.
          </p>
        )}

        <p className="mt-4 text-center text-[11px] leading-relaxed text-stone">
          By continuing you agree to our{" "}
          <Link href="/dmca-terms" className="underline hover:text-ink" onClick={closeSignIn}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="underline hover:text-ink" onClick={closeSignIn}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
