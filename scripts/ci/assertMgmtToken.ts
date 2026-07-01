/**
 * Runtime guard for the Supabase management API token.
 *
 * Any server-side script or CI job that talks to https://api.supabase.com MUST
 * call `assertMgmtToken()` before making a request. It:
 *   1. Fails loudly if SB_MGMT_ACCESS_TOKEN is undefined / empty.
 *   2. Refuses to run in a browser-like environment — the management token is
 *      strictly server-side and must never be bundled to the client.
 *   3. Installs a `console.*` sanitiser that redacts the token from any log
 *      line, so an accidental `console.log(err)` cannot leak it.
 *   4. Installs Node `uncaughtException` and `unhandledRejection` handlers
 *      that scrub thrown errors — including `.message`, `.stack`, and any
 *      `.cause` chain — before Node prints them to stderr. This ensures a
 *      crash from `fetch(url, { headers: { Authorization: `Bearer ${token}` }})`
 *      that echoes the request back cannot leak the token in the crash log.
 *   5. Exposes `scrubError()` so callers can defensively re-throw scrubbed
 *      copies of caught errors.
 */

const REDACTED = "[REDACTED:SB_MGMT_ACCESS_TOKEN]";
const TOKEN_NAME = "SB_MGMT_ACCESS_TOKEN";

export class MissingMgmtTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingMgmtTokenError";
  }
}

export class ClientSideMgmtTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientSideMgmtTokenError";
  }
}

function isBrowserLike(): boolean {
  const hasWindow = typeof (globalThis as { window?: unknown }).window !== "undefined";
  const hasDocument = typeof (globalThis as { document?: unknown }).document !== "undefined";
  const hasNodeProcess =
    typeof (globalThis as { process?: { versions?: { node?: string } } }).process?.versions?.node ===
    "string";
  return (hasWindow || hasDocument) && !hasNodeProcess;
}

let sanitiserInstalled = false;
let processHandlersInstalled = false;
let activeToken = "";

function scrubString(value: string, token: string): string {
  let out = value;
  if (token && token.length >= 8 && out.includes(token)) {
    out = out.split(token).join(REDACTED);
  }
  return out;
}

/**
 * Deep-scrub an arbitrary value: strings, Error objects (including
 * `.message`, `.stack`, and recursive `.cause` chains), and plain
 * objects/arrays via JSON round-trip. Returns a cloned value so the
 * original reference stays untouched.
 */
export function scrub(value: unknown, token: string = activeToken): unknown {
  if (!token) return value;
  if (typeof value === "string") return scrubString(value, token);
  if (value instanceof Error) return scrubError(value, token);
  if (value && typeof value === "object") {
    try {
      const serialised = JSON.stringify(value);
      if (serialised.includes(token)) {
        return JSON.parse(scrubString(serialised, token));
      }
    } catch {
      // circular / non-serialisable objects fall through unchanged
    }
  }
  return value;
}

/**
 * Return a cloned Error whose `.message`, `.stack`, and `.cause` chain have
 * been scrubbed of the token. The original error is never mutated. Safe to
 * call before `throw` or before handing the error to a logger.
 */
export function scrubError(err: unknown, token: string = activeToken): Error {
  if (!(err instanceof Error)) {
    return new Error(typeof err === "string" ? scrubString(err, token) : String(err));
  }
  const message = scrubString(err.message ?? "", token);
  const clone = new Error(message);
  clone.name = err.name;
  if (typeof err.stack === "string") clone.stack = scrubString(err.stack, token);
  const cause = (err as { cause?: unknown }).cause;
  if (cause !== undefined) {
    (clone as { cause?: unknown }).cause = scrub(cause, token);
  }
  return clone;
}

function installConsoleSanitiser(token: string): void {
  if (sanitiserInstalled) return;
  sanitiserInstalled = true;

  const methods: Array<"log" | "info" | "warn" | "error" | "debug"> = [
    "log", "info", "warn", "error", "debug",
  ];
  for (const method of methods) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args.map((a) => scrub(a, token)));
    };
  }
}

/**
 * Attach Node-level handlers so a thrown error that bubbles all the way to
 * the runtime — either sync via `uncaughtException` or async via
 * `unhandledRejection` — has its message + stack scrubbed before Node
 * prints them. We re-emit the scrubbed error and exit with a non-zero code
 * so CI still fails, but the log line is safe.
 */
function installProcessHandlers(token: string): void {
  if (processHandlersInstalled) return;
  const proc = (globalThis as { process?: NodeJS.Process }).process;
  if (!proc || typeof proc.on !== "function") return;
  processHandlersInstalled = true;

  proc.on("uncaughtException", (err: unknown) => {
    const safe = scrubError(err, token);
    // Direct stderr write bypasses any user-added console wrapper stack.
    proc.stderr?.write?.(`Uncaught: ${safe.stack ?? safe.message}\n`);
    proc.exit?.(1);
  });

  proc.on("unhandledRejection", (reason: unknown) => {
    const safe = scrubError(reason, token);
    proc.stderr?.write?.(`Unhandled rejection: ${safe.stack ?? safe.message}\n`);
    proc.exit?.(1);
  });
}

export interface AssertMgmtTokenOptions {
  /** Override the env source (used in tests). */
  env?: Record<string, string | undefined>;
  /** Skip installing the console sanitiser (used in tests). */
  skipConsoleSanitiser?: boolean;
  /** Skip installing the Node process handlers (used in tests). */
  skipProcessHandlers?: boolean;
}

export function assertMgmtToken(options: AssertMgmtTokenOptions = {}): string {
  if (isBrowserLike()) {
    throw new ClientSideMgmtTokenError(
      `${TOKEN_NAME} must never be read from a browser bundle. ` +
        "Move the caller into a script, edge function, or CI job.",
    );
  }

  const env = options.env ?? (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const token = env.SB_MGMT_ACCESS_TOKEN;
  if (!token || token.trim() === "") {
    throw new MissingMgmtTokenError(
      `${TOKEN_NAME} is not set. Add it to the GitHub Actions / server environment before calling the Supabase management API.`,
    );
  }

  activeToken = token;
  if (!options.skipConsoleSanitiser) installConsoleSanitiser(token);
  if (!options.skipProcessHandlers) installProcessHandlers(token);

  return token;
}
