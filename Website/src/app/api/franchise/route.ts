import { Resend } from 'resend';
import { NextResponse } from 'next/server';

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

    await resend.emails.send({
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
