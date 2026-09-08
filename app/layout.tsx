import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { footer, site } from "@/lib/site-copy";
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

const registerLink = site.nav.find((item) => item.href === "/register") ?? {
  href: "/register",
  label: "Register",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const structuredData = JSON.stringify(sportsClubJsonLd());

  return (
    <html lang="en-GB">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        <header className="site-header">
          <div className="wrap header-inner">
            <Link className="wordmark" href="/">
              <span className="dot" aria-hidden="true" />
              <span>
                <span className="wordmark-lead">{site.wordmark.lead}</span>
                <span className="wordmark-accent">{site.wordmark.accent}</span>
              </span>
            </Link>
            <nav className="nav" aria-label="Primary">
              {site.nav
                .filter((item) => item.href !== registerLink.href)
                .map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
            </nav>
            <Link className="nav-cta" href={registerLink.href}>
              {registerLink.label}
            </Link>
          </div>
        </header>
        <main className="main">{children}</main>
        <footer className="site-footer">
            <div className="wrap footer-inner">
              <span>{footer.note}</span>
              <Link href="/origin">Origin</Link>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <span>{site.tagline}</span>
            </div>
        </footer>
      </body>
    </html>
  );
}
