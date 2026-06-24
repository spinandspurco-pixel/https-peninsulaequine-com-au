import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";

type MockAuth = {
  user: { id: string; email?: string } | null;
  roles: string[];
  ready: boolean;
  rolesLoading: boolean;
  signIn: (e: string, p: string) => Promise<{ error: null | Error }>;
  signOut: ReturnType<typeof vi.fn>;
};

let mockAuth: MockAuth;

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockAuth,
}));

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock("@/components/StaffPortalFrame", () => ({
  StaffPortalFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/integrations/lovable/index", () => ({
  lovable: { auth: { signInWithOAuth: vi.fn() } },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/hq" element={<div data-testid="hq-page">HQ Page</div>} />
        <Route path="/employee" element={<div>Employee Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Login route guard", () => {
  beforeEach(() => {
    mockAuth = {
      user: null,
      roles: [],
      ready: true,
      rolesLoading: false,
      signIn: async () => ({ error: null }),
      signOut: vi.fn(async () => ({ error: null })),
    };
  });

  it("renders the form for unauthenticated visitors", () => {
    renderAt("/login");
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.queryByTestId("hq-page")).not.toBeInTheDocument();
  });

  it("redirects an authenticated admin to /hq and never renders the form", () => {
    mockAuth = { ...mockAuth, user: { id: "u1" }, roles: ["admin"] };
    renderAt("/login");
    expect(screen.getByTestId("hq-page")).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("honours ?redirect= when authenticated admin lands on /login", () => {
    mockAuth = { ...mockAuth, user: { id: "u1" }, roles: ["admin"] };
    renderAt("/login?redirect=%2Fhq%2Fcms");
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("shows the Authenticating spinner while auth is still resolving", () => {
    mockAuth = { ...mockAuth, ready: false };
    renderAt("/login");
    expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("waits on the role lookup instead of rendering a blank Navigate loop", () => {
    mockAuth = { ...mockAuth, user: { id: "u1" }, roles: [], rolesLoading: true };
    renderAt("/login");
    expect(screen.getByText(/resolving access/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("renders the No staff access panel for signed-in users with no role", () => {
    mockAuth = {
      ...mockAuth,
      user: { id: "u1", email: "stale@peninsulaequine.org" },
      roles: [],
      rolesLoading: false,
    };
    renderAt("/login");
    // Panel content
    expect(screen.getByRole("heading", { name: /no staff access/i })).toBeInTheDocument();
    expect(screen.getByText(/stale@peninsulaequine\.org/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    // Login form must NOT be rendered (page must never go blank either —
    // the heading above proves something rendered).
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^sign in$/i })).not.toBeInTheDocument();
  });

  it("Sign out button on the no-access panel invokes useAuth().signOut()", async () => {
    const user = userEvent.setup();
    mockAuth = {
      ...mockAuth,
      user: { id: "u1", email: "stale@peninsulaequine.org" },
      roles: [],
      rolesLoading: false,
    };
    renderAt("/login");
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
  });
});

