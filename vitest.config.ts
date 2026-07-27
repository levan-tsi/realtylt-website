import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  // tsconfig says jsx:"preserve" (Next compiles it) — vitest has to transform the JSX in
  // lib/blog/markdown.tsx itself, so tell esbuild to emit the automatic runtime.
  esbuild: { jsx: "automatic" },
  test: {
    // content/** was missing from this list, so content/boroughs.test.ts had never actually
    // run — the file was dead weight. It passes, and the Top Areas nav-link guards it now
    // carries only mean something if the file is live.
    include: [
      "lib/**/*.test.ts",
      "app/**/*.test.ts",
      "components/**/*.test.ts",
      "content/**/*.test.ts",
    ],
  },
});
