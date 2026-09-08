import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDatabase } from "./db";
import { createTestDatabase } from "./test-db";
import { deleteTeam, getTeam, listTeams, submitTeam, updateTeam } from "./registration";

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

  it("lets an organizer change contact details and waitlist status", async () => {
    await submitTeam({
      teamName: "Pitch FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });
    const [team] = await listTeams();
    const result = await updateTeam(team.id, {
      teamName: "Pitch United",
      company: "",
      friendsOrMixed: true,
      captainEmail: "new@example.com",
      playerNames: ["Alex", "Sam"],
      status: "waitlist",
    });
    expect(result).toEqual({ ok: true });
    const updated = await getTeam(team.id);
    expect(updated?.teamName).toBe("Pitch United");
    expect(updated?.company).toBe("");
    expect(updated?.friendsOrMixed).toBe(true);
    expect(updated?.captainEmail).toBe("new@example.com");
    expect(updated?.playerNames).toEqual(["Alex", "Sam"]);
    expect(updated?.status).toBe("waitlist");
    expect(updated?.waiverAcceptedAt).toBe(team.waiverAcceptedAt);
  });

  it("does not update an invalid email or empty player list", async () => {
    await submitTeam({
      teamName: "Pitch FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });
    const [team] = await listTeams();
    expect(
      await updateTeam(team.id, {
        teamName: "Pitch FC",
        company: "Acme",
        friendsOrMixed: false,
        captainEmail: "not-an-email",
        playerNames: ["Alex"],
        status: "in_league",
      }),
    ).toEqual({ ok: false, error: "A valid captain email is required." });
    expect(
      await updateTeam(team.id, {
        teamName: "Pitch FC",
        company: "Acme",
        friendsOrMixed: false,
        captainEmail: "cap@example.com",
        playerNames: ["  "],
        status: "in_league",
      }),
    ).toEqual({ ok: false, error: "Add at least one player name." });
    expect((await getTeam(team.id))?.captainEmail).toBe("cap@example.com");
  });

  it("removes a registration without promoting the waitlist", async () => {
    const base = {
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    };
    for (let i = 1; i <= 6; i += 1) {
      await submitTeam({ ...base, teamName: `Team ${i}` });
    }
    const teams = await listTeams();
    expect(await deleteTeam(teams[0].id)).toBe(true);
    expect(await getTeam(teams[0].id)).toBeNull();
    expect((await listTeams()).map((row) => row.teamName)).toEqual([
      "Team 2",
      "Team 3",
      "Team 4",
      "Team 5",
      "Team 6",
    ]);
    expect((await listTeams()).map((row) => row.status)).toEqual([
      "in_league",
      "in_league",
      "in_league",
      "in_league",
      "waitlist",
    ]);
  });

  it("returns false when deleting a team that is not there", async () => {
    expect(await deleteTeam(99)).toBe(false);
  });
});
