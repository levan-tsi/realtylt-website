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
        <ResetPasswordForm />
      </div>
    </section>
  );
}
