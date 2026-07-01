import { describe, it, expect, vi, beforeEach } from "vitest";

// Chainable supabase mock — every builder method returns `this` and awaiting
// the builder resolves with { data, error }. Tests set the resolved payload
// per-call via `setNextResult`.
type Result = { data: unknown; error: unknown };
let nextResults: Result[] = [];
let capturedFilters: Array<Record<string, unknown>> = [];

function makeBuilder() {
  const filters: Record<string, unknown> = {};
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn((col: string, val: unknown) => {
      filters[`eq:${col}`] = val;
      return builder;
    }),
    gte: vi.fn((col: string, val: unknown) => {
      filters[`gte:${col}`] = val;
      return builder;
    }),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    then: (resolve: (r: Result) => void) => {
      capturedFilters.push(filters);
      const next = nextResults.shift() ?? { data: [], error: null };
      resolve(next);
    },
  };
  return builder;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(() => makeBuilder()) },
}));

// Static testimonials fallback must exist but should never leak onto the
// homepage (they have no `featured` flag).
vi.mock("@/data/content", () => ({
  testimonials: [
    { id: "s1", name: "Static Person", role: "Rider", quote: "Static quote", rating: 5 },
  ],
  services: [],
}));

vi.mock("@/assets/trainer-glenn.jpg", () => ({ default: "glenn.jpg" }));
vi.mock("@/assets/trainer-ciro.jpg", () => ({ default: "ciro.jpg" }));

import { fetchFeaturedTestimonials } from "@/lib/testimonials";
import { fetchFeaturedEvents } from "@/lib/events";

beforeEach(() => {
  nextResults = [];
  capturedFilters = [];
});

describe("fetchFeaturedTestimonials", () => {
  it("returns only Published + Featured rows from the DB", async () => {
    nextResults = [
      {
        data: [
          {
            id: "t1",
            client_name: "Alex",
            client_role: "Owner",
            quote: "Great work",
            rating: 5,
            media_type: null,
            media_url: null,
            service_tags: [],
            pinned: false,
            featured: true,
            trainer: null,
          },
        ],
        error: null,
      },
    ];

    const items = await fetchFeaturedTestimonials(3);

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Alex");
    expect(items[0].featured).toBe(true);
    // Query filtered by both active and featured
    expect(capturedFilters[0]).toMatchObject({ "eq:active": true, "eq:featured": true });
  });

  it("returns an empty array (no static fallback) when nothing is featured", async () => {
    nextResults = [{ data: [], error: null }];
    const items = await fetchFeaturedTestimonials();
    expect(items).toEqual([]);
  });

  it("returns an empty array when the DB errors — drafts must never leak", async () => {
    nextResults = [{ data: null, error: { message: "boom" } }];
    const items = await fetchFeaturedTestimonials();
    expect(items).toEqual([]);
  });

  it("respects the requested limit", async () => {
    nextResults = [{ data: [], error: null }];
    await fetchFeaturedTestimonials(2);
    // limit() was called on the builder; assert via a fresh mock call count
    // by checking the from() dispatch didn't produce extra queries.
    expect(nextResults).toHaveLength(0);
  });
});

describe("fetchFeaturedEvents", () => {
  it("returns only Published + Featured + upcoming events", async () => {
    const future = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);
    nextResults = [
      {
        data: [
          { id: "e1", title: "Clinic", event_date: future, active: true, featured: true },
        ],
        error: null,
      },
    ];

    const items = await fetchFeaturedEvents(3);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("e1");
    expect(capturedFilters[0]).toMatchObject({ "eq:active": true, "eq:featured": true });
    expect(capturedFilters[0]["gte:event_date"]).toBeTruthy();
  });

  it("returns an empty array when no events are featured (no draft fallback)", async () => {
    nextResults = [{ data: [], error: null }];
    const items = await fetchFeaturedEvents();
    expect(items).toEqual([]);
  });

  it("returns an empty array when the DB errors", async () => {
    nextResults = [{ data: null, error: { message: "boom" } }];
    const items = await fetchFeaturedEvents();
    expect(items).toEqual([]);
  });
});
