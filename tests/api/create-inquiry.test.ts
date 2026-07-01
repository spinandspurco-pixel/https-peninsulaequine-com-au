import { describe, it, expect, vi } from "vitest";
import { createMocks } from "node-mocks-http";

vi.mock("@supabase/supabase-js", () => {
  const mClient = { rpc: vi.fn() };
  return { createClient: () => mClient };
});

import handler from "@/pages/api/create-inquiry";

describe("create-inquiry RPC wrapper", () => {
  it("returns 400 when missing name/email", async () => {
    const { req, res } = createMocks({ method: "POST", body: { name: "", email: "" } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("calls RPC with params", async () => {
    const supa = require("@supabase/supabase-js").createClient();
    supa.rpc.mockResolvedValue({ data: { id: "inquiry-1" }, error: null });
    const { req, res } = createMocks({ method: "POST", body: { name: "A", email: "a@b.com", attachment_ids: [] } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.inquiry).toBeDefined();
  });
});
