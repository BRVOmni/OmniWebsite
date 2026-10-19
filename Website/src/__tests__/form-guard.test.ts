import { describe, it, expect } from 'vitest';
import { HONEYPOT_FIELD, isHoneypotTripped } from '@/lib/form-guard';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { franchiseSchema } from '@/lib/franchise-schema';

describe('isHoneypotTripped', () => {
  it('is false when the field is absent or empty', () => {
    expect(isHoneypotTripped({})).toBe(false);
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: '' })).toBe(false);
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: '   ' })).toBe(false);
  });

  it('is true when a bot filled it', () => {
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: 'http://spam.example' })).toBe(true);
  });
});

describe('rateLimit', () => {
  it('allows up to the limit inside the window, then blocks with a retry hint', () => {
    const key = `test:${Math.random()}`;
    const t0 = 1_000_000;
    expect(rateLimit(key, 3, 60_000, t0).allowed).toBe(true);
    expect(rateLimit(key, 3, 60_000, t0 + 1_000).allowed).toBe(true);
    expect(rateLimit(key, 3, 60_000, t0 + 2_000).allowed).toBe(true);
    const blocked = rateLimit(key, 3, 60_000, t0 + 3_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(57);
  });

  it('allows again once the oldest hit leaves the window', () => {
    const key = `test:${Math.random()}`;
    const t0 = 2_000_000;
    rateLimit(key, 1, 10_000, t0);
    expect(rateLimit(key, 1, 10_000, t0 + 5_000).allowed).toBe(false);
    expect(rateLimit(key, 1, 10_000, t0 + 10_001).allowed).toBe(true);
  });

  it('keys are independent', () => {
    const a = `a:${Math.random()}`;
    const b = `b:${Math.random()}`;
    rateLimit(a, 1, 60_000, 0);
    expect(rateLimit(a, 1, 60_000, 1).allowed).toBe(false);
    expect(rateLimit(b, 1, 60_000, 1).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('takes the first x-forwarded-for entry', () => {
    const req = new Request('http://x', { headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } });
    expect(getClientIp(req)).toBe('203.0.113.9');
  });

  it('falls back to x-real-ip, then "unknown"', () => {
    expect(getClientIp(new Request('http://x', { headers: { 'x-real-ip': '198.51.100.4' } }))).toBe('198.51.100.4');
    expect(getClientIp(new Request('http://x'))).toBe('unknown');
  });
});

describe('franchiseSchema (server-side validation of the whole application)', () => {
  const valid = {
    firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com', phone: '+595991234567', city: 'Asunción', country: 'Paraguay',
    preferredBrand: 'Rocco', hasExperience: 'Sí', currentBusiness: '', yearsExperience: '',
    investmentRange: '₲100M - ₲300M', hasLocation: 'No, necesito ayuda', locationCity: '', timeline: 'Inmediato (0-3 meses)',
    motivation: 'Quiero invertir', howHeard: 'Instagram', additionalInfo: '',
  };

  it('accepts a complete application and strips unknown keys', () => {
    const result = franchiseSchema.safeParse({ ...valid, [HONEYPOT_FIELD]: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(HONEYPOT_FIELD in result.data).toBe(false);
  });

  it('rejects a missing required field from any step', () => {
    expect(franchiseSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false);
    expect(franchiseSchema.safeParse({ ...valid, investmentRange: '' }).success).toBe(false);
    expect(franchiseSchema.safeParse({ ...valid, motivation: '' }).success).toBe(false);
  });
});
