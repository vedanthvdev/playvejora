import { describe, expect, it } from "vitest";
import { volleyballOutcome } from "@/lib/volleyball";

describe("volleyballOutcome", () => {
  it("gives the winner three points and the loser none from the sets", () => {
    expect(
      volleyballOutcome([
        { home: 25, away: 20 },
        { home: 20, away: 25 },
        { home: 20, away: 25 },
      ]),
    ).toEqual({
      ok: true,
      homeSets: 1,
      awaySets: 2,
      homePoints: 0,
      awayPoints: 3,
      winner: "away",
    });
  });

  it("gives each side one point when they win the same number of sets", () => {
    expect(
      volleyballOutcome([
        { home: 25, away: 20 },
        { home: 20, away: 25 },
      ]),
    ).toEqual({
      ok: true,
      homeSets: 1,
      awaySets: 1,
      homePoints: 1,
      awayPoints: 1,
      winner: "draw",
    });
  });

  it("refuses a blank list or a tied set", () => {
    expect(volleyballOutcome([])).toEqual({
      ok: false,
      error: "Add at least one set.",
    });
    expect(volleyballOutcome([{ home: 25, away: 25 }])).toEqual({
      ok: false,
      error: "Each set needs a winner.",
    });
    expect(volleyballOutcome([{ home: -1, away: 25 }])).toEqual({
      ok: false,
      error: "Set scores must be zero or more.",
    });
  });
});
