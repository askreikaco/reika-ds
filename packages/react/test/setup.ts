import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Vitest runs without globals, so Testing Library's automatic cleanup is not registered: do it here.
afterEach(() => {
  cleanup();
});
