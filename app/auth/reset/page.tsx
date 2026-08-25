import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

/** Where the password-reset email lands (round 39). The reset link used to bounce to
 * /portal/profile, a page with no password field on it — the visitor arrived holding a
 * recovery session and found nowhere to spend it. This page has exactly one job: take the
 * new password. */
export const metadata: Metadata = {
  title: "Set a New Password",
  description: "Choose a new password for your RealtyLT account.",
  // A reset page in a search result would be nonsense; same declaration /portal makes.
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <section className="sec-sm bg-paper">
      <div className="mx-auto max-w-[440px] px-4">
        {/* The recovery session lives in the browser client, so there is nothing this page
            can do without JavaScript. Say so — the /saved treatment — instead of leaving
            the form's loading line up forever. */}
        <noscript>
          {/* With scripting off the form's server-rendered "Checking your reset link" line
              would sit under this message forever, saying the opposite thing — hide it. */}
          <style>{`#reset-loading{display:none}`}</style>
          <p className="text-xl font-light text-ink">
            Setting a new password needs JavaScript turned on.
          </p>
          <p className="mt-2 t-small text-stone">
            Turn it on and open the link from your email again.
          </p>
        </noscript>
        <ResetPasswordForm />
      </div>
    </section>
  );
}
