import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PRE_LAUNCH_PASSWORD,
  isValidSession,
  passwordMatches,
  sessionToken,
} from "@/lib/admin-auth";
import { teamsForAdmin } from "@/lib/admin-data";
import { closeDb, submitTeam } from "@/lib/registration";

describe("admin gate", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "playvejora-admin-"));
    process.env.PLAYVEJORA_DB_PATH = path.join(dir, "test.sqlite");
    process.env.ADMIN_PASSWORD = "secret-pass";
  });

  afterEach(() => {
    closeDb();
    delete process.env.PLAYVEJORA_DB_PATH;
    delete process.env.ADMIN_PASSWORD;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("lists fifth and sixth teams with in-league then waitlist after a valid session", () => {
    const base = {
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    };
    for (let i = 1; i <= 6; i += 1) {
      submitTeam({ ...base, teamName: `Team ${i}` });
    }
    const teams = teamsForAdmin(sessionToken());
    expect(teams).not.toBeNull();
    expect(teams!.map((row) => row.status)).toEqual([
      "in_league",
      "in_league",
      "in_league",
      "in_league",
      "in_league",
      "waitlist",
    ]);
    expect(teams![0].captainEmail).toBe("cap@example.com");
  });

  it("rejects the wrong password and hides teams without a session", () => {
    submitTeam({
      teamName: "Hidden FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "hidden@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });
    expect(passwordMatches("nope")).toBe(false);
    expect(isValidSession("forged")).toBe(false);
    expect(teamsForAdmin(undefined)).toBeNull();
    expect(teamsForAdmin("forged")).toBeNull();
  });
});

describe("pre-launch password", () => {
  afterEach(() => {
    delete process.env.ADMIN_PASSWORD;
  });

  it("accepts the shipped default until ADMIN_PASSWORD is set", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(passwordMatches(PRE_LAUNCH_PASSWORD)).toBe(true);

    process.env.ADMIN_PASSWORD = "organizer-only";
    expect(passwordMatches(PRE_LAUNCH_PASSWORD)).toBe(false);
    expect(passwordMatches("organizer-only")).toBe(true);
  });
});
