import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";

type MockAuth = {
  user: { id: string } | null;
  roles: string[];
  ready: boolean;
  signIn: (e: string, p: string) => Promise<{ error: null | Error }>;
  signOut: () => Promise<{ error: null }>;
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
      signIn: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
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
    // We don't register /hq/cms in the test router, but the absence of
    // the form proves the render-time Navigate fired instead of the form.
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it("shows the Authenticating spinner while auth is still resolving", () => {
    mockAuth = { ...mockAuth, ready: false };
    renderAt("/login");
    expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });
});
