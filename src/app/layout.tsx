import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import "./gonzalez.css";
import { BUSINESS } from "./business-info";
import { SITE_URL } from "./site-config";

const title = `${BUSINESS.name} | Houston, TX`;
const description = `${BUSINESS.tagline} Convertible tops, headliners, seats, and custom interiors.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: BUSINESS.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: BUSINESS.name,
    description: BUSINESS.tagline,
    telephone: BUSINESS.phone,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.state,
      postalCode: BUSINESS.address.zip,
      addressCountry: "US",
    },
    openingHoursSpecification: BUSINESS.hours
      .filter((h) => h.opens && h.closes)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.dayList,
        opens: h.opens,
        closes: h.closes,
      })),
  };

  return (
    <html lang="en">
      <body className="ds-text">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
