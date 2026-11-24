import { About } from "./components/About";
import { ContactForm } from "./components/ContactForm";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { BUSINESS } from "./business-info";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Gallery />
      <About />
      <section className="ds-section ds-container" id="contact">
        <hr className="gonzalez-stitch" style={{ marginBottom: "var(--ds-space-12)" }} />
        <h2 className="ds-heading ds-heading--2xl" style={{ marginBottom: "var(--ds-space-2)" }}>
          Get a Quote
        </h2>
        <p className="ds-text ds-text--muted" style={{ marginBottom: "var(--ds-space-8)" }}>
          Tell us what you need, or call us at {BUSINESS.phone}.
        </p>
        <ContactForm />
      </section>
      <Footer />
    </main>
  );
}
