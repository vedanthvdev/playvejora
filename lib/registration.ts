import { getDatabase } from "@/lib/db";

export type TeamStatus = "in_league" | "waitlist";

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
  teamName: string;
  company: string;
  friendsOrMixed: boolean;
  captainEmail: string;
  playerNames: string[];
  waiverAcceptedAt: string;
  status: TeamStatus;
  city: string;
  createdAt: string;
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
  | { ok: true; status: TeamStatus }
  | { ok: false; error: string };

type TeamRow = {
  id: number;
  team_name: string;
  company: string;
  friends_or_mixed: number;
  captain_email: string;
  player_names: string;
  waiver_accepted_at: string;
  status: TeamStatus;
  city: string;
  created_at: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CITY = "edinburgh";
const LEAGUE_CAP = 5;

// The league place is decided inside the insert because D1 has no interactive
// transactions, and a read-then-write would let two captains take the last place.
const INSERT_TEAM = `
  INSERT INTO teams (
    team_name, company, friends_or_mixed, captain_email, player_names,
    waiver_accepted_at, status, city, created_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    CASE
      WHEN (SELECT COUNT(*) FROM teams WHERE city = ? AND status = 'in_league') < ?
      THEN 'in_league'
      ELSE 'waitlist'
    END,
    ?, ?
  )
  RETURNING status
`;

function mapRow(row: TeamRow): TeamRecord {
  return {
    id: row.id,
    teamName: row.team_name,
    company: row.company,
    friendsOrMixed: Boolean(row.friends_or_mixed),
    captainEmail: row.captain_email,
    playerNames: JSON.parse(row.player_names) as string[],
    waiverAcceptedAt: row.waiver_accepted_at,
    status: row.status,
    city: row.city,
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

  const db = await getDatabase();
  const now = new Date().toISOString();
  const row = await db
    .prepare(INSERT_TEAM)
    .bind(
      fields.teamName,
      fields.company,
      input.friendsOrMixed ? 1 : 0,
      fields.email,
      JSON.stringify(fields.players),
      now,
      CITY,
      LEAGUE_CAP,
      CITY,
      now,
    )
    .first<{ status: TeamStatus }>();

  if (!row) {
    return { ok: false, error: "The registration could not be saved. Try again." };
  }
  return { ok: true, status: row.status };
}

export async function listTeams(): Promise<TeamRecord[]> {
  const db = await getDatabase();
  const { results } = await db
    .prepare(`SELECT * FROM teams ORDER BY created_at ASC, id ASC`)
    .all<TeamRow>();
  return results.map(mapRow);
}

export async function getTeam(id: number): Promise<TeamRecord | null> {
  const db = await getDatabase();
  const row = await db
    .prepare(`SELECT * FROM teams WHERE id = ?`)
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
