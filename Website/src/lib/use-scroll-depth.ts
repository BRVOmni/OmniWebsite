'use client';

import { useEffect, useRef } from 'react';
import { track } from '@vercel/analytics';

const THRESHOLDS = [25, 50, 75, 90] as const;

export function useScrollDepth(page: string) {
  const fired = useRef(new Set<number>());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((scrollTop / docHeight) * 100);

      for (const t of THRESHOLDS) {
        if (percent >= t && !fired.current.has(t)) {
          fired.current.add(t);
          track('scroll_depth', { page, percent: t });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page]);
}
