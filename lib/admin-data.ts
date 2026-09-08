import { confirmAdminPassword, isValidSession } from "@/lib/admin-auth";
import {
  deleteTeam,
  getTeam,
  listTeams,
  updateTeam,
  type TeamListFilter,
  type TeamRecord,
  type TeamUpdate,
  type UpdateResult,
} from "@/lib/registration";

export type AdminDeleteResult =
  | { ok: true }
  | { ok: false; reason: "session" | "password" | "rate_limited" | "missing" };

export async function teamsForAdmin(
  token: string | undefined,
  filter: TeamListFilter = {},
): Promise<TeamRecord[] | null> {
  if (!(await isValidSession(token))) {
    return null;
  }
  return listTeams(filter);
}

export async function teamForAdmin(
  token: string | undefined,
  id: number,
): Promise<{ ok: true; team: TeamRecord } | { ok: false; reason: "session" | "missing" }> {
  if (!(await isValidSession(token))) {
    return { ok: false, reason: "session" };
  }
  const team = await getTeam(id);
  if (!team) {
    return { ok: false, reason: "missing" };
  }
  return { ok: true, team };
}

export async function updateTeamForAdmin(
  token: string | undefined,
  id: number,
  input: TeamUpdate,
): Promise<UpdateResult | { ok: false; error: "session" }> {
  if (!(await isValidSession(token))) {
    return { ok: false, error: "session" };
  }
  return updateTeam(id, input);
}

export async function deleteTeamForAdmin(
  token: string | undefined,
  id: number,
  password: string,
  ip: string,
): Promise<AdminDeleteResult> {
  if (!(await isValidSession(token))) {
    return { ok: false, reason: "session" };
  }
  const check = await confirmAdminPassword(password, ip);
  if (!check.ok) {
    return check;
  }
  if (!(await deleteTeam(id))) {
    return { ok: false, reason: "missing" };
  }
  return { ok: true };
}
