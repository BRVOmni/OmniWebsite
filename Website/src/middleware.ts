import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18n = createMiddleware({
  ...routing,
  localeDetection: false,
});

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content Security Policy with a per-request nonce. Next.js reads the nonce from the
 * forwarded `content-security-policy` request header and stamps it on every script it
 * emits, so `'unsafe-inline'` / `'unsafe-eval'` are no longer needed for scripts.
 * Styles keep `'unsafe-inline'` because server-rendered `style=""` attributes
 * (framer-motion initial states, next/font) are inline styles by nature.
 * Dev needs eval (source maps) and websockets (HMR).
 */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob: https://www.omniprise.com.py",
    `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join('; ');
}

export default function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);

  const response = handleI18n(new NextRequest(request, { headers: requestHeaders }));
  response.headers.set('content-security-policy', csp);
  return response;
}

export const config = {
  matcher: ['/', '/(es|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
