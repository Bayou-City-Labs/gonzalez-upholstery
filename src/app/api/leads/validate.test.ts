import { describe, expect, it } from "vitest";
import { validateLead } from "./validate";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

describe("validateLead", () => {
  it("accepts a complete, valid submission", () => {
    const result = validateLead(fd({ name: "Jane Doe", phone: "8325551234", email: "jane@example.com", jobType: "seats", message: "Need two front seats redone." }));
    expect(result).toEqual({
      ok: true,
      lead: { name: "Jane Doe", phone: "8325551234", email: "jane@example.com", jobType: "seats", message: "Need two front seats redone." },
    });
  });

  it("allows email to be omitted", () => {
    const result = validateLead(fd({ name: "Jane Doe", phone: "8325551234", email: "", jobType: "seats", message: "Need two front seats redone." }));
    expect(result).toEqual({ ok: true, lead: { name: "Jane Doe", phone: "8325551234", email: null, jobType: "seats", message: "Need two front seats redone." } });
  });

  it("rejects a submission with the honeypot filled in", () => {
    const result = validateLead(fd({ name: "Jane Doe", phone: "8325551234", email: "", jobType: "seats", message: "test", honeypot: "spam" }));
    expect(result).toEqual({ ok: false, error: "rejected" });
  });

  it("rejects a submission missing a required field", () => {
    const result = validateLead(fd({ name: "", phone: "8325551234", email: "", jobType: "seats", message: "test" }));
    expect(result).toEqual({ ok: false, error: "missing required field" });
  });
});
