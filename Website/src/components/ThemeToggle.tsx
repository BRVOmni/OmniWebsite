'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'dark' | 'light';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem('omniprise_theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage unavailable
  }
  return null;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(getStoredTheme() ?? getSystemTheme());
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';

      // Enable transition class for smooth switch
      document.documentElement.setAttribute('data-theme-transitioning', '');
      document.documentElement.setAttribute('data-theme', next);

      try {
        localStorage.setItem('omniprise_theme', next);
      } catch {
        // ignore
      }

      // Remove transition class after animation completes
      setTimeout(() => {
        document.documentElement.removeAttribute('data-theme-transitioning');
      }, 350);

      return next;
    });
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-700 transition-colors duration-200 cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
