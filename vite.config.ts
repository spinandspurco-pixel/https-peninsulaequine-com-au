import { defineConfig, loadEnv, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import {
  makeBuildInfoPayload,
  makeDiagPayload,
  makeHealthPayload,
} from "./src/lib/healthPayload";

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
 *
 * Also emits `/api/diag` — a non-secret snapshot of the Supabase env vars
 * baked into the bundle (URL host + key prefix/family/length). Used by
 * support to confirm what the deployed frontend is wired to after a
 * republish without ever exposing the key value itself.
 */
function buildInfoPlugin(supabaseUrl: string | null, supabaseKey: string | null): PluginOption {
  const makeBuildInfo = (bundleHash: string | null) =>
    JSON.stringify(
      makeBuildInfoPayload({ buildTime: BUILD_TIME, buildCommit: BUILD_COMMIT, bundleHash }),
      null,
      2,
    ) + "\n";

  const makeHealth = (bundleHash: string | null) =>
    JSON.stringify(
      makeHealthPayload({ buildTime: BUILD_TIME, buildCommit: BUILD_COMMIT, bundleHash }),
      null,
      2,
    ) + "\n";

  const makeDiag = (bundleHash: string | null) =>
    JSON.stringify(
      makeDiagPayload({
        buildTime: BUILD_TIME,
        buildCommit: BUILD_COMMIT,
        bundleHash,
        supabaseUrl,
        supabaseKey,
      }),
      null,
      2,
    ) + "\n";

  return {
    name: "emit-build-info",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const url = req.url.split("?")[0];
        const json = (body: string) => {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(body);
        };
        if (url === "/api/build-info" || url === "/api/build-info.json") {
          return json(makeBuildInfo(null));
        }
        if (url === "/api/health" || url === "/api/health.json") {
          return json(makeHealth(null));
        }
        if (url === "/api/diag" || url === "/api/diag.json") {
          return json(makeDiag(null));
        }
        next();
      });
    },
    generateBundle(_options, bundle) {
      let bundleHash: string | null = null;
      for (const fileName of Object.keys(bundle)) {
        const m = fileName.match(/^assets\/(index-[A-Za-z0-9_-]+\.js)$/);
        if (m) {
          bundleHash = m[1];
          break;
        }
      }
      const buildInfo = makeBuildInfo(bundleHash);
      this.emitFile({ type: "asset", fileName: "api/build-info", source: buildInfo });
      this.emitFile({ type: "asset", fileName: "api/build-info.json", source: buildInfo });
      const health = makeHealth(bundleHash);
      this.emitFile({ type: "asset", fileName: "api/health", source: health });
      this.emitFile({ type: "asset", fileName: "api/health.json", source: health });
      const diag = makeDiag(bundleHash);
      this.emitFile({ type: "asset", fileName: "api/diag", source: diag });
      this.emitFile({ type: "asset", fileName: "api/diag.json", source: diag });
    },
  };
}




// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL ?? null;
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? null;
  return {
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
    buildInfoPlugin(supabaseUrl, supabaseKey),
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
  };
});

