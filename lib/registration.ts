import { liveCompetition } from "@/lib/competitions";
import { getDatabase } from "@/lib/db";
import { newPublicId } from "@/lib/ids";

export type TeamStatus = "in_league" | "waitlist";
export type PaymentStatus = "not_required" | "pending" | "paid" | "failed";

export type TeamInput = {
  teamName: string;
  company: string;
  friendsOrMixed: boolean;
  captainEmail: string;
  playerNames: string[];
  waiverAccepted: boolean;
};

export type TeamRecord = {
  id: number;
  publicId: string;
  teamName: string;
  company: string;
  friendsOrMixed: boolean;
  captainEmail: string;
  playerNames: string[];
  waiverAcceptedAt: string;
  status: TeamStatus;
  city: string;
  sport: string;
  season: string;
  competitionId: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type TeamListFilter = {
  city?: string;
  sport?: string;
  status?: TeamStatus | "";
};

export type TeamUpdate = {
  teamName: string;
  company: string;
  friendsOrMixed: boolean;
  captainEmail: string;
  playerNames: string[];
  status: TeamStatus;
};

export type UpdateResult = { ok: true } | { ok: false; error: string };

export type SubmitResult =
  | { ok: true; status: TeamStatus; publicId: string }
  | { ok: false; error: string };

type TeamRow = {
  id: number;
  public_id: string;
  team_name: string;
  company: string;
  friends_or_mixed: number;
  captain_email: string;
  player_names: string;
  waiver_accepted_at: string;
  status: TeamStatus;
  city: string;
  sport: string;
  season: string;
  competition_id: number;
  payment_status: PaymentStatus;
  created_at: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TEAM_SELECT = `
  SELECT
    teams.*,
    competitions.sport AS sport,
    competitions.season AS season
  FROM teams
  INNER JOIN competitions ON competitions.id = teams.competition_id
`;

// The league place is decided inside the insert because D1 has no interactive
// transactions, and a read-then-write would let two captains take the last place.
const INSERT_TEAM = `
  INSERT INTO teams (
    team_name, company, friends_or_mixed, captain_email, player_names,
    waiver_accepted_at, status, city, created_at, public_id, competition_id,
    payment_status
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    CASE
      WHEN (SELECT COUNT(*) FROM teams WHERE competition_id = ? AND status = 'in_league') < ?
      THEN 'in_league'
      ELSE 'waitlist'
    END,
    ?, ?, ?, ?, 'not_required'
  )
  RETURNING status, public_id
`;

function mapRow(row: TeamRow): TeamRecord {
  return {
    id: row.id,
    publicId: row.public_id,
    teamName: row.team_name,
    company: row.company,
    friendsOrMixed: Boolean(row.friends_or_mixed),
    captainEmail: row.captain_email,
    playerNames: JSON.parse(row.player_names) as string[],
    waiverAcceptedAt: row.waiver_accepted_at,
    status: row.status,
    city: row.city,
    sport: row.sport,
    season: row.season,
    competitionId: row.competition_id,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  };
}

function parsedFields(
  input: Pick<
    TeamInput,
    "teamName" | "company" | "captainEmail" | "playerNames"
  >,
):
  | { ok: true; teamName: string; company: string; email: string; players: string[] }
  | { ok: false; error: string } {
  const teamName = input.teamName.trim();
  const company = input.company.trim();
  const players = input.playerNames.map((name) => name.trim()).filter(Boolean);
  const email = input.captainEmail.trim();

  if (!teamName) {
    return { ok: false, error: "Team name is required." };
  }
  if (!EMAIL.test(email)) {
    return { ok: false, error: "A valid captain email is required." };
  }
  if (players.length < 1) {
    return { ok: false, error: "Add at least one player name." };
  }
  return { ok: true, teamName, company, email, players };
}

export async function submitTeam(input: TeamInput): Promise<SubmitResult> {
  const fields = parsedFields(input);
  if (!fields.ok) {
    return fields;
  }
  if (!input.waiverAccepted) {
    return { ok: false, error: "The captain must accept the waiver for the team." };
  }

  const competition = await liveCompetition();
  const db = await getDatabase();
  const now = new Date().toISOString();
  const publicId = newPublicId("tm");
  const row = await db
    .prepare(INSERT_TEAM)
    .bind(
      fields.teamName,
      fields.company,
      input.friendsOrMixed ? 1 : 0,
      fields.email,
      JSON.stringify(fields.players),
      now,
      competition.id,
      competition.leagueCap,
      competition.city,
      now,
      publicId,
      competition.id,
    )
    .first<{ status: TeamStatus; public_id: string }>();

  if (!row) {
    return { ok: false, error: "The registration could not be saved. Try again." };
  }
  return { ok: true, status: row.status, publicId: row.public_id };
}

export async function listTeams(filter: TeamListFilter = {}): Promise<TeamRecord[]> {
  const db = await getDatabase();
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (filter.city) {
    clauses.push("competitions.city = ?");
    values.push(filter.city);
  }
  if (filter.sport) {
    clauses.push("competitions.sport = ?");
    values.push(filter.sport);
  }
  if (filter.status === "in_league" || filter.status === "waitlist") {
    clauses.push("teams.status = ?");
    values.push(filter.status);
  }
  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const { results } = await db
    .prepare(
      `${TEAM_SELECT}${where} ORDER BY teams.created_at ASC, teams.id ASC`,
    )
    .bind(...values)
    .all<TeamRow>();
  return results.map(mapRow);
}

export async function getTeam(id: number): Promise<TeamRecord | null> {
  const db = await getDatabase();
  const row = await db
    .prepare(`${TEAM_SELECT} WHERE teams.id = ?`)
    .bind(id)
    .first<TeamRow>();
  return row ? mapRow(row) : null;
}

export async function updateTeam(
  id: number,
  input: TeamUpdate,
): Promise<UpdateResult> {
  const fields = parsedFields(input);
  if (!fields.ok) {
    return fields;
  }
  if (input.status !== "in_league" && input.status !== "waitlist") {
    return { ok: false, error: "Status must be in league or waitlist." };
  }
  if (!(await getTeam(id))) {
    return { ok: false, error: "That team is not on the list." };
  }

  const db = await getDatabase();
  await db
    .prepare(
      `UPDATE teams SET team_name = ?, company = ?, friends_or_mixed = ?, captain_email = ?, player_names = ?, status = ? WHERE id = ?`,
    )
    .bind(
      fields.teamName,
      fields.company,
      input.friendsOrMixed ? 1 : 0,
      fields.email,
      JSON.stringify(fields.players),
      input.status,
      id,
    )
    .run();
  return { ok: true };
}

export async function deleteTeam(id: number): Promise<boolean> {
  if (!(await getTeam(id))) {
    return false;
  }
  const db = await getDatabase();
  await db.prepare(`DELETE FROM teams WHERE id = ?`).bind(id).run();
  return true;
}
