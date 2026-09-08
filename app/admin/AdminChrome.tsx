import type { ReactNode } from "react";
import Link from "next/link";
import { site } from "@/lib/site-copy";
import { logoutAdminAction } from "./actions";

export function AdminChrome({
  children,
  loggedIn = false,
}: {
  children: ReactNode;
  loggedIn?: boolean;
}) {
  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link className="wordmark" href={loggedIn ? "/admin" : "/admin/login"}>
            <span className="dot" aria-hidden="true" />
            <span>
              <span className="wordmark-lead">{site.wordmark.lead}</span>
              <span className="wordmark-accent">{site.wordmark.accent}</span>
            </span>
          </Link>
          {loggedIn ? (
            <>
              <nav className="nav" aria-label="Organizer">
                <Link href="/admin">Team intake</Link>
                <Link href="/admin/competitions">Competitions</Link>
                <Link href="/admin/sports/football">Football</Link>
                <Link href="/admin/sports/volleyball">Volleyball</Link>
              </nav>
              <form className="admin-logout" action={logoutAdminAction}>
                <button className="btn btn-solid" type="submit">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <span className="admin-badge">Organizers</span>
          )}
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <span>PlayVejora · organizer intake</span>
        </div>
      </footer>
    </>
  );
}
