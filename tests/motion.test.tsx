import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { getMotionVariants } from "@/lib/motion";

afterEach(() => vi.unstubAllGlobals());

describe("motion preference", () => {
  it("removes translation, scaling, fades and child delays in reduced mode", () => {
    const reduced = getMotionVariants(true);
    expect(reduced.fadeUp.hidden).toEqual({ opacity: 1, y: 0 });
    expect(reduced.subtleScale.hidden).toEqual({ opacity: 1, scale: 1 });
    expect(reduced.fadeIn.hidden).toEqual({ opacity: 1 });
    expect(reduced.staggerContainer.visible).toEqual({ transition: { staggerChildren: 0 } });
    for (const variant of [reduced.fadeUp, reduced.fadeIn, reduced.subtleScale, reduced.staggerItem]) {
      expect(variant.visible).toMatchObject({ transition: { duration: 0 } });
    }
    expect(getMotionVariants(false).fadeUp.hidden).toMatchObject({ y: 20 });
  });

  it("responds to live OS preference changes and unsubscribes on unmount", () => {
    let matches = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      get matches() { return matches; },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    })));
    const { result, unmount } = renderHook(useReducedMotion);
    expect(result.current).toBe(false);
    act(() => {
      matches = true;
      listeners.forEach((listener) => listener());
    });
    expect(result.current).toBe(true);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
