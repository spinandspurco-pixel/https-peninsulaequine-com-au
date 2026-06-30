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
      // Agreed thresholds — set just below the current full-src baseline
      // (statements 4.3% / branches 3.9% / functions 3.0% / lines 4.4%)
      // so a real regression breaks CI while routine churn does not.
      // The baseline is low because the suite focuses on guards/utilities;
      // raise these numbers in lockstep as new test files land. Never lower
      // them without an explicit review note in the PR description.
      thresholds: {
        statements: 4,
        branches: 3.5,
        functions: 2.5,
        lines: 4,
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
