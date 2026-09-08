import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PRE_LAUNCH_PASSWORD,
  isValidSession,
  passwordMatches,
  sessionToken,
} from "@/lib/admin-auth";
import { teamsForAdmin } from "@/lib/admin-data";
import { useDatabase } from "@/lib/db";
import { createTestDatabase } from "@/lib/test-db";
import { submitTeam } from "@/lib/registration";

describe("admin gate", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    useDatabase(db);
    process.env.ADMIN_PASSWORD = "secret-pass";
  });

  afterEach(() => {
    useDatabase(null);
    db.close();
    delete process.env.ADMIN_PASSWORD;
  });

  it("lists fifth and sixth teams with in-league then waitlist after a valid session", async () => {
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
    const teams = await teamsForAdmin(sessionToken());
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

  it("rejects the wrong password and hides teams without a session", async () => {
    await submitTeam({
      teamName: "Hidden FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "hidden@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });
    expect(passwordMatches("nope")).toBe(false);
    expect(isValidSession("forged")).toBe(false);
    expect(await teamsForAdmin(undefined)).toBeNull();
    expect(await teamsForAdmin("forged")).toBeNull();
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
