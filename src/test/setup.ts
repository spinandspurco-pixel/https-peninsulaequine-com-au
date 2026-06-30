import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver for components that use it (e.g. BlueprintBackground)
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});
Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver for container-query and layout tests
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});
Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

// Regression guard: ensure the globals our tests rely on are wired up on both
// `window` and `globalThis`. If a future change drops one of these shims, fail
// loudly at setup time rather than mid-test with a confusing stack trace.
const expectedGlobals = [
  "matchMedia",
  "IntersectionObserver",
  "ResizeObserver",
] as const;

for (const key of expectedGlobals) {
  if (typeof (globalThis as Record<string, unknown>)[key] === "undefined") {
    throw new Error(`[test/setup] expected globalThis.${key} to be defined`);
  }
  if (typeof (window as unknown as Record<string, unknown>)[key] === "undefined") {
    throw new Error(`[test/setup] expected window.${key} to be defined`);
  }
}
