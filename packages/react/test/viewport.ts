import { afterEach, vi } from 'vitest';

// Fakes window.matchMedia for one viewport: phone (below md) or desktop (md and up).
// PHONE_QUERY is the only query the components use, so the answer is keyed on it.
export function setViewport(kind: 'phone' | 'desktop'): void {
  const phone = kind === 'phone';
  window.matchMedia = vi.fn((query: string) => ({
    matches: query === '(max-width: 41.98rem)' ? phone : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  // Remove the fake so the next test file or case starts without matchMedia.
  delete (window as Partial<Window>).matchMedia;
});
