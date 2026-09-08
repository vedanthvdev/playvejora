import { describe, expect, it } from "vitest";
import {
  CITIES,
  SEASONS,
  SPORTS,
  catalogueLabel,
  parseCatalogue,
} from "@/lib/catalogue";

describe("catalogue", () => {
  it("ships only football and volleyball in edinburgh and manchester", () => {
    expect(SPORTS.map((row) => row.slug)).toEqual(["football", "volleyball"]);
    expect(CITIES.map((row) => row.slug)).toEqual(["edinburgh", "manchester"]);
    expect(SEASONS.map((row) => row.slug)).toEqual(["one"]);
  });

  it("accepts a listed city, sport, and season", () => {
    expect(
      parseCatalogue({ city: " Edinburgh ", sport: "Football", season: "one" }),
    ).toEqual({
      ok: true,
      city: "edinburgh",
      sport: "football",
      season: "one",
    });
  });

  it("rejects a city or sport that is not in the catalogue", () => {
    expect(
      parseCatalogue({ city: "glasgow", sport: "football", season: "one" }),
    ).toEqual({ ok: false, error: "City must be Edinburgh or Manchester." });
    expect(
      parseCatalogue({ city: "edinburgh", sport: "netball", season: "one" }),
    ).toEqual({ ok: false, error: "Sport must be football or volleyball." });
    expect(
      parseCatalogue({ city: "edinburgh", sport: "football", season: "two" }),
    ).toEqual({ ok: false, error: "Season must be chosen from the list." });
  });

  it("labels catalogue slugs for people", () => {
    expect(catalogueLabel("edinburgh")).toBe("Edinburgh");
    expect(catalogueLabel("football")).toBe("Football");
    expect(catalogueLabel("one")).toBe("Season one");
  });
});
