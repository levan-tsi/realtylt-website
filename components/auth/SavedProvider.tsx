"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  SAVED_EVENT,
  clearLocal,
  getFavorites,
  getSavedSearches,
  removeSearch as removeSearchLocal,
  saveSearch as saveSearchLocal,
  toggleFavorite as toggleFavoriteLocal,
} from "@/lib/saved";

export interface PortalSearch {
  id: string;
  label: string;
  query: string;
  alerts: boolean;
  createdAt: string;
}

interface SavedContextValue {
  ready: boolean;
  signedIn: boolean;
  favorites: string[];
  searches: PortalSearch[];
  count: number;
  isFavorite(id: string): boolean;
  toggleFavorite(id: string): Promise<boolean>;
  saveSearch(label: string, query: string): Promise<void>;
  removeSearch(id: string): Promise<void>;
  setSearchAlerts(id: string, alerts: boolean): Promise<void>;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within <SavedProvider>");
  return ctx;
}

const SEARCH_COLS = "id,label,query,alerts,created_at";

export function SavedProvider({ children }: { children: ReactNode }) {
  const { supabase, user, ready: authReady, track } = useAuth();
  const signedIn = !!user && !!supabase;

  const [favorites, setFavorites] = useState<string[]>([]);
  const [searches, setSearches] = useState<PortalSearch[]>([]);
  const [ready, setReady] = useState(false);

  const loadFromDb = useCallback(
    async (uid: string) => {
      if (!supabase) return;
      const [favRes, srchRes] = await Promise.all([
        supabase
          .from("portal_favorites")
          .select("listing_id")
          .eq("client_id", uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("portal_saved_searches")
          .select(SEARCH_COLS)
          .eq("client_id", uid)
          .order("created_at", { ascending: false }),
      ]);
      setFavorites((favRes.data ?? []).map((r) => r.listing_id as string));
      setSearches(
        (srchRes.data ?? []).map((r) => ({
          id: r.id as string,
          label: r.label as string,
          query: r.query as string,
          alerts: !!r.alerts,
          createdAt: r.created_at as string,
        })),
      );
    },
    [supabase],
  );

  // One-time migration of device-local saves into the account on sign-in.
  const migrate = useCallback(
    async (uid: string) => {
      if (!supabase) return;
      const localFavs = getFavorites();
      const localSearches = getSavedSearches();
      if (!localFavs.length && !localSearches.length) return;

      if (localFavs.length) {
        await supabase
          .from("portal_favorites")
          .upsert(
            localFavs.map((listing_id) => ({ client_id: uid, listing_id })),
            { onConflict: "client_id,listing_id", ignoreDuplicates: true },
          );
      }
      if (localSearches.length) {
        const { data: existing } = await supabase
          .from("portal_saved_searches")
          .select("query")
          .eq("client_id", uid);
        const have = new Set((existing ?? []).map((r) => r.query as string));
        const toAdd = localSearches.filter((s) => !have.has(s.query));
        if (toAdd.length) {
          await supabase
            .from("portal_saved_searches")
            .insert(toAdd.map((s) => ({ client_id: uid, label: s.label, query: s.query })));
        }
      }
      clearLocal();
    },
    [supabase],
  );

  // Load whenever auth state settles.
  useEffect(() => {
    if (!authReady) return;
    let active = true;
    setReady(false);
    (async () => {
      if (signedIn && user) {
        try {
          await migrate(user.id);
          await loadFromDb(user.id);
        } catch {
          /* network hiccup — leave lists empty, don't crash */
        }
      } else {
        setFavorites(getFavorites());
        setSearches(
          getSavedSearches().map((s) => ({ ...s, alerts: false })),
        );
      }
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [authReady, signedIn, user, migrate, loadFromDb]);

  // Logged-out: keep in sync with localStorage writes from other components/tabs.
  useEffect(() => {
    if (signedIn) return;
    const sync = () => {
      setFavorites(getFavorites());
      setSearches(getSavedSearches().map((s) => ({ ...s, alerts: false })));
    };
    window.addEventListener(SAVED_EVENT, sync);
    return () => window.removeEventListener(SAVED_EVENT, sync);
  }, [signedIn]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback<SavedContextValue["toggleFavorite"]>(
    async (id) => {
      if (signedIn && user && supabase) {
        const has = favorites.includes(id);
        setFavorites((f) => (has ? f.filter((x) => x !== id) : [...f, id]));
        try {
          if (has) {
            await supabase
              .from("portal_favorites")
              .delete()
              .eq("client_id", user.id)
              .eq("listing_id", id);
            track("unsave_listing", id);
          } else {
            await supabase.from("portal_favorites").insert({ client_id: user.id, listing_id: id });
            track("save_listing", id);
          }
        } catch {
          await loadFromDb(user.id); // revert to server truth on error
        }
        return !has;
      }
      const now = toggleFavoriteLocal(id);
      setFavorites(getFavorites());
      return now;
    },
    [signedIn, user, supabase, favorites, track, loadFromDb],
  );

  const saveSearch = useCallback<SavedContextValue["saveSearch"]>(
    async (label, query) => {
      if (signedIn && user && supabase) {
        const { data } = await supabase
          .from("portal_saved_searches")
          .insert({ client_id: user.id, label, query })
          .select(SEARCH_COLS)
          .single();
        if (data) {
          setSearches((prev) => [
            {
              id: data.id as string,
              label: data.label as string,
              query: data.query as string,
              alerts: !!data.alerts,
              createdAt: data.created_at as string,
            },
            ...prev,
          ]);
          track("save_search", undefined, { label, query });
        }
        return;
      }
      saveSearchLocal(label, query);
      setSearches(getSavedSearches().map((s) => ({ ...s, alerts: false })));
    },
    [signedIn, user, supabase, track],
  );

  const removeSearch = useCallback<SavedContextValue["removeSearch"]>(
    async (id) => {
      if (signedIn && user && supabase) {
        setSearches((prev) => prev.filter((s) => s.id !== id));
        try {
          await supabase
            .from("portal_saved_searches")
            .delete()
            .eq("id", id)
            .eq("client_id", user.id);
          track("remove_search", undefined, { id });
        } catch {
          await loadFromDb(user.id);
        }
        return;
      }
      removeSearchLocal(id);
      setSearches(getSavedSearches().map((s) => ({ ...s, alerts: false })));
    },
    [signedIn, user, supabase, track, loadFromDb],
  );

  const setSearchAlerts = useCallback<SavedContextValue["setSearchAlerts"]>(
    async (id, alerts) => {
      if (!(signedIn && user && supabase)) return; // alert toggles need an account
      setSearches((prev) => prev.map((s) => (s.id === id ? { ...s, alerts } : s)));
      try {
        await supabase
          .from("portal_saved_searches")
          .update({ alerts })
          .eq("id", id)
          .eq("client_id", user.id);
      } catch {
        await loadFromDb(user.id);
      }
    },
    [signedIn, user, supabase, loadFromDb],
  );

  const value = useMemo<SavedContextValue>(
    () => ({
      ready,
      signedIn,
      favorites,
      searches,
      count: favorites.length + searches.length,
      isFavorite,
      toggleFavorite,
      saveSearch,
      removeSearch,
      setSearchAlerts,
    }),
    [
      ready,
      signedIn,
      favorites,
      searches,
      isFavorite,
      toggleFavorite,
      saveSearch,
      removeSearch,
      setSearchAlerts,
    ],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}
