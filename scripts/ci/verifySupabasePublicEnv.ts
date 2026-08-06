#!/usr/bin/env bun

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

type FetchLike = typeof fetch;

export interface SupabasePublicEnv {
  projectId: string;
  url: string;
  publishableKey: string;
}

function decodeLegacyPayload(key: string): Record<string, unknown> | null {
  const parts = key.split(".");
  if (parts.length !== 3 || !parts.every(Boolean)) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function validateSupabasePublicEnv(input: SupabasePublicEnv): URL {
  const projectId = input.projectId.trim();
  const rawUrl = input.url.trim();
  const key = input.publishableKey.trim();

  if (!projectId || !rawUrl || !key) {
    throw new Error(
      "Missing VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_URL, or VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("VITE_SUPABASE_URL is not a valid URL.");
  }

  const expectedHost = `${projectId}.supabase.co`;
  if (url.protocol !== "https:" || url.hostname !== expectedHost) {
    throw new Error(
      `Supabase URL/project mismatch: expected https://${expectedHost}.`,
    );
  }

  const modernKey =
    key.startsWith("sb_publishable_") &&
    key.length > "sb_publishable_".length + 16 &&
    !/\s/.test(key);
  const legacyPayload = decodeLegacyPayload(key);
  const legacyAnonKey =
    legacyPayload?.role === "anon" &&
    (legacyPayload.ref === undefined || legacyPayload.ref === projectId);

  if (!modernKey && !legacyAnonKey) {
    throw new Error(
      "VITE_SUPABASE_PUBLISHABLE_KEY is not a valid publishable key or three-part legacy anon JWT.",
    );
  }

  return url;
}

export async function verifySupabasePublicEnv(
  input: SupabasePublicEnv,
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  const url = validateSupabasePublicEnv(input);
  const endpoint = new URL("/auth/v1/settings", url);
  const response = await fetchImpl(endpoint, {
    headers: {
      Accept: "application/json",
      apikey: input.publishableKey.trim(),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Supabase rejected the configured public credentials (HTTP ${response.status}).`,
    );
  }
}

async function main(): Promise<void> {
  const input: SupabasePublicEnv = {
    projectId: process.env.VITE_SUPABASE_PROJECT_ID ?? "",
    url: process.env.VITE_SUPABASE_URL ?? "",
    publishableKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
  };
  await verifySupabasePublicEnv(input);
  console.log(`Supabase public credentials verified for project ${input.projectId}.`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
