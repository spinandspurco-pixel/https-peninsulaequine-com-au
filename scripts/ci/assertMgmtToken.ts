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
 */

const REDACTED = "[REDACTED:SB_MGMT_ACCESS_TOKEN]";

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
  // `window`/`document` present without a Node `process` = browser bundle.
  const hasWindow = typeof (globalThis as { window?: unknown }).window !== "undefined";
  const hasDocument = typeof (globalThis as { document?: unknown }).document !== "undefined";
  const hasNodeProcess =
    typeof (globalThis as { process?: { versions?: { node?: string } } }).process?.versions?.node ===
    "string";
  return (hasWindow || hasDocument) && !hasNodeProcess;
}

let sanitiserInstalled = false;

function installConsoleSanitiser(token: string): void {
  if (sanitiserInstalled) return;
  sanitiserInstalled = true;

  const methods: Array<"log" | "info" | "warn" | "error" | "debug"> = [
    "log",
    "info",
    "warn",
    "error",
    "debug",
  ];

  for (const method of methods) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      const scrubbed = args.map((arg) => scrub(arg, token));
      original(...scrubbed);
    };
  }
}

function scrub(value: unknown, token: string): unknown {
  if (typeof value === "string") {
    return value.includes(token) ? value.split(token).join(REDACTED) : value;
  }
  if (value instanceof Error) {
    const message = scrub(value.message, token) as string;
    if (message !== value.message) {
      const clone = new Error(message);
      clone.name = value.name;
      clone.stack = typeof value.stack === "string" ? (scrub(value.stack, token) as string) : value.stack;
      return clone;
    }
    return value;
  }
  if (value && typeof value === "object") {
    try {
      const serialised = JSON.stringify(value);
      if (serialised.includes(token)) {
        return JSON.parse(serialised.split(token).join(REDACTED));
      }
    } catch {
      // circular / non-serialisable objects fall through unchanged
    }
  }
  return value;
}

export interface AssertMgmtTokenOptions {
  /** Override the env source (used in tests). */
  env?: Record<string, string | undefined>;
  /** Skip installing the console sanitiser (used in tests). */
  skipConsoleSanitiser?: boolean;
}

export function assertMgmtToken(options: AssertMgmtTokenOptions = {}): string {
  if (isBrowserLike()) {
    throw new ClientSideMgmtTokenError(
      "SB_MGMT_ACCESS_TOKEN must never be read from a browser bundle. " +
        "Move the caller into a script, edge function, or CI job.",
    );
  }

  const env = options.env ?? (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const token = env.SB_MGMT_ACCESS_TOKEN;
  if (!token || token.trim() === "") {
    throw new MissingMgmtTokenError(
      "SB_MGMT_ACCESS_TOKEN is not set. Add it to the GitHub Actions / server environment before calling the Supabase management API.",
    );
  }

  if (!options.skipConsoleSanitiser) {
    installConsoleSanitiser(token);
  }

  return token;
}
