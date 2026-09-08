import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeDb, listTeams, submitTeam } from "./registration";

describe("submitTeam", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "playvejora-"));
    process.env.PLAYVEJORA_DB_PATH = path.join(dir, "test.sqlite");
  });

  afterEach(() => {
    closeDb();
    delete process.env.PLAYVEJORA_DB_PATH;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("marks the fifth complete Edinburgh team in-league and the sixth waitlist", () => {
    const base = {
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    };
    for (let i = 1; i <= 4; i += 1) {
      const result = submitTeam({ ...base, teamName: `Team ${i}` });
      expect(result).toEqual({ ok: true, status: "in_league" });
    }
    expect(submitTeam({ ...base, teamName: "Team 5" })).toEqual({
      ok: true,
      status: "in_league",
    });
    expect(submitTeam({ ...base, teamName: "Team 6" })).toEqual({
      ok: true,
      status: "waitlist",
    });
    expect(listTeams().map((row) => row.status)).toEqual([
      "in_league",
      "in_league",
      "in_league",
      "in_league",
      "in_league",
      "waitlist",
    ]);
  });

  it("allows a friends side with no company name", () => {
    const result = submitTeam({
      teamName: "Sunday Kickabout",
      company: "",
      friendsOrMixed: true,
      captainEmail: "friends@example.com",
      playerNames: ["Sam"],
      waiverAccepted: true,
    });
    expect(result).toEqual({ ok: true, status: "in_league" });
    expect(listTeams()[0].company).toBe("");
    expect(listTeams()[0].friendsOrMixed).toBe(true);
  });

  it("does not insert when the waiver is not accepted", () => {
    const result = submitTeam({
      teamName: "No Waiver FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: false,
    });
    expect(result.ok).toBe(false);
    expect(listTeams()).toEqual([]);
  });

  it("does not insert an invalid email", () => {
    const result = submitTeam({
      teamName: "Bad Email FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "not-an-email",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });
    expect(result.ok).toBe(false);
    expect(listTeams()).toEqual([]);
  });
});
