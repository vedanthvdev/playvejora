import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  citiesForSport,
  createCompetition,
  deleteCompetition,
  listCompetitions,
  listOpenCompetitions,
  setCompetitionListed,
  sportsOf,
} from "@/lib/competitions";
import { useDatabase } from "@/lib/db";
import { listTeams, submitTeam } from "@/lib/registration";
import { createTestDatabase } from "@/lib/test-db";

describe("competitions", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    useDatabase(db);
  });

  afterEach(() => {
    useDatabase(null);
    db.close();
  });

  it("ships one open Edinburgh football league", async () => {
    const open = await listOpenCompetitions();
    expect(open).toHaveLength(1);
    expect(open[0]).toMatchObject({
      city: "edinburgh",
      sport: "football",
      leagueCap: 5,
      listed: true,
    });
  });

  it("adds a competition from the city and sport catalogue", async () => {
    const result = await createCompetition({
      city: " Manchester ",
      sport: "Volleyball",
      season: "one",
      leagueCap: 6,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.competition.city).toBe("manchester");
    expect(result.competition.sport).toBe("volleyball");
    expect(result.competition.name).toBe("Manchester volleyball season one");
    expect(result.competition.publicId).toMatch(/^cmp_[0-9a-f]{16}$/);
  });

  it("refuses a duplicate city, sport, and season", async () => {
    expect(
      await createCompetition({
        city: "edinburgh",
        sport: "football",
        season: "one",
        leagueCap: 5,
      }),
    ).toEqual({
      ok: false,
      error:
        "That city, sport, and season already exist. Unhide it instead of adding it again.",
    });
    expect(await listCompetitions()).toHaveLength(1);
  });

  it("refuses a city outside the catalogue or a cap under one", async () => {
    expect(
      await createCompetition({ city: " ", sport: "football", season: "one", leagueCap: 5 }),
    ).toEqual({ ok: false, error: "City must be Edinburgh or Manchester." });
    expect(
      await createCompetition({
        city: "manchester",
        sport: "volleyball",
        season: "one",
        leagueCap: 0,
      }),
    ).toEqual({ ok: false, error: "League cap must be at least 1." });
  });

  it("hides a competition without deleting its registrations", async () => {
    await submitTeam({
      teamName: "Pitch FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });
    expect(await setCompetitionListed("cmp_edn_football_s1", false)).toBe(true);
    expect(await listOpenCompetitions()).toEqual([]);
    expect(await listTeams()).toHaveLength(1);

    expect(await setCompetitionListed("cmp_edn_football_s1", true)).toBe(true);
    expect(await listOpenCompetitions()).toHaveLength(1);
  });

  it("deletes an empty competition", async () => {
    const created = await createCompetition({
      city: "manchester",
      sport: "volleyball",
      season: "one",
      leagueCap: 5,
    });
    if (!created.ok) {
      throw new Error(created.error);
    }

    expect(await deleteCompetition(created.competition.publicId)).toEqual({
      ok: true,
    });
    expect(
      (await listCompetitions()).map((row) => row.publicId),
    ).not.toContain(created.competition.publicId);
  });

  it("does not delete a competition that has registered teams", async () => {
    await submitTeam({
      teamName: "Pitch FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });

    expect(await deleteCompetition("cmp_edn_football_s1")).toEqual({
      ok: false,
      error: "This competition has registered teams and cannot be deleted.",
    });
    expect(await listCompetitions()).toHaveLength(1);
  });

  it("does not take a registration for a hidden league", async () => {
    await setCompetitionListed("cmp_edn_football_s1", false);
    expect(
      await submitTeam({
        teamName: "Pitch FC",
        company: "Acme",
        friendsOrMixed: false,
        captainEmail: "cap@example.com",
        playerNames: ["Alex"],
        waiverAccepted: true,
      }),
    ).toEqual({ ok: false, error: "That league is not open for registration." });
    expect(await listTeams()).toEqual([]);
  });

  it("registers into the chosen league and caps each one on its own", async () => {
    const created = await createCompetition({
      city: "manchester",
      sport: "volleyball",
      season: "one",
      leagueCap: 1,
    });
    if (!created.ok) {
      throw new Error("competition should have been created");
    }
    const base = {
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
      competitionPublicId: created.competition.publicId,
    };
    expect(await submitTeam({ ...base, teamName: "Net 1" })).toMatchObject({
      status: "in_league",
    });
    expect(await submitTeam({ ...base, teamName: "Net 2" })).toMatchObject({
      status: "waitlist",
    });

    expect(
      await submitTeam({
        ...base,
        teamName: "Pitch FC",
        competitionPublicId: "cmp_edn_football_s1",
      }),
    ).toMatchObject({ status: "in_league" });
    expect((await listTeams({ sport: "volleyball" })).map((row) => row.city)).toEqual([
      "manchester",
      "manchester",
    ]);
  });

  it("offers only the cities that run the chosen sport", async () => {
    const open = [
      {
        id: 1,
        publicId: "a",
        name: "",
        city: "edinburgh",
        sport: "football",
        season: "one",
        leagueCap: 5,
        paymentMode: "open" as const,
        listed: true,
      },
      {
        id: 2,
        publicId: "b",
        name: "",
        city: "manchester",
        sport: "volleyball",
        season: "one",
        leagueCap: 5,
        paymentMode: "open" as const,
        listed: true,
      },
    ];
    expect(sportsOf(open)).toEqual(["football", "volleyball"]);
    expect(citiesForSport(open, "volleyball")).toEqual(["manchester"]);
    expect(citiesForSport(open, "football")).toEqual(["edinburgh"]);
  });
});
