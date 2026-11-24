"use client";

import { useState } from "react";
import { BUSINESS } from "../business-info";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/leads", { method: "POST", body: formData });
      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="ds-card ds-card--raised ds-card--spacious">
        <p className="ds-text ds-text--lg">
          Thanks — we got your message and will reach out shortly. You can also call
          us directly at <a href={BUSINESS.phoneHref} className="ds-link">{BUSINESS.phone}</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="ds-stack ds-gap-4" style={{ maxWidth: "32rem" }}>
      {/* Honeypot: hidden from real users via CSS, bots that fill every field get rejected server-side. */}
      <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <label>
          Leave this field blank
          <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="name">Name</label>
        <input className="ds-input" id="name" name="name" type="text" required />
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="phone">Phone</label>
        <input className="ds-input" id="phone" name="phone" type="tel" required />
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="email">
          Email <span className="ds-label__optional">(optional)</span>
        </label>
        <input className="ds-input" id="email" name="email" type="email" />
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="jobType">What do you need done?</label>
        <select className="ds-select__control" id="jobType" name="jobType" required defaultValue="">
          <option value="" disabled>Select one</option>
          <option value="convertible-top">Convertible Top</option>
          <option value="headliner">Headliner</option>
          <option value="seats">Seats</option>
          <option value="door-panels">Door Panels</option>
          <option value="carpet">Carpet</option>
          <option value="dashboard">Dashboard</option>
          <option value="custom-interior">Custom Interior</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="message">Message</label>
        <textarea className="ds-textarea" id="message" name="message" required />
      </div>

      <button type="submit" className="ds-button ds-button--primary ds-button--lg" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send"}
      </button>

      {status === "error" && (
        <p className="ds-field-error">
          Something went wrong — please call us directly at {BUSINESS.phone}.
        </p>
      )}
    </form>
  );
}
