import Image from "next/image";

const PLACEHOLDERS = [1, 2, 3, 4, 5, 6].map((i) => `/gallery/placeholder-${i}.svg`);

export function Gallery() {
  return (
    <section className="ds-section ds-container" id="gallery">
      <hr className="gonzalez-stitch" style={{ marginBottom: "var(--ds-space-12)" }} />
      <h2 className="ds-heading ds-heading--2xl" style={{ marginBottom: "var(--ds-space-8)" }}>
        Our Work
      </h2>
      <div className="ds-grid" data-cols-md data-cols-lg style={{ "--ds-grid-cols": 1, "--ds-grid-cols-md": 2, "--ds-grid-cols-lg": 3 } as React.CSSProperties}>
        {PLACEHOLDERS.map((src) => (
          <div key={src} className="ds-card" style={{ overflow: "hidden" }}>
            <Image src={src} alt="Gonzalez Auto Upholstery project" width={640} height={480} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        ))}
      </div>
    </section>
  );
}
