/**
 * Company-wide facts used across the site (trust bar, hero chips, franchise page,
 * press page, /agent, llms.txt, manifest, JSON-LD and metadata). Single source of truth:
 * change a figure here and every page follows.
 *
 * Content rule (Bruno, Aug 2026): brands and team are always shown as open-ended
 * labels ("7+", "135+"), never as a fixed count.
 */
export const COMPANY = {
  name: 'Omniprise',
  siteUrl: 'https://www.omniprise.com.py',
  /** Portfolio size; shown as `brandsLabel` on the site. */
  brandsCount: 7,
  brandsLabel: '7+',
  /** Physical locations (restaurants) operated by the group. */
  locations: 17,
  /** Team size; shown as `teamLabel` on the site. */
  teamCount: 135,
  teamLabel: '135+',
  cities: 6,
  /** Projected growth figure shown on the home trust bar (percent). */
  growthPct: 30,
  foundedYear: 2024,
  headquarters: 'Asunción',
  country: 'PY',
  /** WhatsApp number for ordering CTAs (international format, digits only). */
  whatsappPhone: '595992035000',
} as const;

/**
 * Values for ICU placeholders in the message files: `{brands}`, `{locations}`,
 * `{team}`, `{teamCount}`, `{cities}`. Pass as the second argument of `t()`.
 */
export const FIGURES = {
  brands: COMPANY.brandsLabel,
  brandsCount: COMPANY.brandsCount,
  locations: COMPANY.locations,
  team: COMPANY.teamLabel,
  teamCount: COMPANY.teamCount,
  cities: COMPANY.cities,
} as const;
