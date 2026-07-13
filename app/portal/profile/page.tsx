"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setFullName(profile?.fullName ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile?.fullName, profile?.phone]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    const res = await updateProfile({ fullName, phone });
    setBusy(false);
    setNote(
      res.ok
        ? { kind: "ok", text: "Saved." }
        : { kind: "error", text: res.error ?? "Could not save." },
    );
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <section aria-labelledby="profile-heading" className="max-w-xl">
      <h2 id="profile-heading" className="font-display text-2xl text-ink">
        Profile
      </h2>
      {memberSince && (
        <p className="mt-1 text-sm text-stone">Member since {memberSince}.</p>
      )}

      <form onSubmit={onSave} className="mt-8 space-y-4">
        <Input
          label="Email"
          type="email"
          value={user?.email ?? ""}
          readOnly
          disabled
          className="cursor-not-allowed bg-mist"
        />
        <Input
          label="Full name"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-5555"
        />

        {note && (
          <p
            role={note.kind === "error" ? "alert" : "status"}
            className={`rounded-[4px] px-3 py-2 text-sm ${
              note.kind === "error" ? "bg-red-50 text-red-700" : "bg-mist text-ink-soft"
            }`}
          >
            {note.text}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            Sign out
          </Button>
        </div>
      </form>
    </section>
  );
}
