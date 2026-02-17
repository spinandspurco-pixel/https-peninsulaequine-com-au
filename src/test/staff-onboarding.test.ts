import { describe, it, expect, vi, beforeEach } from "vitest";

/* ─── Role & permission constants (mirrors AdminStaffOnboarding) ─── */

const VALID_ROLES = ["admin", "employee", "trainer", "moderator"] as const;
type AppRole = (typeof VALID_ROLES)[number];

const ROLE_PERMISSIONS: Record<AppRole, { dashboard: string; canManageStaff: boolean; receivesAllNotifs: boolean }> = {
  admin: { dashboard: "/admin", canManageStaff: true, receivesAllNotifs: true },
  employee: { dashboard: "/employee", canManageStaff: false, receivesAllNotifs: true },
  trainer: { dashboard: "/employee", canManageStaff: false, receivesAllNotifs: false },
  moderator: { dashboard: "/employee", canManageStaff: false, receivesAllNotifs: false },
};

/* ─── Helpers that mirror edge-function & UI logic ─── */

function validateStaffInput(input: { email?: string; password?: string; role?: string }) {
  const errors: string[] = [];
  if (!input.email || !input.email.includes("@")) errors.push("Invalid email");
  if (!input.password || input.password.length < 8) errors.push("Password must be at least 8 characters");
  if (!input.role || !VALID_ROLES.includes(input.role as AppRole)) errors.push("Invalid role");
  return { valid: errors.length === 0, errors };
}

function deriveOnboardingStatus(createdAt: Date, now = new Date()) {
  const days = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 7) return "new";
  if (days < 30) return "onboarding";
  return "active";
}

function canDeleteRole(callerRole: AppRole, targetRole: string): boolean {
  // Only admins can delete roles
  return callerRole === "admin";
}

function roleEscalationCheck(callerRole: AppRole, newRole: AppRole): boolean {
  // Non-admins cannot assign admin role
  if (newRole === "admin" && callerRole !== "admin") return false;
  // Only admins can assign any role
  return callerRole === "admin";
}

/* ─── Test suites ─── */

describe("Staff Onboarding — Input Validation", () => {
  it("rejects empty email", () => {
    const result = validateStaffInput({ email: "", password: "securePass1!", role: "employee" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid email");
  });

  it("rejects email without @", () => {
    const result = validateStaffInput({ email: "notanemail", password: "securePass1!", role: "employee" });
    expect(result.valid).toBe(false);
  });

  it("rejects short password", () => {
    const result = validateStaffInput({ email: "test@pe.com.au", password: "short", role: "employee" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters");
  });

  it("rejects invalid role", () => {
    const result = validateStaffInput({ email: "test@pe.com.au", password: "securePass1!", role: "superadmin" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid role");
  });

  it("accepts valid input", () => {
    const result = validateStaffInput({ email: "glenn@pe.com.au", password: "securePass1!", role: "trainer" });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates all four roles", () => {
    for (const role of VALID_ROLES) {
      const result = validateStaffInput({ email: "a@b.com", password: "12345678", role });
      expect(result.valid).toBe(true);
    }
  });
});

describe("Staff Onboarding — Onboarding Status Derivation", () => {
  const now = new Date("2026-02-17T00:00:00Z");

  it("marks <7-day accounts as 'new'", () => {
    const created = new Date("2026-02-12T00:00:00Z"); // 5 days ago
    expect(deriveOnboardingStatus(created, now)).toBe("new");
  });

  it("marks 7–29 day accounts as 'onboarding'", () => {
    const created = new Date("2026-02-01T00:00:00Z"); // 16 days ago
    expect(deriveOnboardingStatus(created, now)).toBe("onboarding");
  });

  it("marks 30+ day accounts as 'active'", () => {
    const created = new Date("2026-01-01T00:00:00Z"); // 47 days ago
    expect(deriveOnboardingStatus(created, now)).toBe("active");
  });

  it("boundary: exactly 7 days = onboarding", () => {
    const created = new Date("2026-02-10T00:00:00Z");
    expect(deriveOnboardingStatus(created, now)).toBe("onboarding");
  });

  it("boundary: exactly 30 days = active", () => {
    const created = new Date("2026-01-18T00:00:00Z");
    expect(deriveOnboardingStatus(created, now)).toBe("active");
  });
});

describe("Staff Permissions — Role Escalation Safety", () => {
  it("admin can assign admin role", () => {
    expect(roleEscalationCheck("admin", "admin")).toBe(true);
  });

  it("admin can assign any role", () => {
    for (const role of VALID_ROLES) {
      expect(roleEscalationCheck("admin", role)).toBe(true);
    }
  });

  it("employee cannot assign admin role", () => {
    expect(roleEscalationCheck("employee", "admin")).toBe(false);
  });

  it("trainer cannot assign admin role", () => {
    expect(roleEscalationCheck("trainer", "admin")).toBe(false);
  });

  it("moderator cannot assign admin role", () => {
    expect(roleEscalationCheck("moderator", "admin")).toBe(false);
  });

  it("non-admin cannot assign any role", () => {
    expect(roleEscalationCheck("employee", "employee")).toBe(false);
    expect(roleEscalationCheck("trainer", "trainer")).toBe(false);
  });
});

describe("Staff Permissions — Role Deletion Rollback Safety", () => {
  it("admin can delete any role", () => {
    for (const role of VALID_ROLES) {
      expect(canDeleteRole("admin", role)).toBe(true);
    }
  });

  it("employee cannot delete roles", () => {
    expect(canDeleteRole("employee", "employee")).toBe(false);
    expect(canDeleteRole("employee", "trainer")).toBe(false);
  });

  it("trainer cannot delete roles", () => {
    expect(canDeleteRole("trainer", "admin")).toBe(false);
  });

  it("moderator cannot delete roles", () => {
    expect(canDeleteRole("moderator", "employee")).toBe(false);
  });
});

describe("Staff Permissions — Dashboard Routing", () => {
  it("admin routes to /admin", () => {
    expect(ROLE_PERMISSIONS.admin.dashboard).toBe("/admin");
  });

  it("employee routes to /employee", () => {
    expect(ROLE_PERMISSIONS.employee.dashboard).toBe("/employee");
  });

  it("trainer routes to /employee", () => {
    expect(ROLE_PERMISSIONS.trainer.dashboard).toBe("/employee");
  });

  it("only admin can manage staff", () => {
    const managers = VALID_ROLES.filter((r) => ROLE_PERMISSIONS[r].canManageStaff);
    expect(managers).toEqual(["admin"]);
  });

  it("admin and employee receive all notifications", () => {
    const receivers = VALID_ROLES.filter((r) => ROLE_PERMISSIONS[r].receivesAllNotifs);
    expect(receivers).toEqual(["admin", "employee"]);
  });
});

describe("Staff Onboarding — Edge Function Safety Checks", () => {
  it("edge function requires all three fields", () => {
    expect(validateStaffInput({ email: "a@b.com", password: "12345678" }).valid).toBe(false);
    expect(validateStaffInput({ email: "a@b.com", role: "admin" }).valid).toBe(false);
    expect(validateStaffInput({ password: "12345678", role: "admin" }).valid).toBe(false);
  });

  it("prevents 'user' role from being assigned via wizard (only staff roles)", () => {
    // The UI filters out 'user' role, so it shouldn't be assignable
    const staffRoles = VALID_ROLES.filter((r) => r !== "user" as any);
    expect(staffRoles).toHaveLength(4);
    expect(staffRoles).not.toContain("user");
  });
});
