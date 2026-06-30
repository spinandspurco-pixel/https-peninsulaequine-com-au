import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Pin Vitest's typechecker to the same tsconfig the app uses so test
    // files inherit `vitest/globals` + `node` types and the @/* alias.
    typecheck: {
      tsconfig: "./tsconfig.app.json",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      // Cover application source only — exclude tests, config, generated
      // Supabase types, and entry shims that have no meaningful logic.
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/integrations/supabase/types.ts",
        "src/types/**",
      ],
      // Agreed thresholds — set ~4pp below the current baseline
      // (statements 59% / branches 51% / functions 57% / lines 62%) so
      // routine churn doesn't break CI but a real regression does.
      // Raise these as coverage improves; never lower without review.
      thresholds: {
        statements: 55,
        branches: 47,
        functions: 53,
        lines: 57,
      },
    },
  },
  // Ensure the esbuild transform that powers Vitest also reads tsconfig.app,
  // keeping path aliases and target/lib settings consistent with the build.
  esbuild: {
    tsconfigRaw: undefined,
    target: "es2020",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
