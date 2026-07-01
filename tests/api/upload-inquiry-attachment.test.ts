import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMocks } from "node-mocks-http";

// We will mock @supabase/supabase-js inside the API module; the handler imports createClient directly.
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    storage: { from: () => ({ upload: vi.fn(), remove: vi.fn(), download: vi.fn() }) },
    from: () => ({ insert: vi.fn().mockResolvedValue({ data: { id: "a" } }), update: vi.fn(), delete: vi.fn() }),
  }),
}));

import handler from "@/pages/api/upload-inquiry-attachment";

describe("upload-inquiry-attachment API", () => {
  it("rejects non-POST", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  // Note: full multipart parsing tests would require more setup. We ensure the route exists and the method guard works.
});
