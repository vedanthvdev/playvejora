import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDatabase } from "@/lib/db";
import { createTestDatabase } from "@/lib/test-db";
import { useMailer, type MailMessage } from "@/lib/mail";
import { notifyTeamSubmitted, submitTeamAndNotify } from "@/lib/notify";

describe("organizer notify on submit", () => {
  let db: ReturnType<typeof createTestDatabase>;
  const sent: MailMessage[] = [];

  beforeEach(() => {
    db = createTestDatabase();
    useDatabase(db);
    sent.length = 0;
    useMailer({
      send: async (message) => {
        sent.push(message);
      },
    });
  });

  afterEach(() => {
    useDatabase(null);
    useMailer(null);
    db.close();
  });

  it("emails organizers after a complete registration with the place they got", async () => {
    const result = await submitTeamAndNotify({
      teamName: "Pitch FC",
      company: "Acme",
      friendsOrMixed: false,
      captainEmail: "cap@example.com",
      playerNames: ["Alex", "Sam"],
      waiverAccepted: true,
    });
    expect(result).toEqual({ ok: true, status: "in_league" });
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("playvejora@gmail.com");
    expect(sent[0].subject).toMatch(/Pitch FC/);
    expect(sent[0].subject).toMatch(/in the league/i);
    expect(sent[0].text).toMatch(/cap@example.com/);
    expect(sent[0].text).toMatch(/Alex, Sam/);
    expect(sent[0].text).toMatch(/Acme/);
  });

  it("does not email when the registration is rejected", async () => {
    expect(
      await submitTeamAndNotify({
        teamName: "Skip FC",
        company: "Acme",
        friendsOrMixed: false,
        captainEmail: "not-an-email",
        playerNames: ["Alex"],
        waiverAccepted: true,
      }),
    ).toEqual({
      ok: false,
      error: "A valid captain email is required.",
    });
    expect(sent).toEqual([]);
  });

  it("says waitlist when the league places are gone", async () => {
    await notifyTeamSubmitted({
      teamName: "Late FC",
      company: "",
      friendsOrMixed: true,
      captainEmail: "late@example.com",
      playerNames: ["Alex"],
      status: "waitlist",
    });
    expect(sent[0].subject).toMatch(/waitlist/i);
    expect(sent[0].text).toMatch(/friends \/ mixed/i);
  });

  it("does not fail the notify path when the mailer throws", async () => {
    useMailer({
      send: async () => {
        throw new Error("mailbox down");
      },
    });
    await expect(
      notifyTeamSubmitted({
        teamName: "Pitch FC",
        company: "",
        friendsOrMixed: true,
        captainEmail: "cap@example.com",
        playerNames: ["Alex"],
        status: "waitlist",
      }),
    ).resolves.toBeUndefined();
  });
});
