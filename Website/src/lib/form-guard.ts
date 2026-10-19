/**
 * Honeypot: a visually hidden text field that humans never see or fill. Bots that
 * auto-complete every input trip it; the API then answers "success" without sending anything.
 */
export const HONEYPOT_FIELD = 'website_url';

export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const value = body[HONEYPOT_FIELD];
  return typeof value === 'string' && value.trim().length > 0;
}
