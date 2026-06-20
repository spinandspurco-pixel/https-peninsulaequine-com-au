// Integration tests for the Preview Mint Gate scan logic.
// Exercises the pure scanRow() function against "safe" and "unsafe" row
// fixtures and asserts the expected finding shape.
//
// Run via the Supabase test_edge_functions tool (Deno test runner).

import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { scanRow, TARGETS } from "./scan.ts";

const inquiries = TARGETS.find((t) => t.table === "inquiries")!;
const bookings = TARGETS.find((t) => t.table === "bookings")!;
const projects = TARGETS.find((t) => t.table === "managed_projects")!;

// ─── SAFE fixtures ─────────────────────────────────────────────

Deno.test("safe · curated demo row produces no findings", () => {
  const row = {
    id: "row-1",
    name: "Eleanor Whitcombe",
    email: "eleanor.w@example.com",
    phone: "0400 000 000",
  };
  assertEquals(scanRow(inquiries, row), []);
});

Deno.test("safe · NULL phone is allowed", () => {
  const row = {
    id: "row-2",
    name: "Hugo Pemberton",
    email: "hugo.p@example.org",
    phone: null,
  };
  assertEquals(scanRow(inquiries, row), []);
});

Deno.test("safe · peninsulaequine.org email passes", () => {
  const row = {
    id: "row-3",
    name: "Margaux Devereux",
    email: "margaux@peninsulaequine.org",
    phone: "0400 000 000",
  };
  assertEquals(scanRow(inquiries, row), []);
});

Deno.test("safe · word-boundary — 'Operations' does not trip 'Operator'", () => {
  // Name field on managed_projects with an operations-flavoured project name.
  const row = { id: "p1", name: "Operations Block 04 — Main Ridge" };
  assertEquals(scanRow(projects, row), []);
});

// ─── UNSAFE fixtures ───────────────────────────────────────────

Deno.test("unsafe · 'Josh Smith' flagged as placeholder", () => {
  const row = {
    id: "bad-1",
    name: "Josh Smith",
    email: "josh@example.com",
    phone: "0400 000 000",
  };
  const findings = scanRow(inquiries, row);
  assertEquals(findings.length, 1);
  assertEquals(findings[0].column, "name");
  assertEquals(findings[0].match, "placeholder:Josh Smith");
  assertEquals(findings[0].rowId, "bad-1");
});

Deno.test("unsafe · 'Operator' as standalone name flagged", () => {
  const row = { id: "bad-2", name: "Operator", email: null, phone: null };
  const findings = scanRow(inquiries, row);
  assertEquals(findings.length, 1);
  assertEquals(findings[0].match, "placeholder:Operator");
});

Deno.test("unsafe · real email domain flagged", () => {
  const row = {
    id: "bad-3",
    name: "Eleanor Whitcombe",
    email: "eleanor@gmail.com",
    phone: "0400 000 000",
  };
  const findings = scanRow(inquiries, row);
  assertEquals(findings.length, 1);
  assertEquals(findings[0].column, "email");
  assertEquals(findings[0].match, "real_email_domain");
});

Deno.test("unsafe · real AU mobile flagged as PII", () => {
  const row = {
    id: "bad-4",
    name: "Hugo Pemberton",
    email: "hugo.p@example.com",
    phone: "0419 224 118",
  };
  const findings = scanRow(inquiries, row);
  assertEquals(findings.length, 1);
  assertEquals(findings[0].column, "phone");
  assertEquals(findings[0].match, "real_phone_pii");
});

Deno.test("unsafe · multiple violations in one row produce multiple findings", () => {
  const row = {
    id: "bad-5",
    client_name: "Test User",
    client_email: "test@gmail.com",
    client_phone: "0419 224 118",
  };
  const findings = scanRow(bookings, row);
  assertEquals(findings.length, 3);
  const matches = findings.map((f) => f.match).sort();
  assertEquals(matches, [
    "placeholder:Test User",
    "real_email_domain",
    "real_phone_pii",
  ]);
});

Deno.test("edge · empty / missing columns are skipped silently", () => {
  const row = { id: "edge-1" };
  assertEquals(scanRow(inquiries, row), []);
});

Deno.test("edge · case-insensitive placeholder match", () => {
  const row = { id: "edge-2", name: "josh smith" };
  const findings = scanRow(inquiries, row);
  assertEquals(findings.length, 1);
  assertExists(findings[0].match.startsWith("placeholder:"));
});

Deno.test("edge · subdomain of an allowed domain is allowed", () => {
  const row = {
    id: "edge-3",
    name: "Eleanor Whitcombe",
    email: "eleanor@notify.peninsulaequine.org",
    phone: null,
  };
  assertEquals(scanRow(inquiries, row), []);
});
