import { afterEach, describe, expect, it, vi } from "vitest";

import { probeGoogleOAuth } from "@/lib/probeGoogleOAuth";

describe("probeGoogleOAuth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the production auth callback and detects a disabled provider", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      type: "basic",
      ok: false,
      status: 400,
      text: async () =>
        JSON.stringify({ msg: "Unsupported provider: provider is not enabled" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      probeGoogleOAuth(
        "https://project.supabase.co",
        "https://peninsulaequine.systems",
      ),
    ).resolves.toMatchObject({ status: "misconfigured" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://project.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fpeninsulaequine.systems%2Fauth%2Fcallback",
      expect.objectContaining({ mode: "cors", redirect: "manual" }),
    );
  });

  it("accepts Supabase redirecting to Google", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ type: "opaqueredirect", ok: false, status: 0 }),
    );

    await expect(
      probeGoogleOAuth(
        "https://project.supabase.co",
        "https://peninsulaequine.systems",
      ),
    ).resolves.toMatchObject({ status: "ok" });
  });

  it("stays silent when the auth service is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(
      probeGoogleOAuth(
        "https://project.supabase.co",
        "https://peninsulaequine.systems",
      ),
    ).resolves.toMatchObject({ status: "unknown" });
  });
});
