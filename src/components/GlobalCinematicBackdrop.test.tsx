import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GlobalCinematicBackdrop } from "@/components/GlobalCinematicBackdrop";

describe("GlobalCinematicBackdrop", () => {
  it("renders the shared blueprint backdrop on private staff routes too", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/employee"]}>
        <GlobalCinematicBackdrop />
      </MemoryRouter>,
    );

    expect(container.querySelector(".engineering-grid")).toBeTruthy();
    expect(container.querySelector(".grain-texture")).toBeTruthy();
  });
});
