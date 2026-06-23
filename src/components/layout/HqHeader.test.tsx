import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HqHeader } from "./HqHeader";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockAuth(),
}));

vi.mock("@/components/layout/MentionsBadge", () => ({
  MentionsBadge: () => null,
}));

let mockAuth: () => { user: unknown; signOut: () => Promise<void> };

describe("HqHeader (unauthenticated)", () => {
  it("renders nothing when there is no user", () => {
    mockAuth = () => ({ user: null, signOut: async () => {} });
    const { container, queryByText, queryByRole } = render(
      <MemoryRouter>
        <HqHeader />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
    expect(queryByText(/HQ · Command Centre/i)).toBeNull();
    expect(queryByRole("button", { name: /sign out/i })).toBeNull();
  });

  it("renders the header and Sign out button when a user is present", () => {
    mockAuth = () => ({ user: { id: "u1" }, signOut: async () => {} });
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <HqHeader />
      </MemoryRouter>,
    );
    expect(getByText(/HQ · Command Centre/i)).toBeInTheDocument();
    expect(getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
