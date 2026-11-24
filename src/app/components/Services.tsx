import { BUSINESS } from "../business-info";

export function Services() {
  return (
    <section className="ds-section ds-container" id="services">
      <hr className="gonzalez-stitch" style={{ marginBottom: "var(--ds-space-12)" }} />
      <h2 className="ds-heading ds-heading--2xl" style={{ marginBottom: "var(--ds-space-8)" }}>
        Services
      </h2>
      <div className="ds-grid ds-grid--auto ds-gap-6" style={{ "--ds-grid-min": "16rem" } as React.CSSProperties}>
        {BUSINESS.services.map((service) => (
          <div key={service.name} className="ds-card ds-card--raised ds-card--spacious">
            <h3 className="ds-heading ds-heading--md" style={{ marginBottom: "var(--ds-space-2)" }}>
              {service.name}
            </h3>
            <p className="ds-text ds-text--sm ds-text--muted">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
