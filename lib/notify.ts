import { getMailer, organizerMailbox } from "@/lib/mail";
import { submitTeam, type SubmitResult, type TeamInput, type TeamStatus } from "@/lib/registration";

export type NotifyPayload = {
  teamName: string;
  company: string;
  friendsOrMixed: boolean;
  captainEmail: string;
  playerNames: string[];
  status: TeamStatus;
};

export function organizerNotice(payload: NotifyPayload) {
  const place =
    payload.status === "in_league" ? "in the league" : "on the waitlist";
  const company = payload.company
    ? payload.company
    : payload.friendsOrMixed
      ? "friends / mixed"
      : "none given";
  return {
    to: organizerMailbox(),
    subject: `PlayVejora: ${payload.teamName} is ${place}`,
    text: [
      `${payload.teamName} has registered and is ${place}.`,
      `Captain: ${payload.captainEmail}`,
      `Company: ${company}`,
      `Players: ${payload.playerNames.join(", ")}`,
      "Open /admin to review the full list.",
    ].join("\n"),
  };
}

export async function notifyTeamSubmitted(payload: NotifyPayload): Promise<void> {
  try {
    const mailer = await getMailer();
    await mailer.send(organizerNotice(payload));
  } catch {
    // The row is already stored. A down mailbox must not look like a failed signup.
  }
}

export async function submitTeamAndNotify(input: TeamInput): Promise<SubmitResult> {
  const result = await submitTeam(input);
  if (result.ok) {
    await notifyTeamSubmitted({
      teamName: input.teamName.trim(),
      company: input.company.trim(),
      friendsOrMixed: input.friendsOrMixed,
      captainEmail: input.captainEmail.trim(),
      playerNames: input.playerNames.map((name) => name.trim()).filter(Boolean),
      status: result.status,
    });
  }
  return result;
}
