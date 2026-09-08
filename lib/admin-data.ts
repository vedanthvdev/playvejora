import { isValidSession } from "@/lib/admin-auth";
import { listTeams, type TeamRecord } from "@/lib/registration";

export function teamsForAdmin(token: string | undefined): TeamRecord[] | null {
  if (!isValidSession(token)) {
    return null;
  }
  return listTeams();
}
