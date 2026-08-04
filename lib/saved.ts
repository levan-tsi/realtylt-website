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
  const v = read<unknown>(FAV_KEY, []);
  // Validate shape — wrong-shaped-but-valid JSON (old schema) would crash consumers.
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) return v;
  write(FAV_KEY, []);
  return [];
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

export function removeFavorite(id: string) {
  write(FAV_KEY, getFavorites().filter((f) => f !== id));
}

function isSavedSearch(v: unknown): v is SavedSearch {
  const s = v as SavedSearch;
  return (
    typeof s === "object" && s !== null &&
    typeof s.id === "string" && typeof s.label === "string" &&
    typeof s.query === "string" && typeof s.createdAt === "string"
  );
}

export function getSavedSearches(): SavedSearch[] {
  const v = read<unknown>(SEARCH_KEY, []);
  if (Array.isArray(v) && v.every(isSavedSearch)) return v;
  write(SEARCH_KEY, []);
  return [];
}

export function saveSearch(label: string, query: string): SavedSearch {
  const s: SavedSearch = {
    id: `s${Date.now().toString(36)}`,
    label,
    query,
    createdAt: new Date().toISOString(),
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

/* ── RECENT SEARCHES ─────────────────────────────────────────────────────────────────────────
 *
 * What the search box offers before you have typed anything. The owner's live site does this and
 * it is the right behaviour: the single most likely thing somebody wants from a property search
 * is the search they ran yesterday. An empty dropdown on focus is a wasted moment.
 *
 * Deliberately SEPARATE from saved searches. A saved search is a decision ("watch this for me");
 * a recent one is just history, and conflating them would either bury the deliberate list in
 * noise or imply we are keeping things the visitor never asked us to keep. Device-local, capped,
 * and clearable.
 */

export interface RecentSearch {
  /** What to show: "Poughkeepsie, NY", "150 Hooker Ave, Poughkeepsie". */
  label: string;
  /** Where it goes — a full path for a listing, or a /search query for an area. */
  href: string;
  /** Distinguishes a place from a specific home in the UI. */
  kind: "county" | "city" | "zip" | "address" | "text";
  at: string;
}

const RECENT_KEY = "rlt:recent-searches";
/** Five. Enough to be useful, short enough that the panel never becomes a page. */
const RECENT_MAX = 5;

function isRecent(v: unknown): v is RecentSearch {
  const s = v as RecentSearch;
  return (
    typeof s === "object" && s !== null &&
    typeof s.label === "string" && typeof s.href === "string" &&
    typeof s.kind === "string" && typeof s.at === "string"
  );
}

export function getRecentSearches(): RecentSearch[] {
  const v = read<unknown>(RECENT_KEY, []);
  if (Array.isArray(v) && v.every(isRecent)) return v;
  write(RECENT_KEY, []);
  return [];
}

/** Record a search. Most recent first, de-duplicated by destination so running the same search
 * twice moves it up rather than filling the list with itself. */
export function recordRecentSearch(entry: Omit<RecentSearch, "at">) {
  const label = entry.label.trim();
  const href = entry.href.trim();
  if (!label || !href) return;
  const rest = getRecentSearches().filter((r) => r.href !== href);
  write(RECENT_KEY, [{ ...entry, label, href, at: new Date().toISOString() }, ...rest].slice(0, RECENT_MAX));
}

export function clearRecentSearches() {
  write(RECENT_KEY, []);
}

/** Wipe device-local favorites + searches. Called once after they've been migrated into a
 * client account on sign-in, so they aren't re-migrated on the next login. */
export function clearLocal() {
  try {
    window.localStorage.removeItem(FAV_KEY);
    window.localStorage.removeItem(SEARCH_KEY);
    window.dispatchEvent(new CustomEvent(SAVED_EVENT));
  } catch {
    /* storage unavailable */
  }
}
