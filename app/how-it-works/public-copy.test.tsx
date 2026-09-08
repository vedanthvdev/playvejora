import { afterEach, describe, expect, it } from "vitest";
import { howItWorks, origin, venue, home, site } from "@/lib/site-copy";
import {
  PRODUCTION_ORIGIN,
  absoluteUrl,
  siteUrl,
  sportsClubJsonLd,
} from "@/lib/seo";

describe("public copy", () => {
  it("explains captain registration, waitlist, and no payment", () => {
    const blob = howItWorks.points.join(" ");
    expect(blob).toMatch(/captain/i);
    expect(blob).toMatch(/waitlist/i);
    expect(blob).toMatch(/Payment is not collected/i);
  });

  it("splits the two-tone wordmark without altering the product name", () => {
    expect(site.wordmark.lead + site.wordmark.accent).toBe(site.name);
  });

  it("tells the origin story without inventing founder names", () => {
    expect(origin.lede).toMatch(/two friends/i);
    expect(origin.lede).toMatch(/same company/i);
    expect(origin.lede).not.toMatch(/\b(John|Jane|Alex Smith)\b/);
  });

  it("keeps the live league in Edinburgh without a fake venue or city picker", () => {
    expect(home.kicker).toMatch(/Edinburgh/);
    expect(venue.cityLine).toMatch(/Edinburgh/);
    expect(venue.venueLine).toMatch(/to be confirmed/i);
    expect(venue.venueLine).not.toMatch(/\d{1,4}\s+\w+\s+(Street|Road|Lane)/);
    expect(site.nav.map((item) => item.href)).toEqual([
      "/",
      "/how-it-works",
      "/venue",
      "/origin",
      "/register",
    ]);
  });
});

describe("seo helpers", () => {
  const previous = process.env.SITE_URL;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = previous;
    }
  });

  it("falls back to the live domain when SITE_URL is unset", () => {
    delete process.env.SITE_URL;
    expect(siteUrl()).toBe(PRODUCTION_ORIGIN);
    expect(PRODUCTION_ORIGIN).toBe("https://playvejora.dpdns.org");
    expect(absoluteUrl("/origin")).toBe("https://playvejora.dpdns.org/origin");
  });

  it("honours SITE_URL and strips a trailing slash", () => {
    process.env.SITE_URL = "https://staging.playvejora.dpdns.org/";
    expect(siteUrl()).toBe("https://staging.playvejora.dpdns.org");
    expect(absoluteUrl("/register")).toBe(
      "https://staging.playvejora.dpdns.org/register",
    );
  });

  it("describes an Edinburgh club without a street address", () => {
    const data = sportsClubJsonLd();
    expect(data["@type"]).toBe("SportsClub");
    expect(data.areaServed).toEqual({ "@type": "City", name: "Edinburgh" });
    expect(JSON.stringify(data)).not.toMatch(/streetAddress/);
  });

  it("publishes one contact address for search results and the site", () => {
    const data = sportsClubJsonLd();
    expect(site.email).toBe("playvejora@gmail.com");
    expect(data.email).toBe(site.email);
    expect(data.contactPoint.email).toBe(site.email);
  });
});
