import { confirmAdminPassword, isValidSession } from "@/lib/admin-auth";
import {
  createCompetition,
  deleteCompetition,
  setCompetitionListed,
  type CompetitionInput,
  type CompetitionResult,
  type DeleteCompetitionResult,
} from "@/lib/competitions";
import {
  deleteMatch,
  recordFootballMatch,
  recordVolleyballMatch,
  type FootballMatchInput,
  type VolleyballMatchInput,
} from "@/lib/matches";
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

export async function createCompetitionForAdmin(
  token: string | undefined,
  input: CompetitionInput,
): Promise<CompetitionResult | { ok: false; error: "session" }> {
  if (!(await isValidSession(token))) {
    return { ok: false, error: "session" };
  }
  return createCompetition(input);
}

export async function setCompetitionListedForAdmin(
  token: string | undefined,
  publicId: string,
  listed: boolean,
): Promise<boolean> {
  if (!(await isValidSession(token))) {
    return false;
  }
  return setCompetitionListed(publicId, listed);
}

export async function deleteCompetitionForAdmin(
  token: string | undefined,
  publicId: string,
): Promise<DeleteCompetitionResult | { ok: false; error: "session" }> {
  if (!(await isValidSession(token))) {
    return { ok: false, error: "session" };
  }
  return deleteCompetition(publicId);
}

export async function recordFootballMatchForAdmin(
  token: string | undefined,
  input: FootballMatchInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isValidSession(token))) {
    return { ok: false, error: "session" };
  }
  return recordFootballMatch(input);
}

export async function recordVolleyballMatchForAdmin(
  token: string | undefined,
  input: VolleyballMatchInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isValidSession(token))) {
    return { ok: false, error: "session" };
  }
  return recordVolleyballMatch(input);
}

export async function deleteMatchForAdmin(
  token: string | undefined,
  id: number,
): Promise<boolean> {
  if (!(await isValidSession(token))) {
    return false;
  }
  return deleteMatch(id);
}
