export type Lead = {
  name: string;
  phone: string;
  email: string | null;
  jobType: string;
  message: string;
};

export type ValidationResult = { ok: true; lead: Lead } | { ok: false; error: string };

export function validateLead(formData: FormData): ValidationResult {
  if (String(formData.get("honeypot") ?? "").length > 0) {
    return { ok: false, error: "rejected" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const jobType = String(formData.get("jobType") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();

  if (!name || !phone || !jobType || !message) {
    return { ok: false, error: "missing required field" };
  }

  return { ok: true, lead: { name, phone, email: emailRaw.length > 0 ? emailRaw : null, jobType, message } };
}
