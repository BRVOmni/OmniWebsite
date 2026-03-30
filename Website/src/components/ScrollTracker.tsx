'use client';

import { useScrollDepth } from '@/lib/use-scroll-depth';

export function ScrollTracker({ page }: { page: string }) {
  useScrollDepth(page);
  return null;
}
