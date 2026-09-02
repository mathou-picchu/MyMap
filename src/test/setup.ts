import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => `blob:mock-${Math.random().toString(36).slice(2)}`;
  URL.revokeObjectURL = () => {};
}

if (typeof crypto.randomUUID !== 'function') {
  crypto.randomUUID = (() =>
    `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`) as typeof crypto.randomUUID;
}
