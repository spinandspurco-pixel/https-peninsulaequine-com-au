import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvKeyDebug } from "./EnvKeyDebug";

/**
 * Verifies the family-detection branches surfaced by <EnvKeyDebug />:
 *   - sb_publishable_* (modern, OK)
 *   - eyJ…            (legacy JWT, sign-in disabled)
 *   - missing         (undefined / empty)
 *
 * Also covers the production tree-shake guard so the badge cannot leak
 * into production bundles.
 */

const renderWithEnv = (opts: {
  key?: string;
  prod?: boolean;
  mode?: string;
}) => {
  vi.stubEnv("PROD", opts.prod ? "true" : "");
  vi.stubEnv("MODE", opts.mode ?? "development");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", opts.key ?? "");
  return render(<EnvKeyDebug />);
};

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("<EnvKeyDebug /> family detection", () => {
  it("renders OK badge with sb_publishable_ prefix when the modern key is present", async () => {
    renderWithEnv({
      key: "sb_publishable_abcdefghij1234567890ABCDEF",
    });
    const badge = screen.getByTestId("env-key-debug");
    expect(badge).toHaveAttribute(
      "aria-label",
      "Supabase key family: modern",
    );
    expect(within(badge).getByText(/SUPABASE KEY · OK/)).toBeInTheDocument();
    expect(within(badge).getByText("sb_publishable_")).toBeInTheDocument();

    // Expanding the badge should not surface the corrective message
    // because a modern key is already healthy.
    await userEvent.click(badge);
    expect(
      within(badge).queryByText(/Supabase disabled this key family/),
    ).not.toBeInTheDocument();
    expect(within(badge).getByText("length")).toBeInTheDocument();
  });

  it("renders LEGACY badge with eyJ… prefix and disabled-key message for a JWT key", async () => {
    renderWithEnv({
      key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature",
    });
    const badge = screen.getByTestId("env-key-debug");
    expect(badge).toHaveAttribute(
      "aria-label",
      "Supabase key family: legacy_jwt",
    );
    expect(within(badge).getByText(/SUPABASE KEY · LEGACY/)).toBeInTheDocument();
    expect(
      within(badge).getByText(/eyJ… \(legacy JWT\)/),
    ).toBeInTheDocument();

    await userEvent.click(badge);
    expect(
      within(badge).getByText(/Supabase disabled this key family/),
    ).toBeInTheDocument();
  });

  it("renders MISSING badge with (missing) prefix when the env var is empty", async () => {
    renderWithEnv({ key: "" });
    const badge = screen.getByTestId("env-key-debug");
    expect(badge).toHaveAttribute(
      "aria-label",
      "Supabase key family: missing",
    );
    expect(within(badge).getByText(/SUPABASE KEY · MISSING/)).toBeInTheDocument();
    expect(within(badge).getByText("(missing)")).toBeInTheDocument();

    await userEvent.click(badge);
    // Length falls back to em-dash sentinel when no key is configured.
    expect(within(badge).getByText("—")).toBeInTheDocument();
    expect(
      within(badge).getByText(/No Supabase publishable key is configured/),
    ).toBeInTheDocument();
  });

  it("renders nothing in production builds so the badge cannot ship to end users", () => {
    renderWithEnv({
      key: "sb_publishable_abcdefghij1234567890ABCDEF",
      prod: true,
      mode: "production",
    });
    expect(screen.queryByTestId("env-key-debug")).toBeNull();
  });
});
