import { BUSINESS } from "../business-info";

export function Hero() {
  return (
    <section className="ds-section ds-container" style={{ paddingBlockStart: "var(--ds-space-24)" }}>
      <div className="ds-stack ds-gap-6" style={{ maxWidth: "42rem" }}>
        <span className="ds-eyebrow ds-eyebrow--accent">Houston, TX &middot; Since 2007</span>
        <h1 className="ds-display">{BUSINESS.name}</h1>
        <p className="ds-text ds-text--lg ds-text--muted">
          Convertible tops, headliners, seats, and custom interiors — family-owned,
          done right the first time.
        </p>
        <div className="ds-inline ds-gap-3">
          <a href="#contact" className="ds-button ds-button--primary ds-button--lg">
            Get a Quote
          </a>
          <a href={BUSINESS.phoneHref} className="ds-button ds-button--secondary ds-button--lg">
            Call {BUSINESS.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
