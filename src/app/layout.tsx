import type { Metadata } from "next";
import "./gonzalez.css";

export const metadata: Metadata = {
  title: "Gonzalez Auto Upholstery | Houston, TX",
  description: "Family-owned auto upholstery in Houston, TX since 2007 — convertible tops, headliners, seats, custom interiors.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="ds-text">{children}</body>
    </html>
  );
}
