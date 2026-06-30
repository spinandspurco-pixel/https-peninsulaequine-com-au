import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const BUILD_TIME = new Date().toISOString();
const BUILD_COMMIT =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.COMMIT_REF ||
  process.env.GITHUB_SHA ||
  "local";

/**
 * Emits a static `api/build-info` (and `.json` alias) into the build output
 * so the deployed site exposes /api/build-info as a JSON document containing
 * build time, the main bundle hash, and the commit SHA. No server required —
 * Vercel/Netlify/CF Pages all serve static files in front of SPA rewrites.
 */
function buildInfoPlugin(): PluginOption {
  return {
    name: "emit-build-info",
    apply: "build",
    generateBundle(_options, bundle) {
      let bundleHash: string | null = null;
      for (const fileName of Object.keys(bundle)) {
        const m = fileName.match(/^assets\/(index-[A-Za-z0-9_-]+\.js)$/);
        if (m) {
          bundleHash = m[1];
          break;
        }
      }
      const payload = {
        buildTime: BUILD_TIME,
        buildCommit: BUILD_COMMIT,
        bundleHash,
      };
      const source = JSON.stringify(payload, null, 2) + "\n";
      this.emitFile({ type: "asset", fileName: "api/build-info", source });
      this.emitFile({ type: "asset", fileName: "api/build-info.json", source });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    buildInfoPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
    __BUILD_COMMIT__: JSON.stringify(BUILD_COMMIT),
  },
}));
