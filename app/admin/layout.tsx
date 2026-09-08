import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidSession } from "@/lib/admin-auth";
import { AdminChrome } from "./AdminChrome";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return <AdminChrome loggedIn={await isValidSession(token)}>{children}</AdminChrome>;
}
