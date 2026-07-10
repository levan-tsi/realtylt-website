"use client";

/** Device-local favorites + saved searches (localStorage) — the honest replacement for the
 * live site's Brivity "Sign In" (spec §3 decision). Fires `rlt:saved-change` on every write
 * so the header badge stays in sync. */

export interface SavedSearch {
  id: string;
  label: string;
  /** URL query string for /search, e.g. "county=dutchess&priceMax=500000". */
  query: string;
  createdAt: string;
  alertOptIn?: boolean;
}

const FAV_KEY = "rlt:favorites";
const SEARCH_KEY = "rlt:saved-searches";
export const SAVED_EVENT = "rlt:saved-change";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(SAVED_EVENT));
  } catch {
    /* storage unavailable (private mode) — favorites just won't persist */
  }
}

export function getFavorites(): string[] {
  return read<string[]>(FAV_KEY, []);
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  write(FAV_KEY, next);
  return next.includes(id);
}

export function getSavedSearches(): SavedSearch[] {
  return read<SavedSearch[]>(SEARCH_KEY, []);
}

export function saveSearch(label: string, query: string, alertOptIn = false): SavedSearch {
  const s: SavedSearch = {
    id: `s${Date.now().toString(36)}`,
    label,
    query,
    createdAt: new Date().toISOString(),
    alertOptIn,
  };
  write(SEARCH_KEY, [...getSavedSearches(), s]);
  return s;
}

export function removeSearch(id: string) {
  write(SEARCH_KEY, getSavedSearches().filter((s) => s.id !== id));
}

export function savedCount(): number {
  return getFavorites().length + getSavedSearches().length;
}
