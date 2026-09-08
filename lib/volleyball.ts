export type SetScore = {
  home: number;
  away: number;
};

export type VolleyballOutcome =
  | {
      ok: true;
      homeSets: number;
      awaySets: number;
      homePoints: number;
      awayPoints: number;
      winner: "home" | "away" | "draw";
    }
  | { ok: false; error: string };

export function volleyballOutcome(sets: SetScore[]): VolleyballOutcome {
  if (sets.length === 0) {
    return { ok: false, error: "Add at least one set." };
  }
  let homeSets = 0;
  let awaySets = 0;
  for (const set of sets) {
    if (!Number.isInteger(set.home) || !Number.isInteger(set.away) || set.home < 0 || set.away < 0) {
      return { ok: false, error: "Set scores must be zero or more." };
    }
    if (set.home === set.away) {
      return { ok: false, error: "Each set needs a winner." };
    }
    if (set.home > set.away) {
      homeSets += 1;
    } else {
      awaySets += 1;
    }
  }
  if (homeSets === awaySets) {
    return {
      ok: true,
      homeSets,
      awaySets,
      homePoints: 1,
      awayPoints: 1,
      winner: "draw",
    };
  }
  const homeWins = homeSets > awaySets;
  return {
    ok: true,
    homeSets,
    awaySets,
    homePoints: homeWins ? 3 : 0,
    awayPoints: homeWins ? 0 : 3,
    winner: homeWins ? "home" : "away",
  };
}
