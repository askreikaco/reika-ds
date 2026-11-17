import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Vitest runs without globals, so Testing Library's automatic cleanup is not registered: do it here.
afterEach(() => {
  cleanup();
});

// jsdom has no layout or ResizeObserver; Carbon menus call both. Stubs only, no behaviour.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
if (!('ResizeObserver' in globalThis)) {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
