import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
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
  vi.stubEnv("PROD", opts.prod === true);
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

describe("<EnvKeyDebug /> copy button", () => {
  const KEY = "sb_publishable_abcdefghij1234567890ABCDEF";

  const setClipboard = (writeText: (t: string) => Promise<void>) => {
    Object.defineProperty(window, "navigator", {
      configurable: true,
      value: { ...window.navigator, clipboard: { writeText } },
    });
  };

  it("shows ✓ Copied and writes the expected JSON payload on success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    renderWithEnv({ key: KEY, mode: "development" });
    const user = userEvent.setup();

    const badge = screen.getByTestId("env-key-debug");
    await user.click(badge); // expand to reveal the copy button
    const copyBtn = screen.getByTestId("env-key-debug-copy");
    expect(copyBtn).toHaveTextContent("Copy payload");

    await user.click(copyBtn);

    expect(writeText).toHaveBeenCalledTimes(1);
    const written = JSON.parse(writeText.mock.calls[0][0] as string);
    expect(written).toEqual({
      family: "modern",
      prefix: "sb_publishable_",
      length: KEY.length,
      mode: "development",
    });
    await waitFor(() => expect(copyBtn).toHaveTextContent("✓ Copied"));

    // Status auto-resets after ~1.5s.
    await waitFor(
      () => expect(copyBtn).toHaveTextContent("Copy payload"),
      { timeout: 2500 },
    );
  });

  it("shows Copy failed when the clipboard write rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    setClipboard(writeText);

    renderWithEnv({ key: KEY });
    const user = userEvent.setup();

    await user.click(screen.getByTestId("env-key-debug"));
    const copyBtn = screen.getByTestId("env-key-debug-copy");

    await user.click(copyBtn);

    expect(writeText).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(copyBtn).toHaveTextContent("Copy failed"));

    await waitFor(
      () => expect(copyBtn).toHaveTextContent("Copy payload"),
      { timeout: 2500 },
    );
  });
});

