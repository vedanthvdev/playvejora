import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/lib/site-copy";
import { defaultDescription, siteUrl, sportsClubJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: defaultDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary",
    title: `${site.name} — ${site.tagline}`,
    description: defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const structuredData = JSON.stringify(sportsClubJsonLd());

  // Browser extensions add their own attributes to <html> before React
  // hydrates, which React reports as a mismatch. The suppression is one level
  // deep, so real mismatches inside the app are still reported.
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        {children}
      </body>
    </html>
  );
}
