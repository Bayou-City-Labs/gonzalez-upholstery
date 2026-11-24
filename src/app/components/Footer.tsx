import { BUSINESS } from "../business-info";

export function Footer() {
  return (
    <footer className="ds-container ds-section" style={{ paddingBlock: "var(--ds-space-12)" }}>
      <hr className="gonzalez-stitch gonzalez-stitch--subtle" style={{ marginBottom: "var(--ds-space-8)" }} />
      <div className="ds-inline ds-inline--between ds-gap-6">
        <div className="ds-stack ds-gap-1">
          <p className="ds-text ds-text--semibold">{BUSINESS.name}</p>
          <p className="ds-text ds-text--sm ds-text--muted">
            {BUSINESS.address.street}, {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.zip}
          </p>
          <a href={BUSINESS.phoneHref} className="ds-link ds-text--sm">
            {BUSINESS.phone}
          </a>
        </div>
        <div className="ds-stack ds-gap-1">
          {BUSINESS.hours.map((h) => (
            <p key={h.days} className="ds-text ds-text--sm ds-text--muted">
              {h.days}: {h.time}
            </p>
          ))}
        </div>
      </div>
    </footer>
  );
}
