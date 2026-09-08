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

const registerLink = site.nav.find((item) => item.href === "/register") ?? {
  href: "/register",
  label: "Register",
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
            <span>{site.tagline}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
