import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Fengxing <onboarding@resend.dev>";

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

export async function sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const from = payload.from || DEFAULT_FROM_EMAIL;

  if (!resend) {
    console.warn(
      `[Email Preview - No RESEND_API_KEY configured]\nTo: ${Array.isArray(payload.to) ? payload.to.join(", ") : payload.to}\nSubject: ${payload.subject}\nFrom: ${from}`
    );
    return { success: true, id: "mock-resend-id" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (error) {
      console.error("[Resend Email Error]:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email via Resend";
    console.error("[Resend Unexpected Error]:", message);
    return { success: false, error: message };
  }
}
