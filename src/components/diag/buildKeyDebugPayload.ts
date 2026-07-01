// Pure builder for the publishable-key debug payload copied from the diagnostics
// panel. Extracted so it can be unit-tested and so we can guarantee the raw key
// value is never included in the JSON — only the masked form and short checksum.

export type KeyFamily = "new" | "legacy" | "secret" | "missing" | "unknown";

export interface KeyDebugPayloadInput {
  capturedAt: string;
  origin: string | null;
  bundleHash: string | null;
  supaUrl: string | null;
  supaUrlValid: boolean;
  /** Raw publishable key — used ONLY for shape detection; MUST NOT be echoed. */
  supaKey: string | null;
  supaKeyPrefix: string;
  supaKeyMasked: string;
  supaKeyChecksum: string;
  supaKeyLen: number;
  supaKeyShape: string;
  family: KeyFamily;
  paletteLabel: string;
  paletteMsg: string;
  diag:
    | null
    | { error: string; httpStatus?: number | null }
    | {
        error?: undefined;
        supabase?: {
          urlHost?: string | null;
          key?: { family?: string | null; prefix?: string | null; length?: number | null } | null;
        };
      };
}

export interface KeyDebugPayload {
  capturedAt: string;
  origin: string | null;
  bundleHash: string | null;
  supabase: { url: string | null; urlValid: boolean; urlHost: string | null };
  publishableKey: {
    family: KeyFamily;
    status: string;
    message: string;
    masked: string;
    prefix: string;
    checksum: string;
    length: number | null;
    shape: string;
    expectedPrefix: "sb_publishable_";
  };
  serverComparison:
    | { state: "pending" }
    | { state: "error"; error: string; httpStatus: number | null }
    | {
        state: "ok";
        urlHost: string | null;
        keyFamily: string | null;
        keyPrefix: string | null;
        keyLength: number | null;
        familyMatch: boolean;
        prefixMatch: boolean;
        lengthMatch: boolean;
      };
}

function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function detectFamily(key: string | null): string {
  if (!key) return "missing";
  if (key.startsWith("sb_publishable_")) return "sb_publishable";
  if (key.startsWith("sb_secret_")) return "sb_secret";
  if (key.startsWith("eyJ")) return "legacy_jwt";
  return "unknown";
}

export function buildKeyDebugPayload(input: KeyDebugPayloadInput): KeyDebugPayload {
  const {
    capturedAt,
    origin,
    bundleHash,
    supaUrl,
    supaUrlValid,
    supaKey,
    supaKeyPrefix,
    supaKeyMasked,
    supaKeyChecksum,
    supaKeyLen,
    supaKeyShape,
    family,
    paletteLabel,
    paletteMsg,
    diag,
  } = input;

  const publishableKey: KeyDebugPayload["publishableKey"] = {
    family,
    status: paletteLabel,
    message: paletteMsg,
    masked: supaKeyMasked,
    prefix: supaKeyPrefix,
    checksum: supaKeyChecksum,
    length: supaKeyLen || null,
    shape: supaKeyShape,
    expectedPrefix: "sb_publishable_",
  };

  let serverComparison: KeyDebugPayload["serverComparison"];
  if (diag === null) {
    serverComparison = { state: "pending" };
  } else if ("error" in diag && diag.error) {
    serverComparison = {
      state: "error",
      error: diag.error,
      httpStatus: diag.httpStatus ?? null,
    };
  } else {
    const serverKey = (diag as { supabase?: { key?: { family?: string | null; prefix?: string | null; length?: number | null } | null } }).supabase?.key;
    serverComparison = {
      state: "ok",
      urlHost: (diag as { supabase?: { urlHost?: string | null } }).supabase?.urlHost ?? null,
      keyFamily: serverKey?.family ?? null,
      keyPrefix: serverKey?.prefix ?? null,
      keyLength: serverKey?.length ?? null,
      familyMatch: (serverKey?.family ?? null) === detectFamily(supaKey),
      prefixMatch: (serverKey?.prefix ?? "") === supaKeyPrefix,
      lengthMatch: (serverKey?.length ?? -1) === supaKeyLen,
    };
  }

  return {
    capturedAt,
    origin,
    bundleHash,
    supabase: {
      url: supaUrl ?? null,
      urlValid: supaUrlValid,
      urlHost: hostOf(supaUrl),
    },
    publishableKey,
    serverComparison,
  };
}
