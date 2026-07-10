import { describe, expect, it } from "vitest";
import { jsonLdScript } from "./jsonld";

const U2028 = String.fromCharCode(0x2028);
const U2029 = String.fromCharCode(0x2029);

describe("jsonLdScript", () => {
  it("escapes </script> so it can't break out of the script element", () => {
    const out = jsonLdScript({ description: "Great home </script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<script>");
    expect(out).toContain("\\u003c");
    // Still round-trips to the original value.
    expect(JSON.parse(out).description).toBe("Great home </script><script>alert(1)</script>");
  });

  it("escapes < > & and U+2028/U+2029 line separators", () => {
    const raw = `a<b>c&d${U2028}e${U2029}f`;
    const out = jsonLdScript({ v: raw });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain("&");
    expect(out).not.toContain(U2028);
    expect(out).not.toContain(U2029);
    expect(JSON.parse(out).v).toBe(raw);
  });

  it("produces valid JSON for normal input", () => {
    const data = { "@context": "https://schema.org", "@type": "Thing", name: "Test" };
    expect(JSON.parse(jsonLdScript(data))).toEqual(data);
  });
});
