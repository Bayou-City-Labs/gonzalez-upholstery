import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateLead } from "./validate";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = validateLead(formData);

  if (!result.ok) {
    // The honeypot case and the missing-field case both get a generic 400 —
    // never tell a bot which check it tripped.
    return NextResponse.json({ error: "invalid submission" }, { status: 400 });
  }

  const { lead } = result;
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    insert into leads (name, phone, email, job_type, message)
    values (${lead.name}, ${lead.phone}, ${lead.email}, ${lead.jobType}, ${lead.message})
  `;

  // Lead is saved. An email failure here must not fail the response.
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: "Gonzalez Auto Upholstery <onboarding@resend.dev>",
      to: process.env.LEAD_NOTIFICATION_EMAIL!,
      subject: `New lead: ${lead.name} (${lead.jobType})`,
      text: `Name: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email ?? "(not provided)"}\nJob type: ${lead.jobType}\nMessage: ${lead.message}`,
    });
  } catch (err) {
    console.error("Resend notification failed (lead was saved):", err);
  }

  return NextResponse.json({ ok: true });
}
