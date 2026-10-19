import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/franchise-schema';
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

  const limit = rateLimit(`contact:${getClientIp(request)}`, RATE_PRESETS.contact.limit, RATE_PRESETS.contact.windowMs);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const { name, email, company, message } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const contactEmail = process.env.CONTACT_EMAIL || 'info@omniprise.com.py';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@contact.omniprise.com.py';

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: contactEmail,
      replyTo: email,
      subject: `Nuevo mensaje de contacto: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Nuevo mensaje de contacto</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666; width: 120px;">Nombre</td>
              <td style="padding: 8px 0;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
            </tr>
            ${company ? `<tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Empresa</td>
              <td style="padding: 8px 0;">${escapeHtml(company)}</td>
            </tr>` : ''}
          </table>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email send failed:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
