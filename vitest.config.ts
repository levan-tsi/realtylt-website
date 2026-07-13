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
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
  },
});
