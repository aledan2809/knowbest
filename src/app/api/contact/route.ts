import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { verifyOrigin } from "@/lib/csrf";

const CONTACT_RATE_MAX = 5;
const CONTACT_RATE_WINDOW_MS = 60_000;
const contactCounters = new Map<string, { count: number; resetAt: number }>();
function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = contactCounters.get(ip);
  if (!entry || entry.resetAt < now) {
    contactCounters.set(ip, { count: 1, resetAt: now + CONTACT_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= CONTACT_RATE_MAX) return false;
  entry.count++;
  return true;
}

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// AUDIT-005: Zod validation schema for contact form
const ContactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(200),
  email: z.string().trim().email("Invalid email address").max(320),
  company: z.string().trim().max(200).optional(),
  subject: z.string().trim().min(2, "Subject must be at least 2 characters").max(500),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "local";
  if (!checkContactRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests — try again in a minute" }, { status: 429 });
  }

  // AUDIT-008: CSRF origin check
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }

  try {
    const resend = getResend();
    const rawBody = await request.json();

    // AUDIT-005: Parse with Zod
    const parsed = ContactSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { name, email, company, subject, message } = parsed.data;

    // Send notification to admin
    await resend.emails.send({
      from: "KnowBest Contact <noreply@techbiz.ae>",
      to: ["contact@knowbest.ro"],
      replyTo: email,
      subject: `[KnowBest Contact] ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Message</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #2563eb;">${escapeHtml(email)}</a></td>
              </tr>
              ${company ? `<tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Company:</td>
                <td style="padding: 8px 0; color: #1e293b;">${escapeHtml(company)}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Subject:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${escapeHtml(subject)}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <div style="color: #334155; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>
          </div>
        </div>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "KnowBest <noreply@techbiz.ae>",
      to: [email],
      subject: "We received your message - KnowBest",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Thank you, ${escapeHtml(name)}!</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #334155; line-height: 1.6;">We received your message and will get back to you within 24 hours.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 16px;">— The KnowBest Team</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
