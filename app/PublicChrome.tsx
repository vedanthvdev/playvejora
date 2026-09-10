"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { footer, site } from "@/lib/site-copy";

/* Home matches only itself, everything else also claims its sub-pages, so a
   sport table still shows Stats as the section you are in. */
function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";

  return (
    <>
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
            {site.nav.map((item) => {
              const current = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  className={current ? "nav-on" : undefined}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link className="nav-cta" href="/register">
            Register
          </Link>
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <span>{footer.note}</span>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <span>{site.tagline}</span>
        </div>
      </footer>
    </>
  );
}
