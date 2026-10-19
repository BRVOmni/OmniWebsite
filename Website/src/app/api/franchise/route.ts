import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { franchiseSchema } from '@/lib/franchise-schema';
import { mapInvestmentRange, mapTimeline, parseYears } from '@/lib/dashboard-lead';
import { isHoneypotTripped } from '@/lib/form-guard';
import { getClientIp, rateLimit, RATE_PRESETS } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/escape-html';

const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'https://dashboard.omniprise.com.py';
const DASHBOARD_TIMEOUT_MS = 8000;

export async function POST(request: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Bots that fill the hidden field get a quiet "success" and nothing is sent.
  if (isHoneypotTripped(raw)) return NextResponse.json({ success: true });

  const limit = rateLimit(`franchise:${getClientIp(request)}`, RATE_PRESETS.franchise.limit, RATE_PRESETS.franchise.windowMs);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } });
  }

  const parsed = franchiseSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const body = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const franchiseEmail = process.env.FRANCHISE_EMAIL || 'franquicias@omniprise.com.py';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@contact.omniprise.com.py';
  const fullName = `${body.firstName} ${body.lastName}`.trim();

  try {
    const fields: Array<{ label: string; value: string }> = [
      { label: 'Nombre', value: fullName },
      { label: 'Email', value: body.email },
      { label: 'Teléfono', value: body.phone },
      { label: 'Ciudad', value: body.city },
      { label: 'País', value: body.country },
      { label: 'Marca de interés', value: body.preferredBrand },
      { label: 'Experiencia en gastronomía', value: body.hasExperience },
      { label: 'Negocio actual', value: body.currentBusiness },
      { label: 'Años de experiencia', value: body.yearsExperience },
      { label: 'Rango de inversión', value: body.investmentRange },
      { label: 'Ubicación disponible', value: body.hasLocation },
      { label: 'Ciudad de ubicación', value: body.locationCity },
      { label: 'Plazo de apertura', value: body.timeline },
      { label: 'Cómo nos conoció', value: body.howHeard },
    ];

    const rows = fields
      .filter((f) => f.value)
      .map(
        (f) => `
        <tr>
          <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #666; white-space: nowrap; vertical-align: top;">${escapeHtml(f.label)}</td>
          <td style="padding: 6px 0;">${escapeHtml(f.value)}</td>
        </tr>`,
      )
      .join('');

    const result = await resend.emails.send({
      from: fromEmail,
      to: franchiseEmail,
      replyTo: body.email,
      subject: `Nueva solicitud de franquicia: ${fullName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Nueva solicitud de franquicia</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${rows}
          </table>
          ${body.motivation ? `
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="font-weight: bold; color: #666; margin-bottom: 4px;">Motivación</p>
          <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(body.motivation)}</p>
          ` : ''}
          ${body.additionalInfo ? `
          <p style="font-weight: bold; color: #666; margin-bottom: 4px; margin-top: 16px;">Información adicional</p>
          <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(body.additionalInfo)}</p>
          ` : ''}
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    // Forward to the dashboard pipeline. A sync failure must never fail the submission:
    // the e-mail already went out. Bounded by a timeout so a slow dashboard cannot hang this route.
    try {
      const res = await fetch(`${DASHBOARD_API_URL}/api/franchise/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(DASHBOARD_TIMEOUT_MS),
        body: JSON.stringify({
          full_name: fullName,
          email: body.email,
          phone: body.phone,
          city: body.city,
          country: body.country || 'Paraguay',
          current_brand_name: body.preferredBrand || undefined,
          years_in_business: parseYears(body.yearsExperience),
          investment_range: mapInvestmentRange(body.investmentRange),
          timeframe_to_start: mapTimeline(body.timeline),
          motivation: body.motivation || undefined,
          goals: body.additionalInfo || undefined,
          lead_source: 'website',
        }),
      });
      if (!res.ok) console.error('Dashboard sync rejected the lead:', res.status, await res.text().catch(() => ''));
    } catch (err) {
      console.error('Dashboard sync failed:', err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email send failed:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
