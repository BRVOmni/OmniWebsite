import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';
import {
  BRANDS,
  getBrandBySlug,
  whatsappOrderUrl,
  getAllBrandSlugs,
} from '@/lib/brands';

// --- cn() utility ---

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active');
  });

  it('deduplicates with tailwind-merge', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });
});

// --- getBrandBySlug() ---

describe('getBrandBySlug()', () => {
  it('returns UFO for "ufo"', () => {
    expect(getBrandBySlug('ufo')?.name).toBe('UFO');
  });

  it('returns brand for each known slug', () => {
    const slugs = ['ufo', 'los-condenados', 'rocco', 'sammys', 'pastabox', 'mr-chow', 'barrio-pizzero'];
    for (const slug of slugs) {
      expect(getBrandBySlug(slug)).toBeDefined();
    }
  });

  it('returns undefined for unknown slug', () => {
    expect(getBrandBySlug('nonexistent')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getBrandBySlug('')).toBeUndefined();
  });
});

// --- whatsappOrderUrl() ---

describe('whatsappOrderUrl()', () => {
  it('returns wa.me URL with default message', () => {
    const url = whatsappOrderUrl();
    expect(url).toContain('wa.me/595992035000');
    expect(decodeURIComponent(url)).toContain('Hola! Me interesa hacer un pedido');
  });

  it('includes brand name when provided', () => {
    const url = whatsappOrderUrl('UFO');
    expect(decodeURIComponent(url)).toContain('Hola! Me interesa ordenar de UFO');
  });

  it('encodes special characters in brand name', () => {
    const url = whatsappOrderUrl("Sammy's");
    expect(decodeURIComponent(url)).toContain("Sammy's");
  });
});

// --- getAllBrandSlugs() ---

describe('getAllBrandSlugs()', () => {
  it('returns 7 slugs', () => {
    expect(getAllBrandSlugs()).toHaveLength(7);
  });

  it('includes all expected slugs', () => {
    const slugs = getAllBrandSlugs();
    expect(slugs).toContain('ufo');
    expect(slugs).toContain('los-condenados');
    expect(slugs).toContain('rocco');
    expect(slugs).toContain('sammys');
    expect(slugs).toContain('pastabox');
    expect(slugs).toContain('mr-chow');
    expect(slugs).toContain('barrio-pizzero');
  });
});

// --- BRANDS data integrity ---

describe('BRANDS data', () => {
  it('has 7 brands', () => {
    expect(BRANDS).toHaveLength(7);
  });

  it('each brand has required fields', () => {
    for (const brand of BRANDS) {
      expect(brand.slug).toBeTruthy();
      expect(brand.name).toBeTruthy();
      expect(brand.logo).toMatch(/^\/brands\/.*\.webp$/);
      expect(brand.tagline).toBeTruthy();
      expect(brand.description).toBeTruthy();
      expect(brand.story).toBeTruthy();
      expect(brand.stats.length).toBeGreaterThan(0);
      expect(brand.milestones.length).toBeGreaterThan(0);
      expect(brand.locations).toBeTruthy();
      expect(brand.deliveryPlatforms.length).toBeGreaterThan(0);
      expect(brand.model).toBeTruthy();
      expect(brand.instagram).toBeTruthy();
    }
  });

  it('each brand has unique slug', () => {
    const slugs = BRANDS.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('each brand has unique name', () => {
    const names = BRANDS.map((b) => b.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
