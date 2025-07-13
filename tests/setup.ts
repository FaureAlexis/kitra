import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Mock window.crypto for tests
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid'),
    getRandomValues: vi.fn((arr: any) => arr),
  },
});

// Mock fetch
global.fetch = vi.fn();

// Mock Web3 providers
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: null, isConnected: false })),
  useConnect: vi.fn(() => ({ connect: vi.fn(), connectors: [] })),
  useSignMessage: vi.fn(() => ({ signMessage: vi.fn() })),
}));

vi.mock('siwe', () => ({
  SiweMessage: vi.fn(() => ({
    prepareMessage: vi.fn(() => 'mock-message'),
    verify: vi.fn(() => ({ success: true, data: {} })),
  })),
  generateNonce: vi.fn(() => 'mock-nonce'),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock Three.js
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
  Center: ({ children }: { children: React.ReactNode }) => <div data-testid="center">{children}</div>,
}));



// runs a cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
}); 