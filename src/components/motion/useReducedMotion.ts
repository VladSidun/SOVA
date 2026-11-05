"use client";

import { useSyncExternalStore } from "react";

export const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

// Prefer no motion during SSR/hydration, then follow live OS preference changes.
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
