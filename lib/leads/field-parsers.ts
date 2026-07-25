/** Pure field parsers for lead capture.
 *
 * These reimplement the behavior of the live BlueRoof form scripts (owner-pasted source),
 * which the reconcile order treats as BEHAVIOR SPECS, not code to copy:
 *  - the home contact-3 form parses "123 Main St, Hyde Park, NY 12044" into hidden
 *    city/state/zip fields on submit,
 *  - the /selling hero form additionally splits a single "Full Name" field into first/last.
 *
 * Both run server-side in parseLead so the visible field values are never mutated (the
 * live scripts rewrite the inputs; ours keep the UX clean and send the parts alongside the
 * full strings). Kept as small, unit-tested pure functions. */

export interface NameParts {
  firstName: string;
  lastName: string;
}

export interface AddressParts {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

/** Split a whole name into first + last.
 *  1 word  -> first only (last empty)
 *  2 words -> first / last
 *  3+      -> first + the rest joined as the last name (live's rule). */
export function parseFullName(full: string): NameParts {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

// A US ZIP or ZIP+4, matched with word boundaries. Global so we can take the LAST hit —
// a leading 5-digit street number ("12345 Main St ... 10001") must not be read as the ZIP.
const ZIP_RE = /\b(\d{5}(?:-\d{4})?)\b/g;
// A trailing standalone 2-letter token = a candidate state code (e.g. "... NY").
const TRAILING_STATE_RE = /\b([A-Za-z]{2})\b\s*$/;
// Real 2-letter state/territory codes only — so a street suffix ("Main St") is never read
// as a state. States + DC + the five inhabited territories.
const STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
  "VA", "WA", "WV", "WI", "WY", "DC", "PR", "VI", "GU", "AS", "MP",
]);

/** Parse a free-text US address into { street, city, state, postalCode }.
 *  Strategy (matches the live parser's intent, hardened): pull the ZIP (last 5/9-digit
 *  group), then the trailing 2-letter state, then the first comma segment is the street and
 *  whatever remains between is the city. Every part is best-effort and independently
 *  optional — missing pieces come back as "". Never throws. */
export function parseAddress(full: string): AddressParts {
  const raw = (full ?? "").trim();
  const out: AddressParts = { street: "", city: "", state: "", postalCode: "" };
  if (!raw) return out;

  const zips = [...raw.matchAll(ZIP_RE)];
  let core = raw;
  if (zips.length) {
    const last = zips[zips.length - 1];
    out.postalCode = last[1];
    core = raw.slice(0, last.index) + raw.slice((last.index ?? 0) + last[0].length);
  }

  const segs = core
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (segs.length === 0) return out;

  const lastSeg = segs[segs.length - 1];
  const st = lastSeg.match(TRAILING_STATE_RE);
  if (st && STATE_CODES.has(st[1].toUpperCase())) {
    out.state = st[1].toUpperCase();
    const trimmed = lastSeg.slice(0, st.index).replace(/[,\s]+$/, "").trim();
    if (trimmed) segs[segs.length - 1] = trimmed;
    else segs.pop();
  }

  out.street = segs.shift() ?? "";
  out.city = segs.join(", ");
  return out;
}
