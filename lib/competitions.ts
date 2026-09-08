import { catalogueLabel, parseCatalogue } from "@/lib/catalogue";
import { getDatabase } from "@/lib/db";
import { newPublicId } from "@/lib/ids";

export const DEFAULT_COMPETITION_PUBLIC_ID = "cmp_edn_football_s1";

export type PaymentMode = "open" | "league_paid_waitlist_free";

export type Competition = {
  id: number;
  publicId: string;
  name: string;
  city: string;
  sport: string;
  season: string;
  leagueCap: number;
  paymentMode: PaymentMode;
  listed: boolean;
};

export type CompetitionInput = {
  city: string;
  sport: string;
  season: string;
  leagueCap: number;
};

export type CompetitionResult =
  | { ok: true; competition: Competition }
  | { ok: false; error: string };

export type DeleteCompetitionResult =
  | { ok: true }
  | { ok: false; error: string };

type CompetitionRow = {
  id: number;
  public_id: string;
  name: string;
  city: string;
  sport: string;
  season: string;
  league_cap: number;
  payment_mode: PaymentMode;
  listed: number;
};

function mapCompetition(row: CompetitionRow): Competition {
  return {
    id: row.id,
    publicId: row.public_id,
    name: row.name,
    city: row.city,
    sport: row.sport,
    season: row.season,
    leagueCap: row.league_cap,
    paymentMode: row.payment_mode,
    listed: Boolean(row.listed),
  };
}

export function competitionName(input: Pick<CompetitionInput, "city" | "sport" | "season">): string {
  return `${catalogueLabel(input.city)} ${input.sport.trim().toLowerCase()} season ${input.season.trim()}`;
}

export function sportsOf(competitions: Competition[]): string[] {
  return [...new Set(competitions.map((row) => row.sport))].sort();
}

export function citiesForSport(competitions: Competition[], sport: string): string[] {
  return [
    ...new Set(
      competitions.filter((row) => row.sport === sport).map((row) => row.city),
    ),
  ].sort();
}

export async function listCompetitions(): Promise<Competition[]> {
  const db = await getDatabase();
  const { results } = await db
    .prepare(
      `SELECT * FROM competitions ORDER BY listed DESC, sport ASC, city ASC, season ASC, id ASC`,
    )
    .all<CompetitionRow>();
  return results.map(mapCompetition);
}

export async function listOpenCompetitions(): Promise<Competition[]> {
  const all = await listCompetitions();
  return all.filter((row) => row.listed);
}

export async function getCompetitionByPublicId(
  publicId: string,
): Promise<Competition | null> {
  const db = await getDatabase();
  const row = await db
    .prepare(`SELECT * FROM competitions WHERE public_id = ?`)
    .bind(publicId)
    .first<CompetitionRow>();
  return row ? mapCompetition(row) : null;
}

export async function createCompetition(
  input: CompetitionInput,
): Promise<CompetitionResult> {
  const parsed = parseCatalogue(input);
  if (!parsed.ok) {
    return parsed;
  }
  const { city, sport, season } = parsed;
  const leagueCap = input.leagueCap;
  if (!Number.isInteger(leagueCap) || leagueCap < 1) {
    return { ok: false, error: "League cap must be at least 1." };
  }

  const db = await getDatabase();
  const existing = await db
    .prepare(
      `SELECT id FROM competitions WHERE city = ? AND sport = ? AND season = ?`,
    )
    .bind(city, sport, season)
    .first<{ id: number }>();
  if (existing) {
    return {
      ok: false,
      error: "That city, sport, and season already exist. Unhide it instead of adding it again.",
    };
  }

  const publicId = newPublicId("cmp");
  const name = competitionName({ city, sport, season });
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO competitions (
        public_id, name, city, sport, season, league_cap, payment_mode, created_at, listed
      ) VALUES (?, ?, ?, ?, ?, ?, 'open', ?, 1)`,
    )
    .bind(publicId, name, city, sport, season, leagueCap, now)
    .run();
  const created = await getCompetitionByPublicId(publicId);
  if (!created) {
    return { ok: false, error: "The competition could not be saved." };
  }
  return { ok: true, competition: created };
}

export async function setCompetitionListed(
  publicId: string,
  listed: boolean,
): Promise<boolean> {
  const db = await getDatabase();
  const row = await db
    .prepare(`SELECT id FROM competitions WHERE public_id = ?`)
    .bind(publicId)
    .first<{ id: number }>();
  if (!row) {
    return false;
  }
  await db
    .prepare(`UPDATE competitions SET listed = ? WHERE public_id = ?`)
    .bind(listed ? 1 : 0, publicId)
    .run();
  return true;
}

export async function deleteCompetition(
  publicId: string,
): Promise<DeleteCompetitionResult> {
  const db = await getDatabase();
  const competition = await db
    .prepare(`SELECT id FROM competitions WHERE public_id = ?`)
    .bind(publicId)
    .first<{ id: number }>();
  if (!competition) {
    return { ok: false, error: "That competition is not on the list." };
  }
  const team = await db
    .prepare(`SELECT id FROM teams WHERE competition_id = ? LIMIT 1`)
    .bind(competition.id)
    .first<{ id: number }>();
  if (team) {
    return {
      ok: false,
      error: "This competition has registered teams and cannot be deleted.",
    };
  }
  await db
    .prepare(`DELETE FROM competitions WHERE id = ?`)
    .bind(competition.id)
    .run();
  return { ok: true };
}
