/**
 * Maps the website's localized franchise-form answers to the dashboard's
 * lead enums (corporate-dashboard-svelte → /api/franchise/submit).
 *
 * Dashboard investment buckets are Guaraní-based despite their "k" names:
 *   '50k-100k' = ₲50M–100M · '100k-250k' = ₲100M–250M · '250k-500k' = ₲250M–500M · '500k+' = more than ₲500M
 * The website offers: <₲100M · ₲100M–300M · ₲300M–500M · ₲500M–1.000M · >₲1.000M (ES/EN).
 */
export type DashboardInvestmentRange = '50k-100k' | '100k-250k' | '250k-500k' | '500k+';
export type DashboardTimeframe = 'immediately' | '3-6_months' | '6-12_months' | 'next_year';

/** Reads the first amount in a label as millions of Guaraníes ("₲1.000M" → 1000, "₲1B" → 1000, "₲300M" → 300). */
function firstAmountInMillions(label: string): number | undefined {
  const m = label.match(/(\d[\d.,]*)\s*(M|B|MM)?/i);
  if (!m) return undefined;
  const value = Number(m[1].replace(/[.,]/g, ''));
  if (!Number.isFinite(value)) return undefined;
  return m[2]?.toUpperCase() === 'B' ? value * 1000 : value;
}

export function mapInvestmentRange(value: string | undefined | null): DashboardInvestmentRange | undefined {
  if (!value) return undefined;
  const label = value.trim();
  const lower = label.toLowerCase();
  const amount = firstAmountInMillions(label);
  if (amount === undefined) return undefined;

  // "Menos de ₲100M" / "Less than ₲100M": the amount is an upper bound.
  const isUpperBound = /^(menos|less|under|hasta)/.test(lower);
  const lowerBound = isUpperBound ? 0 : amount;

  if (lowerBound < 100) return '50k-100k';
  if (lowerBound < 300) return '100k-250k';
  if (lowerBound < 500) return '250k-500k';
  return '500k+';
}

export function mapTimeline(value: string | undefined | null): DashboardTimeframe | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes('inmediat') || lower.includes('immediate')) return 'immediately';
  if (/\b3\s*-\s*6\b/.test(lower)) return '3-6_months';
  if (/\b6\s*-\s*12\b/.test(lower)) return '6-12_months';
  if (lower.includes('año') || lower.includes('year') || lower.includes('próx')) return 'next_year';
  return undefined;
}

/** "5", "5 años", "10+" → 5, 5, 10. Free text with no number → undefined. */
export function parseYears(value: string | undefined | null): number | undefined {
  if (!value) return undefined;
  const m = value.match(/\d+/);
  return m ? Number(m[0]) : undefined;
}
