import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDatabase } from "./db";
import { createTestDatabase } from "./test-db";
import { listTeams, submitTeam } from "./registration";

describe("submitTeam", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    useDatabase(db);
  });

  afterEach(() => {
    useDatabase(null);
    db.close();
  });

  it("marks the fifth complete Edinburgh team in-league and the sixth waitlist", async () => {
    const base = {
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    };
    for (let i = 1; i <= 4; i += 1) {
      const result = await submitTeam({ ...base, teamName: `Team ${i}` });
      expect(result).toEqual({ ok: true, status: "in_league" });
    }
    expect(await submitTeam({ ...base, teamName: "Team 5" })).toEqual({
      ok: true,
      status: "in_league",
    });
    expect(await submitTeam({ ...base, teamName: "Team 6" })).toEqual({
      ok: true,
      status: "waitlist",
    });
    const teams = await listTeams();
    expect(teams.map((row) => row.status)).toEqual([
      "in_league",
      "in_league",
      "in_league",
      "in_league",
      "in_league",
      "waitlist",
    ]);
  });

  it("allows a friends side with no company name", async () => {
    const result = await submitTeam({
      teamName: "Sunday Kickabout",
      company: "",
      friendsOrMixed: true,
      captainEmail: "friends@example.com",
      playerNames: ["Sam"],
      waiverAccepted: true,
    });
    expect(result).toEqual({ ok: true, status: "in_league" });
    const teams = await listTeams();
    expect(teams[0].company).toBe("");
    expect(teams[0].friendsOrMixed).toBe(true);
    expect(teams[0].playerNames).toEqual(["Sam"]);
  });

  it("does not insert when the waiver is not accepted", async () => {
    const result = await submitTeam({
      teamName: "No Waiver FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: false,
    });
    expect(result.ok).toBe(false);
    expect(await listTeams()).toEqual([]);
  });

  it("does not insert an invalid email", async () => {
    const result = await submitTeam({
      teamName: "Bad Email FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "not-an-email",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });
    expect(result.ok).toBe(false);
    expect(await listTeams()).toEqual([]);
  });
});
