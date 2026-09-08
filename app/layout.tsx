import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { footer, site } from "@/lib/site-copy";
import "./globals.css";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description:
    "PlayVejora is a company-first after-work football league in Edinburgh. A captain registers the whole team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="wordmark" href="/">
            <span className="dot" aria-hidden="true" />
            {site.name}
          </Link>
          <nav className="nav">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={item.href === "/register" ? "nav-cta" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="main">{children}</main>
        <footer className="site-footer">
          <span>{footer.note}</span>
          <span>{site.tagline}</span>
        </footer>
      </body>
    </html>
  );
}
