"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAuth } from "@/components/auth/AuthProvider";

type Notice = { kind: "error" | "info"; text: string } | null;

export function SignInModal() {
  const {
    modalOpen,
    modalMode,
    closeSignIn,
    openSignIn,
    signInWithPassword,
    signUpWithPassword,
    sendMagicLink,
    signInWithGoogle,
    supabase,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const isSignup = modalMode === "signup";

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

  async function onGoogle() {
    setBusy(true);
    setNotice(null);
    const res = await signInWithGoogle();
    if (!res.ok) {
      setBusy(false);
      setNotice({ kind: "error", text: res.error ?? "Google sign-in is unavailable." });
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-[400px] rounded-[6px] bg-white p-7 shadow-2xl"
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
          {isSignup ? "Sign up for free" : "Welcome back!"}
        </h2>
        <p className="mt-1.5 text-sm text-stone">
          {isSignup
            ? "Create an account to save homes, get new-listing alerts, and view market reports."
            : "We've missed you! Sign in to your saved homes and searches."}
        </p>

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-[4px] border border-[#cccccc] bg-white px-5 py-3 text-sm font-bold text-ink-soft transition-colors hover:bg-mist disabled:opacity-50"
        >
          <svg aria-hidden viewBox="0 0 48 48" className="h-[18px] w-[18px]">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.3 13.3 17.6 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.8 6.6-9.5 6.6-16z" />
            <path fill="#FBBC05" d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z" />
            <path fill="#34A853" d="M24 48c6.4 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.4 0-11.7-3.8-13.5-9.2l-7.9 6.2C6.5 42.6 14.6 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wider text-stone">
          <span className="h-px flex-1 bg-[#e5e5e5]" />
          or
          <span className="h-px flex-1 bg-[#e5e5e5]" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
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
              className={`rounded-[4px] px-3 py-2 text-sm ${
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
