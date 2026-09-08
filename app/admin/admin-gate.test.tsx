import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PRE_LAUNCH_PASSWORD,
  attemptAdminLogin,
  createAdminSession,
  endAdminSession,
  isValidSession,
  passwordMatches,
} from "@/lib/admin-auth";
import { deleteTeamForAdmin, teamsForAdmin } from "@/lib/admin-data";
import { useDatabase } from "@/lib/db";
import { ADMIN_LOGIN_POLICY } from "@/lib/rate-limit";
import { createTestDatabase } from "@/lib/test-db";
import { getTeam, submitTeam } from "@/lib/registration";

const HOUR = 60 * 60 * 1000;

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
    const teams = await teamsForAdmin(await createAdminSession());
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
    expect(await isValidSession("forged")).toBe(false);
    expect(await teamsForAdmin(undefined)).toBeNull();
    expect(await teamsForAdmin("forged")).toBeNull();
  });

  it("stops honouring a session once it expires", async () => {
    const issued = Date.now();
    const token = await createAdminSession(issued);
    expect(await isValidSession(token, issued + HOUR)).toBe(true);
    expect(await isValidSession(token, issued + 13 * HOUR)).toBe(false);
  });

  it("ends a session on logout so the cookie is no longer enough", async () => {
    const token = await createAdminSession();
    expect(await isValidSession(token)).toBe(true);
    await endAdminSession(token);
    expect(await isValidSession(token)).toBe(false);
    expect(await teamsForAdmin(token)).toBeNull();
  });

  it("issues one session per login so ending one leaves the other alone", async () => {
    const first = await attemptAdminLogin("secret-pass", "203.0.113.5");
    const second = await attemptAdminLogin("secret-pass", "203.0.113.6");
    if (!first.ok || !second.ok) {
      throw new Error("both logins should succeed");
    }
    expect(first.token).not.toBe(second.token);

    await endAdminSession(first.token);
    expect(await isValidSession(first.token)).toBe(false);
    expect(await isValidSession(second.token)).toBe(true);
  });

  it("deletes a team only when the organizer re-enters the password", async () => {
    await submitTeam({
      teamName: "Hidden FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "hidden@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });
    const token = await createAdminSession();
    const [team] = (await teamsForAdmin(token))!;

    expect(
      await deleteTeamForAdmin(token, team.id, "wrong", "203.0.113.5"),
    ).toEqual({ ok: false, reason: "password" });
    expect((await teamsForAdmin(token))?.map((row) => row.teamName)).toEqual([
      "Hidden FC",
    ]);
    expect(await isValidSession(token)).toBe(true);

    expect(
      await deleteTeamForAdmin(token, team.id, "secret-pass", "203.0.113.5"),
    ).toEqual({ ok: true });
    expect(await teamsForAdmin(token)).toEqual([]);
    expect(await isValidSession(token)).toBe(true);
  });

  it("does not delete without a session even if the password is right", async () => {
    await submitTeam({
      teamName: "Hidden FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "hidden@example.com",
      playerNames: ["Alex"],
      waiverAccepted: true,
    });
    const [team] = (await teamsForAdmin(await createAdminSession()))!;
    expect(
      await deleteTeamForAdmin(undefined, team.id, "secret-pass", "203.0.113.5"),
    ).toEqual({ ok: false, reason: "session" });
    expect(await getTeam(team.id)).not.toBeNull();
  });
});

describe("admin login attempts", () => {
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

  it("stops guessing from one address after the policy limit", async () => {
    for (let attempt = 1; attempt <= ADMIN_LOGIN_POLICY.limit; attempt += 1) {
      const result = await attemptAdminLogin("wrong", "203.0.113.5");
      expect(result).toEqual({ ok: false, reason: "password" });
    }

    const blocked = await attemptAdminLogin("wrong", "203.0.113.5");
    expect(blocked.ok).toBe(false);
    expect(blocked.ok === false && blocked.reason).toBe("rate_limited");

    const rightPasswordStillBlocked = await attemptAdminLogin(
      "secret-pass",
      "203.0.113.5",
    );
    expect(rightPasswordStillBlocked.ok).toBe(false);

    const otherOrganizer = await attemptAdminLogin("secret-pass", "203.0.113.6");
    expect(otherOrganizer.ok).toBe(true);
  });

  it("forgets earlier attempts once an organizer gets in", async () => {
    for (let attempt = 1; attempt < ADMIN_LOGIN_POLICY.limit; attempt += 1) {
      await attemptAdminLogin("wrong", "203.0.113.5");
    }
    expect((await attemptAdminLogin("secret-pass", "203.0.113.5")).ok).toBe(true);
    expect((await attemptAdminLogin("wrong", "203.0.113.5")).ok).toBe(false);
    expect(
      (await attemptAdminLogin("secret-pass", "203.0.113.5")).ok,
    ).toBe(true);
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
