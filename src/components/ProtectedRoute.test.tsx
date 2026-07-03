import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// ---- useAuth mock surface ---------------------------------------------------
type AuthShape = {
  user: { id: string; email: string } | null;
  ready: boolean;
  authLoading: boolean;
  rolesLoading: boolean;
  roles: string[];
  rolesError: string | null;
  refetchRoles: () => void;
  signOut: () => Promise<{ error: null }>;
};

const refetchRoles = vi.fn();
const signOut = vi.fn(async () => ({ error: null }));

let mockAuth: AuthShape;

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockAuth,
}));

function setAuth(partial: Partial<AuthShape>) {
  mockAuth = {
    user: null,
    ready: true,
    authLoading: false,
    rolesLoading: false,
    roles: [],
    rolesError: null,
    refetchRoles,
    signOut,
    ...partial,
  };
}

function renderAt(path: string, allowedRoles?: string[]) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/hq"
          element={
            <ProtectedRoute allowedRoles={allowedRoles as never}>
              <div>HQ DASHBOARD</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/whoami"
          element={
            <ProtectedRoute>
              <div>WHOAMI</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
        <Route path="/employee" element={<div>EMPLOYEE LANDING</div>} />
        <Route path="/portal" element={<div>CLIENT PORTAL</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute — HQ guard", () => {
  beforeEach(() => {
    refetchRoles.mockClear();
    signOut.mockClear();
  });

  it("shows spinner while auth is not ready (never returns null/empty)", () => {
    setAuth({ ready: false, authLoading: true, rolesLoading: true });
    const { container } = renderAt("/hq", ["admin"]);
    // Spinner is the only thing rendered while loading — no nav, no children.
    expect(container.querySelector("svg.animate-spin")).toBeTruthy();
    expect(screen.queryByText("HQ DASHBOARD")).toBeNull();
  });

  it("redirects unauthenticated users to /login (no infinite spinner, no loop)", () => {
    setAuth({ user: null, ready: true });
    renderAt("/hq", ["admin"]);
    expect(screen.getByText("LOGIN PAGE")).toBeInTheDocument();
    expect(screen.queryByText("HQ DASHBOARD")).toBeNull();
  });

  it("renders HQ for an authenticated admin", () => {
    setAuth({
      user: { id: "u1", email: "info@peninsulaequine.systems" },
      roles: ["admin"],
    });
    renderAt("/hq", ["admin"]);
    expect(screen.getByText("HQ DASHBOARD")).toBeInTheDocument();
  });

  it("allows authenticated users through when no role restriction is provided", () => {
    setAuth({
      user: { id: "u1", email: "worker@example.com" },
      roles: [],
    });
    renderAt("/whoami");
    expect(screen.getByText("WHOAMI")).toBeInTheDocument();
  });

  it("shows inline error card with Retry + Sign out when rolesError is set", () => {
    setAuth({
      user: { id: "u1", email: "info@peninsulaequine.systems" },
      rolesError: "Role lookup timed out. Check connection and retry.",
    });
    renderAt("/hq", ["admin"]);
    expect(screen.getByText(/profile didn't load/i)).toBeInTheDocument();
    expect(
      screen.getByText(/role lookup timed out/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    // Never silently renders the protected children.
    expect(screen.queryByText("HQ DASHBOARD")).toBeNull();
  });

  it("Retry click invokes refetchRoles()", () => {
    setAuth({
      user: { id: "u1", email: "info@peninsulaequine.systems" },
      rolesError: "boom",
    });
    renderAt("/hq", ["admin"]);
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(refetchRoles).toHaveBeenCalledTimes(1);
  });

  it("redirects an authenticated wrong-role user to their landing path (no loop)", () => {
    setAuth({
      user: { id: "u2", email: "worker@example.com" },
      roles: ["employee"],
    });
    renderAt("/hq", ["admin"]);
    // employee landing = /employee — not /hq, not /login → no loop.
    expect(screen.getByText("EMPLOYEE LANDING")).toBeInTheDocument();
    expect(screen.queryByText("HQ DASHBOARD")).toBeNull();
    expect(screen.queryByText("LOGIN PAGE")).toBeNull();
  });

  it("redirects a client-role user away from staff HQ to the client portal", () => {
    setAuth({
      user: { id: "u4", email: "client@example.com" },
      roles: ["user"],
    });
    renderAt("/hq", ["admin"]);
    expect(screen.getByText("CLIENT PORTAL")).toBeInTheDocument();
    expect(screen.queryByText("HQ DASHBOARD")).toBeNull();
  });

  it("falls back to /login when the user's landing path equals the failed route (loop guard)", () => {
    // admin role's landing path is /hq, so hitting /hq with only 'admin' but
    // allowed set that excludes admin should not bounce back to /hq.
    setAuth({
      user: { id: "u3", email: "admin@example.com" },
      roles: ["admin"],
    });
    renderAt("/hq", ["trainer"]);
    expect(screen.getByText("LOGIN PAGE")).toBeInTheDocument();
  });
});
