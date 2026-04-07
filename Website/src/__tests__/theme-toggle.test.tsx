import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme-transitioning');
  });

  it('renders a button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('defaults to dark theme', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button').querySelector('svg')).toHaveAttribute('data-icon', 'Sun');
  });

  it('toggles to light on click', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('omniprise_theme')).toBe('light');
  });

  it('toggles back to dark on second click', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('omniprise_theme')).toBe('dark');
  });

  it('shows correct aria-label for dark state', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Cambiar a modo claro');
  });

  it('respects stored light theme', () => {
    localStorage.setItem('omniprise_theme', 'light');
    render(<ThemeToggle />);
    // After useEffect runs, theme should be light → aria-label should say "Cambiar a modo oscuro"
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Cambiar a modo oscuro');
  });
});
