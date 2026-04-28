import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';

afterEach(() => {
  cleanup();
});

// Polyfill window.matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock next-intl — t() returns the key so tests assert on translation keys
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

// Mock next-intl Link/routing — renders plain <a>
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) =>
    createElement('a', { href, ...props }, children),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

// Mock framer-motion — render children without animation
// Instead of a Proxy, create a forwardRef component that renders the HTML element
function createMotionMock(tag: string) {
  return ({ children, ref, ...props }: Record<string, unknown> & { ref?: unknown }) => {
    const {
      initial, animate, exit, transition, whileHover, whileTap,
      variants, layout, layoutId, onAnimationComplete, ...rest
    } = props;
    void initial; void animate; void exit; void transition;
    void whileHover; void whileTap; void variants; void layout;
    void layoutId; void onAnimationComplete; void ref;
    return createElement(tag, rest, children as ReactNode);
  };
}

vi.mock('framer-motion', () => ({
  motion: {
    div: createMotionMock('div'),
    button: createMotionMock('button'),
    p: createMotionMock('p'),
    h2: createMotionMock('h2'),
    ul: createMotionMock('ul'),
    section: createMotionMock('section'),
    span: createMotionMock('span'),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
}));

// Mock lucide-react icons — return simple svg elements
function createIconMock(name: string) {
  return (props: Record<string, unknown>) =>
    createElement('svg', { ...props, 'data-icon': name });
}

vi.mock('lucide-react', () => ({
  Sun: createIconMock('Sun'),
  Moon: createIconMock('Moon'),
  X: createIconMock('X'),
  Menu: createIconMock('Menu'),
  ArrowUp: createIconMock('ArrowUp'),
  ExternalLink: createIconMock('ExternalLink'),
  MessageCircle: createIconMock('MessageCircle'),
  Instagram: createIconMock('Instagram'),
}));

// Mock next/image — render plain <img>
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, sizes, priority, onLoad, onError, ...rest } = props;
    void fill; void sizes; void priority;
    return createElement('img', {
      ...rest,
      onLoad: onLoad as (() => void) | undefined,
      onError: onError as (() => void) | undefined,
    });
  },
}));
