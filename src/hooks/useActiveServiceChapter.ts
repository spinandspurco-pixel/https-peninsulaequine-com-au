import { useSyncExternalStore } from "react";

// Tiny external store: the Services page sets the chapter slug currently in
// view; the Header subscribes and highlights matching dropdown items.

let active: string | null = null;
const listeners = new Set<() => void>();

export function setActiveServiceChapter(slug: string | null) {
  if (active === slug) return;
  active = slug;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = () => active;
const getServerSnapshot = () => null;

export function useActiveServiceChapter(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
