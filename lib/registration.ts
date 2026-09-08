import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

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

export type SubmitResult =
  | { ok: true; status: TeamStatus }
  | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CITY = "edinburgh";
const LEAGUE_CAP = 5;

let connection: Database.Database | null = null;
let connectionPath: string | null = null;

export function dbFilePath(): string {
  return process.env.PLAYVEJORA_DB_PATH ?? path.join(process.cwd(), "data", "playvejora.sqlite");
}

export function closeDb(): void {
  connection?.close();
  connection = null;
  connectionPath = null;
}

function getDb(): Database.Database {
  const file = dbFilePath();
  if (connection && connectionPath === file) {
    return connection;
  }
  closeDb();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  connection = new Database(file);
  connectionPath = file;
  connection.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_name TEXT NOT NULL,
      company TEXT NOT NULL,
      friends_or_mixed INTEGER NOT NULL,
      captain_email TEXT NOT NULL,
      player_names TEXT NOT NULL,
      waiver_accepted_at TEXT NOT NULL,
      status TEXT NOT NULL,
      city TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  return connection;
}

function mapRow(row: {
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
}): TeamRecord {
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

export function submitTeam(input: TeamInput): SubmitResult {
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
  if (!input.waiverAccepted) {
    return { ok: false, error: "The captain must accept the waiver for the team." };
  }

  const db = getDb();
  const assign = db.transaction(() => {
    const count = db
      .prepare(
        `SELECT COUNT(*) AS n FROM teams WHERE city = ? AND status = 'in_league'`,
      )
      .get(CITY) as { n: number };
    const status: TeamStatus = count.n < LEAGUE_CAP ? "in_league" : "waitlist";
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO teams (
        team_name, company, friends_or_mixed, captain_email, player_names,
        waiver_accepted_at, status, city, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      teamName,
      company,
      input.friendsOrMixed ? 1 : 0,
      email,
      JSON.stringify(players),
      now,
      status,
      CITY,
      now,
    );
    return status;
  });

  return { ok: true, status: assign() };
}

export function listTeams(): TeamRecord[] {
  const rows = getDb()
    .prepare(`SELECT * FROM teams ORDER BY created_at ASC, id ASC`)
    .all() as Parameters<typeof mapRow>[0][];
  return rows.map(mapRow);
}
