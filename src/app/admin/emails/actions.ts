"use server";

import { requireRole } from "@/lib/auth/server";
import { sendEmail } from "@/lib/email/resend";

export async function sendTestEmailAction(payload: {
  to: string;
  subject: string;
  html: string;
}) {
  await requireRole("admin");

  if (!payload.to || !payload.to.includes("@")) {
    return { error: "Please enter a valid recipient email address." };
  }

  const result = await sendEmail({
    to: payload.to.trim(),
    subject: `[TEST] ${payload.subject}`,
    html: payload.html,
  });

  if (!result.success) {
    return { error: result.error || "Failed to deliver test email." };
  }

  return { success: `Test email dispatched successfully to ${payload.to}!` };
}
