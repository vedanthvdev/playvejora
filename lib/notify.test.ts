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
    expect(result).toMatchObject({ ok: true, status: "in_league" });
    expect(sent).toHaveLength(2);
    const toOrganizers = sent.find((message) => message.to === "playvejora@gmail.com");
    const toCaptain = sent.find((message) => message.to === "cap@example.com");
    expect(toOrganizers?.subject).toMatch(/Pitch FC/);
    expect(toOrganizers?.subject).toMatch(/in the league/i);
    expect(toOrganizers?.text).toMatch(/cap@example.com/);
    expect(toOrganizers?.text).toMatch(/Alex, Sam/);
    expect(toOrganizers?.text).toMatch(/Acme/);
    expect(toOrganizers?.text).toMatch(/tm_[0-9a-f]{16}/);
    expect(toCaptain?.subject).toMatch(/Pitch FC/);
    expect(toCaptain?.text).toMatch(/Thanks for registering/);
    expect(toCaptain?.text).toMatch(/reference is tm_/);
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
      publicId: "tm_waitlist0000001",
    });
    expect(sent[0].subject).toMatch(/waitlist/i);
    expect(sent[0].text).toMatch(/friends \/ mixed/i);
    expect(sent[1].to).toBe("late@example.com");
    expect(sent[1].text).toMatch(/tm_waitlist0000001/);
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
        publicId: "tm_waitlist0000001",
      }),
    ).resolves.toBeUndefined();
  });
});
