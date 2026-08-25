"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * The single-field form behind /auth/reset.
 *
 * HOW THE VISITOR GETS HERE. "Forgot your password?" in the sign-in modal sends a Supabase
 * recovery email; its link hits /auth/callback, which exchanges the code for a real session
 * and bounces to this page. So by the time this renders, a valid link means `user` is set —
 * and an expired or reused link means it is not. Those are the only two states worth
 * designing for, plus the moment before `ready` resolves.
 *
 * The recovery session is a full session: `updateUser({ password })` is the whole write.
 * A signed-in visitor who finds this page some other way just gets a working
 * change-password form, which is not a state we need to fence off.
 *
 * minLength 8 matches the sign-up form — the two doors to the same account must not
 * disagree about what a password is.
 */
export function ResetPasswordForm() {
  const { supabase, ready, user, openSignIn } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Accounts are unavailable right now.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
  }

  // The session is still being read from cookies; a blink of the wrong state here would
  // flash "link expired" at every visitor with a perfectly good link.
  if (!ready) {
    return <p className="t-small text-stone">Checking your reset link&hellip;</p>;
  }

  if (done) {
    return (
      <div>
        <h1 className="t-h2 text-ink">Password updated</h1>
        <p className="mt-3 text-base text-ink-soft">
          You are signed in with your new password on this device.
        </p>
        <Button href="/portal" className="mt-6">
          Go to your portal
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h1 className="t-h2 text-ink">This link has expired</h1>
        <p className="mt-3 max-w-[44ch] text-base text-ink-soft">
          Reset links work once and only for a short while. Open sign-in, enter your email,
          and choose &ldquo;Forgot your password?&rdquo; to get a fresh one.
        </p>
        <Button type="button" onClick={() => openSignIn("signin")} className="mt-6">
          Open sign-in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <h1 className="t-h2 text-ink">Set a new password</h1>
      <p className="mt-3 t-small text-stone">
        For {user.email}. At least 8 characters.
      </p>
      <div className="mt-6">
        <Input
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (8+ characters)"
        />
      </div>
      {error && (
        <p role="alert" className="mt-3 t-small text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="mt-5 w-full">
        {busy ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
