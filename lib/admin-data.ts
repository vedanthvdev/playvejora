import { isValidSession } from "@/lib/admin-auth";
import { listTeams, type TeamRecord } from "@/lib/registration";

export async function teamsForAdmin(
  token: string | undefined,
): Promise<TeamRecord[] | null> {
  if (!isValidSession(token)) {
    return null;
  }
  return listTeams();
}
