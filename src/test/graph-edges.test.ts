import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GraphEdge } from "@/lib/graph/types";

type QueryResult = {
  data?: unknown;
  error: unknown;
  count?: number | null;
};

type ChainMethod =
  | "select"
  | "upsert"
  | "single"
  | "update"
  | "delete"
  | "eq"
  | "in"
  | "order"
  | "limit";

type MockBuilder = Record<ChainMethod, ReturnType<typeof vi.fn>> & {
  then: (resolve: (result: QueryResult) => void) => void;
};

const resultQueue: QueryResult[] = [];
const builders: MockBuilder[] = [];
const tableCalls: string[] = [];

function makeBuilder(): MockBuilder {
  const builder = {} as MockBuilder;
  const chain = () => vi.fn((..._args: unknown[]) => builder);

  Object.assign(builder, {
    select: chain(),
    upsert: chain(),
    single: chain(),
    update: chain(),
    delete: chain(),
    eq: chain(),
    in: chain(),
    order: chain(),
    limit: chain(),
    then: (resolve) => {
      resolve(resultQueue.shift() ?? { data: [], error: null, count: null });
    },
  });

  return builder;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      tableCalls.push(table);
      const builder = makeBuilder();
      builders.push(builder);
      return builder;
    }),
  },
}));

import {
  acceptSuggestion,
  countOpenSuggestions,
  dismissSuggestion,
  edgesFrom,
  edgesTo,
  link,
  listOpenSuggestions,
  mediaIdsWithSuggestions,
  pendingSuggestionsFor,
  projectCoverage,
  setStatus,
  unlink,
} from "@/lib/graph/edges";
import { ACTIVE_EDGE_STATUSES } from "@/lib/graph/types";

const databaseError = { message: "database unavailable" };

function edge(overrides: Partial<GraphEdge> = {}): GraphEdge {
  return {
    id: "edge-1",
    from_type: "project",
    from_id: "project-1",
    to_type: "media",
    to_id: "media-1",
    relation: "belongs_to",
    status: "manual",
    matched_rules: [],
    created_by: null,
    verified_by: null,
    created_at: "2026-08-06T00:00:00.000Z",
    updated_at: "2026-08-06T00:00:00.000Z",
    ...overrides,
  };
}

function nextBuilder(): MockBuilder {
  const builder = builders.at(-1);
  if (!builder) throw new Error("Expected a Supabase query builder");
  return builder;
}

beforeEach(() => {
  resultQueue.length = 0;
  builders.length = 0;
  tableCalls.length = 0;
  vi.clearAllMocks();
});

describe("link", () => {
  it("upserts and returns an edge while applying all defaults", async () => {
    const saved = edge();
    resultQueue.push({ data: saved, error: null });

    const result = await link({
      from: { type: "project", id: "project-1" },
      to: { type: "media", id: "media-1" },
    });

    const builder = nextBuilder();
    expect(result).toBe(saved);
    expect(tableCalls).toEqual(["hq_graph_edges"]);
    expect(builder.upsert).toHaveBeenCalledWith(
      {
        from_type: "project",
        from_id: "project-1",
        to_type: "media",
        to_id: "media-1",
        relation: "belongs_to",
        status: "manual",
        matched_rules: [],
      },
      { onConflict: "from_type,from_id,to_type,to_id,relation" },
    );
    expect(builder.select).toHaveBeenCalledWith();
    expect(builder.single).toHaveBeenCalledWith();
  });

  it("forwards explicit relation, status, and matched rules", async () => {
    resultQueue.push({ data: edge({ status: "suggested" }), error: null });

    await link({
      from: { type: "project", id: "project-1" },
      to: { type: "document", id: "document-1" },
      relation: "references",
      status: "suggested",
      matchedRules: ["same-client", "same-week"],
    });

    expect(nextBuilder().upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        relation: "references",
        status: "suggested",
        matched_rules: ["same-client", "same-week"],
      }),
      expect.any(Object),
    );
  });

  it("throws the Supabase error", async () => {
    resultQueue.push({ data: null, error: databaseError });

    await expect(
      link({
        from: { type: "project", id: "project-1" },
        to: { type: "media", id: "media-1" },
      }),
    ).rejects.toBe(databaseError);
  });
});

describe("edge mutations", () => {
  it("sets an arbitrary edge status", async () => {
    resultQueue.push({ error: null });

    await setStatus("edge-7", "dismissed");

    const builder = nextBuilder();
    expect(builder.update).toHaveBeenCalledWith({ status: "dismissed" });
    expect(builder.eq).toHaveBeenCalledWith("id", "edge-7");
  });

  it("propagates a setStatus error", async () => {
    resultQueue.push({ error: databaseError });
    await expect(setStatus("edge-7", "verified")).rejects.toBe(databaseError);
  });

  it("deletes an edge by id", async () => {
    resultQueue.push({ error: null });

    await unlink("edge-8");

    const builder = nextBuilder();
    expect(builder.delete).toHaveBeenCalledWith();
    expect(builder.eq).toHaveBeenCalledWith("id", "edge-8");
  });

  it("propagates an unlink error", async () => {
    resultQueue.push({ error: databaseError });
    await expect(unlink("edge-8")).rejects.toBe(databaseError);
  });

  it("accepts a suggestion by promoting it to verified", async () => {
    resultQueue.push({ error: null });

    await acceptSuggestion("edge-9");

    const builder = nextBuilder();
    expect(builder.update).toHaveBeenCalledWith({ status: "verified" });
    expect(builder.eq).toHaveBeenCalledWith("id", "edge-9");
  });

  it("propagates an acceptSuggestion error", async () => {
    resultQueue.push({ error: databaseError });
    await expect(acceptSuggestion("edge-9")).rejects.toBe(databaseError);
  });

  it("dismisses a suggestion", async () => {
    resultQueue.push({ error: null });

    await dismissSuggestion("edge-10");

    const builder = nextBuilder();
    expect(builder.update).toHaveBeenCalledWith({ status: "dismissed" });
    expect(builder.eq).toHaveBeenCalledWith("id", "edge-10");
  });

  it("propagates a dismissSuggestion error", async () => {
    resultQueue.push({ error: databaseError });
    await expect(dismissSuggestion("edge-10")).rejects.toBe(databaseError);
  });
});

describe("edgesFrom", () => {
  it("uses active statuses by default", async () => {
    const rows = [edge()];
    resultQueue.push({ data: rows, error: null });

    await expect(edgesFrom({ type: "project", id: "project-1" })).resolves.toBe(rows);

    const builder = nextBuilder();
    expect(builder.select).toHaveBeenCalledWith("*");
    expect(builder.eq).toHaveBeenNthCalledWith(1, "from_type", "project");
    expect(builder.eq).toHaveBeenNthCalledWith(2, "from_id", "project-1");
    expect(builder.in).toHaveBeenCalledWith("status", [...ACTIVE_EDGE_STATUSES]);
  });

  it("applies explicit status, node-type, and relation filters", async () => {
    resultQueue.push({ data: [], error: null });

    await edgesFrom(
      { type: "project", id: "project-1" },
      { statuses: ["suggested"], toType: "document", relation: "references" },
    );

    const builder = nextBuilder();
    expect(builder.in).toHaveBeenCalledWith("status", ["suggested"]);
    expect(builder.eq).toHaveBeenCalledWith("to_type", "document");
    expect(builder.eq).toHaveBeenCalledWith("relation", "references");
  });

  it("normalizes null data to an empty list", async () => {
    resultQueue.push({ data: null, error: null });
    await expect(edgesFrom({ type: "project", id: "project-1" })).resolves.toEqual([]);
  });

  it("throws query errors", async () => {
    resultQueue.push({ data: null, error: databaseError });
    await expect(edgesFrom({ type: "project", id: "project-1" })).rejects.toBe(
      databaseError,
    );
  });
});

describe("edgesTo", () => {
  it("uses active statuses by default", async () => {
    const rows = [edge()];
    resultQueue.push({ data: rows, error: null });

    await expect(edgesTo({ type: "media", id: "media-1" })).resolves.toBe(rows);

    const builder = nextBuilder();
    expect(builder.eq).toHaveBeenNthCalledWith(1, "to_type", "media");
    expect(builder.eq).toHaveBeenNthCalledWith(2, "to_id", "media-1");
    expect(builder.in).toHaveBeenCalledWith("status", [...ACTIVE_EDGE_STATUSES]);
  });

  it("applies explicit status, source-type, and relation filters", async () => {
    resultQueue.push({ data: [], error: null });

    await edgesTo(
      { type: "document", id: "document-1" },
      { statuses: ["dismissed"], toType: "project", relation: "references" },
    );

    const builder = nextBuilder();
    expect(builder.in).toHaveBeenCalledWith("status", ["dismissed"]);
    expect(builder.eq).toHaveBeenCalledWith("from_type", "project");
    expect(builder.eq).toHaveBeenCalledWith("relation", "references");
  });

  it("normalizes null data to an empty list", async () => {
    resultQueue.push({ data: null, error: null });
    await expect(edgesTo({ type: "media", id: "media-1" })).resolves.toEqual([]);
  });

  it("throws query errors", async () => {
    resultQueue.push({ data: null, error: databaseError });
    await expect(edgesTo({ type: "media", id: "media-1" })).rejects.toBe(databaseError);
  });
});

describe("suggestion reads", () => {
  it("lists suggested edges for a target node", async () => {
    const rows = [edge({ status: "suggested" })];
    resultQueue.push({ data: rows, error: null });

    await expect(
      pendingSuggestionsFor({ type: "media", id: "media-1" }),
    ).resolves.toBe(rows);

    const builder = nextBuilder();
    expect(builder.eq).toHaveBeenCalledWith("to_type", "media");
    expect(builder.eq).toHaveBeenCalledWith("to_id", "media-1");
    expect(builder.eq).toHaveBeenCalledWith("status", "suggested");
  });

  it("normalizes an empty pending-suggestion response", async () => {
    resultQueue.push({ data: null, error: null });
    await expect(
      pendingSuggestionsFor({ type: "media", id: "media-1" }),
    ).resolves.toEqual([]);
  });

  it("propagates pending-suggestion errors", async () => {
    resultQueue.push({ data: null, error: databaseError });
    await expect(
      pendingSuggestionsFor({ type: "media", id: "media-1" }),
    ).rejects.toBe(databaseError);
  });

  it("short-circuits media lookups when there are no ids", async () => {
    await expect(mediaIdsWithSuggestions([])).resolves.toEqual(new Set());
    expect(tableCalls).toEqual([]);
  });

  it("returns a deduplicated set of media ids with suggestions", async () => {
    resultQueue.push({
      data: [{ to_id: "media-1" }, { to_id: "media-2" }, { to_id: "media-1" }],
      error: null,
    });

    await expect(
      mediaIdsWithSuggestions(["media-1", "media-2", "media-3"]),
    ).resolves.toEqual(new Set(["media-1", "media-2"]));

    const builder = nextBuilder();
    expect(builder.select).toHaveBeenCalledWith("to_id");
    expect(builder.eq).toHaveBeenCalledWith("to_type", "media");
    expect(builder.eq).toHaveBeenCalledWith("status", "suggested");
    expect(builder.in).toHaveBeenCalledWith("to_id", ["media-1", "media-2", "media-3"]);
  });

  it("normalizes a null media response to an empty set", async () => {
    resultQueue.push({ data: null, error: null });
    await expect(mediaIdsWithSuggestions(["media-1"])).resolves.toEqual(new Set());
  });

  it("propagates media lookup errors", async () => {
    resultQueue.push({ data: null, error: databaseError });
    await expect(mediaIdsWithSuggestions(["media-1"])).rejects.toBe(databaseError);
  });

  it("returns the exact open-suggestion count", async () => {
    resultQueue.push({ count: 7, error: null });

    await expect(countOpenSuggestions()).resolves.toBe(7);

    const builder = nextBuilder();
    expect(builder.select).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(builder.eq).toHaveBeenCalledWith("status", "suggested");
  });

  it("defaults a missing count to zero", async () => {
    resultQueue.push({ count: null, error: null });
    await expect(countOpenSuggestions()).resolves.toBe(0);
  });

  it("propagates count errors", async () => {
    resultQueue.push({ count: null, error: databaseError });
    await expect(countOpenSuggestions()).rejects.toBe(databaseError);
  });

  it("orders the full queue newest-first and applies the default limit", async () => {
    const rows = [edge({ status: "suggested" })];
    resultQueue.push({ data: rows, error: null });

    await expect(listOpenSuggestions()).resolves.toBe(rows);

    const builder = nextBuilder();
    expect(builder.eq).toHaveBeenCalledWith("status", "suggested");
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(builder.limit).toHaveBeenCalledWith(200);
  });

  it("honors a custom queue limit", async () => {
    resultQueue.push({ data: [], error: null });
    await listOpenSuggestions(12);
    expect(nextBuilder().limit).toHaveBeenCalledWith(12);
  });

  it("normalizes a null queue response", async () => {
    resultQueue.push({ data: null, error: null });
    await expect(listOpenSuggestions()).resolves.toEqual([]);
  });

  it("propagates queue errors", async () => {
    resultQueue.push({ data: null, error: databaseError });
    await expect(listOpenSuggestions()).rejects.toBe(databaseError);
  });
});

describe("projectCoverage", () => {
  it("classifies missing, thin, and healthy coverage buckets", async () => {
    resultQueue.push({
      data: [
        ...Array.from({ length: 5 }, (_, index) =>
          edge({ id: `media-${index}`, to_type: "media", to_id: `media-${index}` }),
        ),
        edge({ id: "document-1", to_type: "document", to_id: "document-1" }),
        edge({ id: "document-2", to_type: "document", to_id: "document-2" }),
        ...Array.from({ length: 3 }, (_, index) =>
          edge({
            id: `field-note-${index}`,
            to_type: "field_note",
            to_id: `field-note-${index}`,
          }),
        ),
        edge({ id: "inquiry-1", to_type: "inquiry", to_id: "inquiry-1" }),
      ],
      error: null,
    });

    await expect(projectCoverage("project-1")).resolves.toEqual([
      { type: "media", count: 5, state: "ok" },
      { type: "document", count: 2, state: "thin" },
      { type: "field_note", count: 3, state: "ok" },
      { type: "inquiry", count: 1, state: "ok" },
      { type: "staff", count: 0, state: "missing" },
    ]);

    expect(nextBuilder().eq).toHaveBeenCalledWith("from_id", "project-1");
  });

  it("propagates the underlying edge-query error", async () => {
    resultQueue.push({ data: null, error: databaseError });
    await expect(projectCoverage("project-1")).rejects.toBe(databaseError);
  });
});
