import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BackToTop } from '@/components/BackToTop';

describe('BackToTop', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('is not visible initially', () => {
    render(<BackToTop />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('appears after scrolling past 600px', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

    render(<BackToTop />);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 700, writable: true });
      fireEvent.scroll(window);
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has accessible aria-label', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

    render(<BackToTop />);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 700, writable: true });
      fireEvent.scroll(window);
    });

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'ariaLabel');
  });

  it('calls scrollTo on click', () => {
    const scrollToSpy = vi.fn();
    Object.defineProperty(window, 'scrollTo', { value: scrollToSpy });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

    render(<BackToTop />);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 700, writable: true });
      fireEvent.scroll(window);
    });

    fireEvent.click(screen.getByRole('button'));
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
