"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createBrowserSupabase, type SupabaseBrowserClient } from "@/lib/supabase/client";
import type { ActivityType, PortalProfile } from "@/lib/portal/types";
import { SignInModal } from "@/components/auth/SignInModal";

export type AuthModalMode = "signin" | "signup";

interface SignUpArgs {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface Result {
  ok: boolean;
  error?: string;
  needsConfirm?: boolean;
}

interface AuthContextValue {
  /** Supabase is configured (env present). When false the whole account layer is inert. */
  enabled: boolean;
  /** Initial session check finished. */
  ready: boolean;
  user: User | null;
  session: Session | null;
  profile: PortalProfile | null;
  supabase: SupabaseBrowserClient | null;

  signInWithPassword(email: string, password: string): Promise<Result>;
  signUpWithPassword(args: SignUpArgs): Promise<Result>;
  sendMagicLink(email: string): Promise<Result>;
  signInWithGoogle(): Promise<Result>;
  signOut(): Promise<void>;
  updateProfile(fields: { fullName?: string; phone?: string }): Promise<Result>;

  /** Behavioral tracking — fire-and-forget, no-op when signed out. */
  track(type: ActivityType, listingId?: string, meta?: Record<string, unknown>): void;

  /** Sign-in modal controller (any component can open it). */
  modalOpen: boolean;
  modalMode: AuthModalMode;
  openSignIn(mode?: AuthModalMode): void;
  closeSignIn(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

function redirectTo(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseBrowserClient | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PortalProfile | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthModalMode>("signin");

  const user = session?.user ?? null;

  // Fetch the anon Supabase config at RUNTIME (the env vars are runtime-only, not baked into the
  // static build). On success we create the browser client; the session effect below then runs.
  useEffect(() => {
    let active = true;
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((cfg: { enabled?: boolean; url?: string; anonKey?: string }) => {
        if (!active) return;
        if (cfg.enabled && cfg.url && cfg.anonKey) {
          setSupabase(createBrowserSupabase(cfg.url, cfg.anonKey));
          setEnabled(true);
        } else {
          setReady(true); // accounts disabled — nothing to load
        }
      })
      .catch(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Initial session + subscribe to auth changes.
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Load the portal_clients profile whenever the user changes.
  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }
    let active = true;
    supabase
      .from("portal_clients")
      .select("id,email,full_name,phone,contact_id,created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          phone: data.phone,
          contactId: data.contact_id,
          createdAt: data.created_at,
        });
      });
    return () => {
      active = false;
    };
  }, [supabase, user]);

  const openSignIn = useCallback((mode: AuthModalMode = "signin") => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);
  const closeSignIn = useCallback(() => setModalOpen(false), []);

  const signInWithPassword = useCallback<AuthContextValue["signInWithPassword"]>(
    async (email, password) => {
      if (!supabase) return { ok: false, error: "Accounts are unavailable right now." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { ok: false, error: error.message } : { ok: true };
    },
    [supabase],
  );

  const signUpWithPassword = useCallback<AuthContextValue["signUpWithPassword"]>(
    async ({ name, email, password, phone }) => {
      if (!supabase) return { ok: false, error: "Accounts are unavailable right now." };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo(),
          data: { full_name: name, phone: phone ?? null, account_type: "portal" },
        },
      });
      if (error) return { ok: false, error: error.message };
      // No session but a user → email confirmation is required.
      if (!data.session && data.user) return { ok: true, needsConfirm: true };
      return { ok: true };
    },
    [supabase],
  );

  const sendMagicLink = useCallback<AuthContextValue["sendMagicLink"]>(
    async (email) => {
      if (!supabase) return { ok: false, error: "Accounts are unavailable right now." };
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo(),
          data: { account_type: "portal" },
        },
      });
      return error ? { ok: false, error: error.message } : { ok: true };
    },
    [supabase],
  );

  const signInWithGoogle = useCallback<AuthContextValue["signInWithGoogle"]>(async () => {
    if (!supabase) return { ok: false, error: "Accounts are unavailable right now." };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    // On success the browser redirects; an error means the provider isn't enabled yet.
    return error
      ? { ok: false, error: "Google sign-in isn't enabled yet — use email instead." }
      : { ok: true };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async ({ fullName, phone }) => {
      if (!supabase || !user) return { ok: false, error: "Not signed in." };
      const patch: { full_name?: string | null; phone?: string | null } = {};
      if (fullName !== undefined) patch.full_name = fullName || null;
      if (phone !== undefined) patch.phone = phone || null;
      const { error } = await supabase.from("portal_clients").update(patch).eq("id", user.id);
      if (error) return { ok: false, error: error.message };
      setProfile((p) =>
        p
          ? {
              ...p,
              fullName: patch.full_name !== undefined ? (patch.full_name ?? null) : p.fullName,
              phone: patch.phone !== undefined ? (patch.phone ?? null) : p.phone,
            }
          : p,
      );
      return { ok: true };
    },
    [supabase, user],
  );

  // Track activity — never throws, never blocks the UI.
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;
  const track = useCallback<AuthContextValue["track"]>(
    (type, listingId, meta) => {
      const uid = userIdRef.current;
      if (!supabase || !uid) return;
      void supabase
        .from("portal_activity")
        .insert({ client_id: uid, type, listing_id: listingId ?? null, meta: meta ?? {} })
        .then(({ error }) => {
          if (error && process.env.NODE_ENV !== "production") {
            console.warn("[portal] activity insert failed:", error.message);
          }
        });
    },
    [supabase],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      enabled,
      ready,
      user,
      session,
      profile,
      supabase,
      signInWithPassword,
      signUpWithPassword,
      sendMagicLink,
      signInWithGoogle,
      signOut,
      updateProfile,
      track,
      modalOpen,
      modalMode,
      openSignIn,
      closeSignIn,
    }),
    [
      enabled,
      ready,
      user,
      session,
      profile,
      supabase,
      signInWithPassword,
      signUpWithPassword,
      sendMagicLink,
      signInWithGoogle,
      signOut,
      updateProfile,
      track,
      modalOpen,
      modalMode,
      openSignIn,
      closeSignIn,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {enabled && <SignInModal />}
    </AuthContext.Provider>
  );
}
