import { afterEach, describe, expect, it, vi } from "vitest";
import { renderEnvError, validateSupabaseEnv } from "@/lib/validateEnv";

const VALID_URL = "https://mxjuknqwzbvvmmdrvkql.supabase.co";

function setEnv(url: string, publishableKey = "", anonKey = "") {
  vi.stubEnv("VITE_SUPABASE_URL", url);
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", publishableKey);
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", anonKey);
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("validateSupabaseEnv", () => {
  it("blocks startup when the project URL is missing", () => {
    setEnv("", "sb_publishable_valid_for_test");

    expect(validateSupabaseEnv()).toMatchObject({
      title: "VITE_SUPABASE_URL is missing",
      detail: expect.stringContaining("cannot reach the backend"),
    });
  });

  it("blocks startup when both supported client-key variables are blank", () => {
    setEnv(VALID_URL, "   ", " ");

    expect(validateSupabaseEnv()).toMatchObject({
      title: "Supabase client key is missing",
      fix: expect.stringContaining("VITE_SUPABASE_PUBLISHABLE_KEY"),
    });
  });

  it("accepts a modern publishable key", () => {
    setEnv(VALID_URL, "sb_publishable_current_key");

    expect(validateSupabaseEnv()).toBeNull();
  });

  it("accepts the compatibility alias for a modern key", () => {
    setEnv(VALID_URL, "", "sb_publishable_compatibility_key");

    expect(validateSupabaseEnv()).toBeNull();
  });

  it("allows a legacy JWT-shaped key but emits a migration warning", () => {
    setEnv(VALID_URL, "eyJ.header.payload");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(validateSupabaseEnv()).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Legacy JWT-format"));
  });

  it("rejects an unknown key family without printing the whole key", () => {
    const badKey = "definitely-not-a-public-key-and-do-not-log-this-tail";
    setEnv(VALID_URL, badKey);

    const problem = validateSupabaseEnv();
    expect(problem).toMatchObject({
      title: "Unrecognised Supabase publishable key format",
      detail: expect.stringContaining(`${badKey.slice(0, 12)}…`),
    });
    expect(problem?.detail).not.toContain("do-not-log-this-tail");
  });
});

describe("renderEnvError", () => {
  it("renders an escaped, actionable configuration panel", () => {
    document.body.innerHTML = '<main id="root"></main>';
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    renderEnvError({
      title: '<script>alert("title")</script>',
      detail: "A&B > C < D 'quoted'",
      fix: 'Set the "safe" value',
    });

    const root = document.getElementById("root")!;
    expect(root.querySelector("script")).toBeNull();
    expect(root.textContent).toContain('<script>alert("title")</script>');
    expect(root.textContent).toContain("A&B > C < D 'quoted'");
    expect(root.textContent).toContain('Set the "safe" value');
    expect(root.querySelector('a[href="/hq/diagnostics"]')).not.toBeNull();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Frontend boot blocked"),
    );
  });

  it("still reports the problem when the root element is absent", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      renderEnvError({ title: "Missing", detail: "No root", fix: "Reload" }),
    ).not.toThrow();
    expect(error).toHaveBeenCalledOnce();
  });
});
