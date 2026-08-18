'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from '@/i18n/routing';

/**
 * Tracks the current route and, on the page, which of the given section ids is in view.
 * Returns `isActive(href)`:
 *  - "/#section" links are active on "/" when that section is the one in view (or in the URL hash);
 *  - page links ("/franchise", "/proveedores") are active by pathname (prefix match).
 */
export function useActiveLink(sectionIds: readonly string[]) {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState('');
  const idsKey = sectionIds.join('|');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ids = idsKey.split('|').filter(Boolean);
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);

    const fromHash = () => {
      const h = window.location.hash.replace('#', '');
      if (h && ids.includes(h)) setActiveId(h);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);

    if (els.length === 0 || !('IntersectionObserver' in window)) {
      return () => window.removeEventListener('hashchange', fromHash);
    }

    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        if (visible.size > 0) {
          const [best] = [...visible.entries()].sort((a, b) => b[1] - a[1])[0];
          setActiveId(best);
        } else {
          setActiveId('');
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.1, 0.25, 0.5] },
    );
    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      window.removeEventListener('hashchange', fromHash);
    };
  }, [pathname, idsKey]);

  return useCallback(
    (href: string): boolean => {
      if (href.startsWith('/#')) return pathname === '/' && activeId === href.slice(2);
      if (href === '/') return pathname === '/';
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname, activeId],
  );
}
