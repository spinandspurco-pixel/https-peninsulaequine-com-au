import { describe, expect, it, vi } from "vitest";
import {
  validateSupabasePublicEnv,
  verifySupabasePublicEnv,
} from "../../scripts/ci/verifySupabasePublicEnv";

const PROJECT_ID = "xnjwraqanimjbxdctkwz";
const URL = `https://${PROJECT_ID}.supabase.co`;
const PUBLISHABLE_KEY = `sb_publishable_${"a".repeat(31)}`;

describe("Supabase public environment preflight", () => {
  it("accepts a matching project URL and modern publishable key", () => {
    expect(
      validateSupabasePublicEnv({
        projectId: PROJECT_ID,
        url: URL,
        publishableKey: PUBLISHABLE_KEY,
      }).hostname,
    ).toBe(`${PROJECT_ID}.supabase.co`);
  });

  it("rejects a payload fragment masquerading as a legacy JWT", () => {
    expect(() =>
      validateSupabasePublicEnv({
        projectId: PROJECT_ID,
        url: URL,
        publishableKey: "eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIn0",
      }),
    ).toThrow(/three-part legacy anon JWT/);
  });

  it("rejects a URL wired to a different project", () => {
    expect(() =>
      validateSupabasePublicEnv({
        projectId: PROJECT_ID,
        url: "https://anotherprojectref.supabase.co",
        publishableKey: PUBLISHABLE_KEY,
      }),
    ).toThrow(/URL\/project mismatch/);
  });

  it("makes a lightweight authenticated request without an Authorization header", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );

    await verifySupabasePublicEnv(
      {
        projectId: PROJECT_ID,
        url: URL,
        publishableKey: PUBLISHABLE_KEY,
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init?.headers).get("apikey")).toBe(PUBLISHABLE_KEY);
    expect(new Headers(init?.headers).has("authorization")).toBe(false);
  });

  it("turns rejected live credentials into one actionable error", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("{}", { status: 401 }),
    );

    await expect(
      verifySupabasePublicEnv(
        {
          projectId: PROJECT_ID,
          url: URL,
          publishableKey: PUBLISHABLE_KEY,
        },
        fetchMock,
      ),
    ).rejects.toThrow(/rejected.*HTTP 401/i);
  });
});
