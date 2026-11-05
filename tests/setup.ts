import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Browser capabilities used by progressive motion enhancement. Offscreen by default.
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => true,
});

globalThis.IntersectionObserver = class {
  root = null;
  rootMargin = "0px";
  thresholds = [0];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};

afterEach(cleanup);
