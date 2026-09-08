import { getMailer, organizerMailbox } from "@/lib/mail";
import { site } from "@/lib/site-copy";
import { submitTeam, type SubmitResult, type TeamInput, type TeamStatus } from "@/lib/registration";

export type NotifyPayload = {
  teamName: string;
  company: string;
  friendsOrMixed: boolean;
  captainEmail: string;
  playerNames: string[];
  status: TeamStatus;
  publicId: string;
};

function placeLabel(status: TeamStatus): string {
  return status === "in_league" ? "in the league" : "on the waitlist";
}

export function organizerNotice(payload: NotifyPayload) {
  const company = payload.company
    ? payload.company
    : payload.friendsOrMixed
      ? "friends / mixed"
      : "none given";
  const place = placeLabel(payload.status);
  return {
    to: organizerMailbox(),
    subject: `PlayVejora: ${payload.teamName} is ${place}`,
    text: [
      `${payload.teamName} (${payload.publicId}) has registered and is ${place}.`,
      `Captain: ${payload.captainEmail}`,
      `Company: ${company}`,
      `Players: ${payload.playerNames.join(", ")}`,
      "Open /admin to review the full list.",
    ].join("\n"),
  };
}

export function captainNotice(payload: NotifyPayload) {
  const place = placeLabel(payload.status);
  const next =
    payload.status === "in_league"
      ? "We will email you the venue, the format, and your fixtures."
      : "The five league places are taken for now. We will email you if a place frees up.";
  return {
    to: payload.captainEmail,
    subject: `PlayVejora: ${payload.teamName} is ${place}`,
    text: [
      `Thanks for registering ${payload.teamName} with PlayVejora.`,
      `Your reference is ${payload.publicId}. You are ${place}.`,
      next,
      `Anything to ask? Email ${site.email}.`,
    ].join("\n"),
  };
}

export async function notifyTeamSubmitted(payload: NotifyPayload): Promise<void> {
  const mailer = await getMailer();
  for (const message of [organizerNotice(payload), captainNotice(payload)]) {
    try {
      await mailer.send(message);
    } catch {
      // The row is already stored. A down mailbox must not look like a failed signup.
    }
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
      publicId: result.publicId,
    });
  }
  return result;
}
