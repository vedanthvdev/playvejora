import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createCompetition } from "@/lib/competitions";
import { useDatabase } from "@/lib/db";
import {
  deleteMatch,
  footballScorers,
  listMatches,
  recordFootballMatch,
  recordVolleyballMatch,
  teamStandings,
} from "@/lib/matches";
import { listTeams, submitTeam, type TeamRecord } from "@/lib/registration";
import { createTestDatabase } from "@/lib/test-db";

const footballId = "cmp_edn_football_s1";

async function registerSide(
  teamName: string,
  players: string[],
  competitionPublicId = footballId,
): Promise<TeamRecord> {
  const result = await submitTeam({
    teamName,
    company: "Acme",
    friendsOrMixed: false,
    captainEmail: `${teamName.replace(/\s/g, "").toLowerCase()}@example.com`,
    playerNames: players,
    waiverAccepted: true,
    competitionPublicId,
  });
  if (!result.ok) {
    throw new Error(result.error);
  }
  const team = (await listTeams()).find((row) => row.publicId === result.publicId);
  if (!team) {
    throw new Error("team missing after register");
  }
  return team;
}

describe("matches", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    useDatabase(db);
  });

  afterEach(() => {
    useDatabase(null);
    db.close();
  });

  it("ranks football sides by points, then goal difference, then goals scored", async () => {
    const home = await registerSide("Pitch FC", ["Alex", "Sam"]);
    const away = await registerSide("Dockside", ["Ros"]);
    const third = await registerSide("Third XI", ["Kim"]);

    expect(
      await recordFootballMatch({
        competitionPublicId: footballId,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeGoals: 2,
        awayGoals: 1,
        scorers: [
          { teamId: home.id, playerName: "Alex", goals: 1 },
          { teamId: home.id, playerName: "Sam", goals: 1 },
          { teamId: away.id, playerName: "Ros", goals: 1 },
        ],
      }),
    ).toEqual({ ok: true });

    expect(
      await recordFootballMatch({
        competitionPublicId: footballId,
        homeTeamId: home.id,
        awayTeamId: third.id,
        homeGoals: 0,
        awayGoals: 0,
        scorers: [],
      }),
    ).toEqual({ ok: true });

    const table = await teamStandings({ sport: "football" });
    expect(table.map((row) => [row.teamName, row.played, row.won, row.drawn, row.lost, row.gf, row.ga, row.gd, row.points])).toEqual([
      ["Pitch FC", 2, 1, 1, 0, 2, 1, 1, 4],
      ["Third XI", 1, 0, 1, 0, 0, 0, 0, 1],
      ["Dockside", 1, 0, 0, 1, 1, 2, -1, 0],
    ]);
    expect(await footballScorers({ sport: "football" })).toEqual([
      { playerName: "Alex", teamName: "Pitch FC", city: "edinburgh", goals: 1 },
      { playerName: "Ros", teamName: "Dockside", city: "edinburgh", goals: 1 },
      { playerName: "Sam", teamName: "Pitch FC", city: "edinburgh", goals: 1 },
    ]);
  });

  it("refuses a football scorer who is not on that registered side", async () => {
    const home = await registerSide("Pitch FC", ["Alex"]);
    const away = await registerSide("Dockside", ["Ros"]);
    expect(
      await recordFootballMatch({
        competitionPublicId: footballId,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeGoals: 1,
        awayGoals: 0,
        scorers: [{ teamId: home.id, playerName: "Not Listed", goals: 1 }],
      }),
    ).toEqual({
      ok: false,
      error: "Scoring players must be on the registered team list.",
    });
  });

  it("requires each side's player goals to equal its team score", async () => {
    const home = await registerSide("Pitch FC", ["Alex", "Sam"]);
    const away = await registerSide("Dockside", ["Ros"]);

    expect(
      await recordFootballMatch({
        competitionPublicId: footballId,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeGoals: 2,
        awayGoals: 1,
        scorers: [
          { teamId: home.id, playerName: "Alex", goals: 1 },
          { teamId: away.id, playerName: "Ros", goals: 1 },
        ],
      }),
    ).toEqual({
      ok: false,
      error: "Player goal totals must match each team's score.",
    });
    expect(await listMatches(footballId)).toEqual([]);
  });

  it("computes a volleyball winner from posted sets", async () => {
    const created = await createCompetition({
      city: "manchester",
      sport: "volleyball",
      season: "one",
      leagueCap: 5,
    });
    if (!created.ok) {
      throw new Error(created.error);
    }
    const home = await registerSide("Spike", ["Alex"], created.competition.publicId);
    const away = await registerSide("Block", ["Ros"], created.competition.publicId);
    expect(
      await recordVolleyballMatch({
        competitionPublicId: created.competition.publicId,
        homeTeamId: home.id,
        awayTeamId: away.id,
        sets: [
          { home: 25, away: 20 },
          { home: 20, away: 25 },
          { home: 20, away: 25 },
        ],
      }),
    ).toEqual({ ok: true });

    const table = await teamStandings({ sport: "volleyball" });
    expect(table.map((row) => [row.teamName, row.won, row.lost, row.points])).toEqual([
      ["Block", 1, 0, 3],
      ["Spike", 0, 1, 0],
    ]);
    const [match] = await listMatches(created.competition.publicId);
    expect(match.winner).toBe("away");
    expect(match.sets).toEqual([
      { home: 25, away: 20 },
      { home: 20, away: 25 },
      { home: 20, away: 25 },
    ]);
  });

  it("will not post a result for a waitlisted side", async () => {
    const home = await registerSide("Pitch FC", ["Alex"]);
    await registerSide("Dockside", ["Ros"]);
    await registerSide("Third", ["Kim"]);
    await registerSide("Fourth", ["Lee"]);
    await registerSide("Fifth", ["Mo"]);
    const wait = await registerSide("Late FC", ["Pat"]);
    expect(wait.status).toBe("waitlist");
    expect(
      await recordFootballMatch({
        competitionPublicId: footballId,
        homeTeamId: home.id,
        awayTeamId: wait.id,
        homeGoals: 1,
        awayGoals: 0,
        scorers: [{ teamId: home.id, playerName: "Alex", goals: 1 }],
      }),
    ).toEqual({
      ok: false,
      error: "Pick two in-league teams from this competition.",
    });
  });

  it("removes a posted match", async () => {
    const home = await registerSide("Pitch FC", ["Alex"]);
    const away = await registerSide("Dockside", ["Ros"]);
    await recordFootballMatch({
      competitionPublicId: footballId,
      homeTeamId: home.id,
      awayTeamId: away.id,
      homeGoals: 1,
      awayGoals: 0,
      scorers: [{ teamId: home.id, playerName: "Alex", goals: 1 }],
    });
    const [match] = await listMatches(footballId);
    expect(await deleteMatch(match.id)).toBe(true);
    expect(await listMatches(footballId)).toEqual([]);
    expect(await teamStandings({ sport: "football" })).toEqual([
      expect.objectContaining({ teamName: "Pitch FC", played: 0, points: 0 }),
      expect.objectContaining({ teamName: "Dockside", played: 0, points: 0 }),
    ]);
  });
});
