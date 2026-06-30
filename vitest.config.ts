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
