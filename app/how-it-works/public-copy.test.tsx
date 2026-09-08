import { describe, expect, it } from "vitest";
import { howItWorks, venue, home, site } from "@/lib/site-copy";

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

  it("keeps the live league in Edinburgh without a fake venue or city picker", () => {
    expect(home.kicker).toMatch(/Edinburgh/);
    expect(venue.cityLine).toMatch(/Edinburgh/);
    expect(venue.venueLine).toMatch(/to be confirmed/i);
    expect(venue.venueLine).not.toMatch(/\d{1,4}\s+\w+\s+(Street|Road|Lane)/);
    expect(site.nav.map((item) => item.href)).toEqual([
      "/",
      "/how-it-works",
      "/venue",
      "/register",
    ]);
  });
});
