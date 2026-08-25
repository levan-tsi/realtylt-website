import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** POSTHOG ONLY WORKS WHILE THREE FILES AGREE, AND NOTHING ELSE HOLDS THEM TOGETHER.
 *
 * The install (round 39) is deliberately proxy-shaped: the browser talks ONLY to /relay-ph
 * on our own origin, next.config.ts rewrites that to PostHog's US cloud, and the guarded
 * CSP therefore needed zero new origins. That design has three parts that can drift apart
 * silently — the init component's api_host, the two rewrites, and the layout mount — and a
 * drift in any one of them fails exactly like the 2026-08-20 chat outage did: every event
 * dropped in the browser while every gate stays green. Same idiom as lib/chat-csp.test.ts.
 */

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("posthog proxy contract", () => {
  it("the init component points at the proxy path, not a posthog origin", () => {
    const init = read("components/site/PostHogInit.tsx");
    expect(init).toContain('api_host: "/relay-ph"');
    expect(init).not.toMatch(/api_host:\s*"https?:/);
  });

  it("next.config.ts carries both rewrites the proxy path needs", () => {
    const cfg = read("next.config.ts");
    expect(cfg).toContain('source: "/relay-ph/static/:path*"');
    expect(cfg).toContain("us-assets.i.posthog.com/static/:path*");
    expect(cfg).toContain('source: "/relay-ph/:path*"');
    expect(cfg).toContain("https://us.i.posthog.com/:path*");
    // The static rewrite must come FIRST or the catch-all swallows asset requests.
    expect(cfg.indexOf("/relay-ph/static/:path*")).toBeLessThan(cfg.indexOf('"/relay-ph/:path*"'));
  });

  it("the layout mounts the init component", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toContain("<PostHogInit />");
  });

  it("the owner-approved privacy stance is in the config: cookieless, inputs masked", () => {
    const init = read("components/site/PostHogInit.tsx");
    // No cookie is what keeps the site's no-banner stance honest.
    expect(init).toContain('persistence: "localStorage"');
    expect(init).toContain("maskAllInputs: true");
  });
});
