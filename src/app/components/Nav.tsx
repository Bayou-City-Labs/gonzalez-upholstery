import { BUSINESS } from "../business-info";

export function Nav() {
  return (
    <header
      className="ds-container"
      style={{
        position: "sticky",
        top: 0,
        zIndex: "var(--ds-z-sticky)" as unknown as number,
        backgroundColor: "var(--ds-color-bg)",
        borderBottom: "1px solid var(--ds-color-border)",
      }}
    >
      <div
        className="ds-inline ds-inline--between"
        style={{ paddingBlock: "var(--ds-space-3)" }}
      >
        <a href="#top" className="ds-text ds-text--semibold" style={{ textDecoration: "none", color: "var(--ds-color-text)" }}>
          {BUSINESS.name}
        </a>
        <nav className="ds-inline ds-gap-6" aria-label="Primary">
          <span className="gonzalez-nav__links ds-inline ds-gap-6">
            <a href="#services" className="ds-link--subtle ds-text--sm" style={{ textDecoration: "none" }}>
              Services
            </a>
            <a href="#gallery" className="ds-link--subtle ds-text--sm" style={{ textDecoration: "none" }}>
              Our Work
            </a>
            <a href="#about" className="ds-link--subtle ds-text--sm" style={{ textDecoration: "none" }}>
              About
            </a>
          </span>
          <a href={BUSINESS.phoneHref} className="ds-button ds-button--primary ds-button--sm">
            Call {BUSINESS.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
