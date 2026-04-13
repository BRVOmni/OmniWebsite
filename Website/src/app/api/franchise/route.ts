import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'https://dashboard.omniprise.com.py';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const franchiseEmail = process.env.FRANCHISE_EMAIL || 'franquicias@omniprise.com.py';
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  try {
    const body = await request.json();

    if (!body.firstName || !body.lastName || !body.email || !body.phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fields: Array<{ label: string; value: string }> = [
      { label: 'Nombre', value: `${body.firstName} ${body.lastName}` },
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
      subject: `Nueva solicitud de franquicia: ${body.firstName} ${body.lastName}`,
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

    // Forward to dashboard API to save lead in the pipeline
    try {
      const fullName = `${body.firstName} ${body.lastName}`.trim();
      await fetch(`${DASHBOARD_API_URL}/api/franchise/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email: body.email,
          phone: body.phone,
          city: body.city || '',
          country: body.country || 'Paraguay',
          current_brand_name: body.preferredBrand || undefined,
          years_in_business: body.yearsExperience ? Number(body.yearsExperience) : undefined,
          investment_range: mapInvestmentRange(body.investmentRange),
          timeframe_to_start: mapTimeline(body.timeline),
          motivation: body.motivation || undefined,
          goals: body.additionalInfo || undefined,
          lead_source: 'website',
        }),
      });
    } catch (err) {
      // Dashboard sync failure should NOT fail the form submission
      // The email was already sent successfully
      console.error('Dashboard sync failed:', err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email send failed:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

/** Map website investment range labels to dashboard enum values */
function mapInvestmentRange(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes('50') && lower.includes('100')) return '50k-100k';
  if (lower.includes('100') && lower.includes('250')) return '100k-250k';
  if (lower.includes('250') && lower.includes('500')) return '250k-500k';
  if (lower.includes('500')) return '500k+';
  return undefined;
}

/** Map website timeline labels to dashboard enum values */
function mapTimeline(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes('inmediat') || lower.includes('immediate')) return 'immediately';
  if (lower.includes('3') && lower.includes('6')) return '3-6_months';
  if (lower.includes('6') && lower.includes('12')) return '6-12_months';
  if (lower.includes('año') || lower.includes('year') || lower.includes('próx')) return 'next_year';
  return undefined;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
