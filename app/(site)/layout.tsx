import type { ReactNode } from "react";
import { PublicChrome } from "../PublicChrome";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <PublicChrome>{children}</PublicChrome>;
}
