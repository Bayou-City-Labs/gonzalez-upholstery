import Image from "next/image";

const PHOTOS = [
  { src: "/gallery/gh-1.jpg", alt: "Center console trim and rear seatbelt mounts, close-up" },
  { src: "/gallery/gh-2.jpg", alt: "Reupholstered dashboard and leather trim" },
  { src: "/gallery/gh-3.jpg", alt: "Pickup truck front seat with embroidered headrest" },
  { src: "/gallery/gh-4.jpg", alt: "Center console trim and rear seatbelt mounts, close-up" },
  { src: "/gallery/gh-5.jpg", alt: "Vehicle dashboard with aftermarket gauge installed" },
  { src: "/gallery/gh-6.jpg", alt: "Damaged seat and seatbelt mount trim before repair" },
];

export function Gallery() {
  return (
    <section className="ds-section ds-container" id="gallery">
      <hr className="gonzalez-stitch" style={{ marginBottom: "var(--ds-space-12)" }} />
      <h2 className="ds-heading ds-heading--2xl" style={{ marginBottom: "var(--ds-space-8)" }}>
        Our Work
      </h2>
      <div className="ds-grid" data-cols-md data-cols-lg style={{ "--ds-grid-cols": 1, "--ds-grid-cols-md": 2, "--ds-grid-cols-lg": 3 } as React.CSSProperties}>
        {PHOTOS.map((photo) => (
          <div key={photo.src} className="ds-card" style={{ overflow: "hidden" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3" }}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
