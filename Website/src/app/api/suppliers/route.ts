import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supplierSchema } from '@/lib/franchise-schema';
import { isHoneypotTripped } from '@/lib/form-guard';
import { getClientIp, rateLimit, RATE_PRESETS } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/escape-html';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Bots that fill the hidden field get a quiet "success" and nothing is sent.
  if (isHoneypotTripped(body)) return NextResponse.json({ success: true });

  const limit = rateLimit(`suppliers:${getClientIp(request)}`, RATE_PRESETS.suppliers.limit, RATE_PRESETS.suppliers.windowMs);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } });
  }

  const parsed = supplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid fields' }, { status: 400 });
  }
  const d = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const supplierEmail = process.env.SUPPLIER_EMAIL || process.env.CONTACT_EMAIL || 'info@omniprise.com.py';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@contact.omniprise.com.py';

  try {
    const fields: Array<{ label: string; value: string }> = [
      { label: 'Razón social', value: d.company },
      { label: 'RUC', value: d.ruc },
      { label: 'Categoría', value: d.category },
      { label: 'Cobertura', value: d.coverage },
      { label: 'Contacto', value: d.contactName },
      { label: 'Email', value: d.email },
      { label: 'Teléfono', value: d.phone },
    ];

    const rows = fields
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
      to: supplierEmail,
      replyTo: d.email,
      subject: `Nuevo proveedor interesado: ${d.company}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Nuevo proveedor interesado</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${rows}
          </table>
          ${d.message ? `
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="font-weight: bold; color: #666; margin-bottom: 4px;">Mensaje</p>
          <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(d.message)}</p>
          ` : ''}
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Supplier email failed:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
