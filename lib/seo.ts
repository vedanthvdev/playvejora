import { site } from "@/lib/site-copy";

export const defaultDescription =
  "PlayVejora is a company-first after-work football league in Edinburgh. A captain registers the whole team. The first five sides are in; later teams join the waitlist.";

export const PRODUCTION_ORIGIN = "https://playvejora.dpdns.org";

export function siteUrl(): string {
  const raw = process.env.SITE_URL ?? PRODUCTION_ORIGIN;
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${suffix}`;
}

export function sportsClubJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    name: site.name,
    sport: "Association football",
    url: siteUrl(),
    email: site.email,
    description: defaultDescription,
    areaServed: {
      "@type": "City",
      name: site.city,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressCountry: "GB",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Team registration",
      email: site.email,
      areaServed: "GB",
      availableLanguage: "English",
    },
  };
}
