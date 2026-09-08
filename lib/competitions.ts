import { getDatabase } from "@/lib/db";

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
};

type CompetitionRow = {
  id: number;
  public_id: string;
  name: string;
  city: string;
  sport: string;
  season: string;
  league_cap: number;
  payment_mode: PaymentMode;
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
  };
}

export async function listCompetitions(): Promise<Competition[]> {
  const db = await getDatabase();
  const { results } = await db
    .prepare(
      `SELECT * FROM competitions ORDER BY city ASC, sport ASC, season ASC, id ASC`,
    )
    .all<CompetitionRow>();
  return results.map(mapCompetition);
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

export async function liveCompetition(): Promise<Competition> {
  const publicId =
    process.env.COMPETITION_PUBLIC_ID?.trim() || DEFAULT_COMPETITION_PUBLIC_ID;
  const competition = await getCompetitionByPublicId(publicId);
  if (!competition) {
    throw new Error(`Competition ${publicId} is missing. Apply migrations.`);
  }
  return competition;
}
