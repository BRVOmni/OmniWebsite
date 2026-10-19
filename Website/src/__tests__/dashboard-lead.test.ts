import { describe, it, expect } from 'vitest';
import { mapInvestmentRange, mapTimeline, parseYears } from '@/lib/dashboard-lead';
import es from '../messages/es.json';
import en from '../messages/en.json';

const investmentLabels = (m: typeof es) => [1, 2, 3, 4, 5].map((n) => m.franchiseApply[`investment${n}` as keyof typeof m.franchiseApply]);
const timelineLabels = (m: typeof es) => [1, 2, 3, 4].map((n) => m.franchiseApply[`timeline${n}` as keyof typeof m.franchiseApply]);

describe('mapInvestmentRange', () => {
  const expected = ['50k-100k', '100k-250k', '250k-500k', '500k+', '500k+'];

  it('maps every Spanish form option to the dashboard bucket', () => {
    expect(investmentLabels(es).map(mapInvestmentRange)).toEqual(expected);
  });

  it('maps every English form option to the dashboard bucket', () => {
    expect(investmentLabels(en).map(mapInvestmentRange)).toEqual(expected);
  });

  it('returns undefined for empty or non-numeric input', () => {
    expect(mapInvestmentRange('')).toBeUndefined();
    expect(mapInvestmentRange(undefined)).toBeUndefined();
    expect(mapInvestmentRange('No sé')).toBeUndefined();
  });
});

describe('mapTimeline', () => {
  it('maps the Spanish options', () => {
    expect(timelineLabels(es).map(mapTimeline)).toEqual(['immediately', '3-6_months', '6-12_months', undefined]);
  });

  it('maps the English options', () => {
    expect(timelineLabels(en).map(mapTimeline)).toEqual(['immediately', '3-6_months', '6-12_months', undefined]);
  });
});

describe('parseYears', () => {
  it('extracts the first number from free text', () => {
    expect(parseYears('5')).toBe(5);
    expect(parseYears('5 años')).toBe(5);
    expect(parseYears('más de 10')).toBe(10);
  });

  it('returns undefined when there is no number', () => {
    expect(parseYears('')).toBeUndefined();
    expect(parseYears('ninguno')).toBeUndefined();
  });
});
