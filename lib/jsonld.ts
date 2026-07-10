/** Serialize a value for safe embedding inside a <script type="application/ld+json">.
 *
 * Plain JSON.stringify does NOT escape `<`, so a string value containing "</script>"
 * (or "<!--") breaks out of the script element and executes as HTML — a stored-XSS
 * vector once live-feed listing fields (PublicRemarks, address, office name) flow into
 * JSON-LD. Escaping `<`/`>`/`&` to their \u forms — plus the U+2028/U+2029 line
 * separators that are invalid raw in a script context — keeps the output valid JSON
 * while making break-out impossible. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
