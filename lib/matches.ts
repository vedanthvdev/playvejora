import { getCompetitionByPublicId, listCompetitions, type Competition } from "@/lib/competitions";
import { getDatabase } from "@/lib/db";
import { getTeam, listTeams, type TeamRecord } from "@/lib/registration";
import { volleyballOutcome, type SetScore } from "@/lib/volleyball";

export type FootballScorerInput = {
  teamId: number;
  playerName: string;
  goals: number;
};

export type FootballMatchInput = {
  competitionPublicId: string;
  homeTeamId: number;
  awayTeamId: number;
  homeGoals: number;
  awayGoals: number;
  scorers: FootballScorerInput[];
};

export type VolleyballMatchInput = {
  competitionPublicId: string;
  homeTeamId: number;
  awayTeamId: number;
  sets: SetScore[];
};

export type MatchRecord = {
  id: number;
  competitionPublicId: string;
  sport: string;
  city: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number | null;
  awayGoals: number | null;
  sets: SetScore[] | null;
  winner: "home" | "away" | "draw";
  createdAt: string;
};

export type StandingRow = {
  teamId: number;
  teamName: string;
  city: string;
  competitionPublicId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export type ScorerRow = {
  playerName: string;
  teamName: string;
  city: string;
  goals: number;
};

export type StatsFilter = {
  sport: string;
  city?: string;
  listedOnly?: boolean;
};

type MatchRow = {
  id: number;
  competition_id: number;
  home_team_id: number;
  away_team_id: number;
  home_goals: number | null;
  away_goals: number | null;
  sets_json: string | null;
  created_at: string;
  public_id: string;
  sport: string;
  city: string;
  listed: number;
  home_name: string;
  away_name: string;
};

type Result = { ok: true } | { ok: false; error: string };

function footballPoints(homeGoals: number, awayGoals: number): {
  home: number;
  away: number;
  winner: "home" | "away" | "draw";
} {
  if (homeGoals === awayGoals) {
    return { home: 1, away: 1, winner: "draw" };
  }
  if (homeGoals > awayGoals) {
    return { home: 3, away: 0, winner: "home" };
  }
  return { home: 0, away: 3, winner: "away" };
}

function parseSets(raw: string | null): SetScore[] | null {
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as SetScore[];
}

function winnerFromMatch(row: MatchRow): "home" | "away" | "draw" {
  if (row.sets_json) {
    const outcome = volleyballOutcome(parseSets(row.sets_json) ?? []);
    return outcome.ok ? outcome.winner : "draw";
  }
  return footballPoints(row.home_goals ?? 0, row.away_goals ?? 0).winner;
}

function mapMatch(row: MatchRow): MatchRecord {
  return {
    id: row.id,
    competitionPublicId: row.public_id,
    sport: row.sport,
    city: row.city,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    homeTeamName: row.home_name,
    awayTeamName: row.away_name,
    homeGoals: row.home_goals,
    awayGoals: row.away_goals,
    sets: parseSets(row.sets_json),
    winner: winnerFromMatch(row),
    createdAt: row.created_at,
  };
}

const MATCH_SELECT = `
  SELECT
    matches.*,
    competitions.public_id AS public_id,
    competitions.sport AS sport,
    competitions.city AS city,
    competitions.listed AS listed,
    home.team_name AS home_name,
    away.team_name AS away_name
  FROM matches
  INNER JOIN competitions ON competitions.id = matches.competition_id
  INNER JOIN teams AS home ON home.id = matches.home_team_id
  INNER JOIN teams AS away ON away.id = matches.away_team_id
`;

async function sidesForMatch(
  competition: Competition,
  homeTeamId: number,
  awayTeamId: number,
): Promise<{ ok: true; home: TeamRecord; away: TeamRecord } | { ok: false; error: string }> {
  if (homeTeamId === awayTeamId) {
    return { ok: false, error: "Pick two in-league teams from this competition." };
  }
  const home = await getTeam(homeTeamId);
  const away = await getTeam(awayTeamId);
  if (
    !home ||
    !away ||
    home.competitionId !== competition.id ||
    away.competitionId !== competition.id ||
    home.status !== "in_league" ||
    away.status !== "in_league"
  ) {
    return { ok: false, error: "Pick two in-league teams from this competition." };
  }
  return { ok: true, home, away };
}

export async function recordFootballMatch(input: FootballMatchInput): Promise<Result> {
  if (
    !Number.isInteger(input.homeGoals) ||
    !Number.isInteger(input.awayGoals) ||
    input.homeGoals < 0 ||
    input.awayGoals < 0
  ) {
    return { ok: false, error: "Scores must be zero or more." };
  }
  const competition = await getCompetitionByPublicId(input.competitionPublicId);
  if (!competition || competition.sport !== "football") {
    return { ok: false, error: "Pick a football competition." };
  }
  const sides = await sidesForMatch(competition, input.homeTeamId, input.awayTeamId);
  if (!sides.ok) {
    return sides;
  }
  const scorers = input.scorers.filter((row) => row.goals > 0);
  let homeAttributed = 0;
  let awayAttributed = 0;
  for (const scorer of scorers) {
    if (!Number.isInteger(scorer.goals) || scorer.goals < 1) {
      return { ok: false, error: "Scoring players must be on the registered team list." };
    }
    const side =
      scorer.teamId === sides.home.id ? sides.home : scorer.teamId === sides.away.id ? sides.away : null;
    if (!side || !side.playerNames.includes(scorer.playerName)) {
      return { ok: false, error: "Scoring players must be on the registered team list." };
    }
    if (scorer.teamId === sides.home.id) {
      homeAttributed += scorer.goals;
    } else {
      awayAttributed += scorer.goals;
    }
  }
  if (homeAttributed !== input.homeGoals || awayAttributed !== input.awayGoals) {
    return {
      ok: false,
      error: "Player goal totals must match each team's score.",
    };
  }

  const db = await getDatabase();
  const now = new Date().toISOString();
  const inserted = await db
    .prepare(
      `INSERT INTO matches (
        competition_id, home_team_id, away_team_id, home_goals, away_goals, sets_json, created_at
      ) VALUES (?, ?, ?, ?, ?, NULL, ?) RETURNING id`,
    )
    .bind(competition.id, sides.home.id, sides.away.id, input.homeGoals, input.awayGoals, now)
    .first<{ id: number }>();
  if (!inserted) {
    return { ok: false, error: "The match could not be saved." };
  }
  for (const scorer of scorers) {
    await db
      .prepare(
        `INSERT INTO scoring_events (match_id, team_id, player_name, goals) VALUES (?, ?, ?, ?)`,
      )
      .bind(inserted.id, scorer.teamId, scorer.playerName, scorer.goals)
      .run();
  }
  return { ok: true };
}

export async function recordVolleyballMatch(input: VolleyballMatchInput): Promise<Result> {
  const outcome = volleyballOutcome(input.sets);
  if (!outcome.ok) {
    return outcome;
  }
  const competition = await getCompetitionByPublicId(input.competitionPublicId);
  if (!competition || competition.sport !== "volleyball") {
    return { ok: false, error: "Pick a volleyball competition." };
  }
  const sides = await sidesForMatch(competition, input.homeTeamId, input.awayTeamId);
  if (!sides.ok) {
    return sides;
  }
  const db = await getDatabase();
  await db
    .prepare(
      `INSERT INTO matches (
        competition_id, home_team_id, away_team_id, home_goals, away_goals, sets_json, created_at
      ) VALUES (?, ?, ?, NULL, NULL, ?, ?)`,
    )
    .bind(
      competition.id,
      sides.home.id,
      sides.away.id,
      JSON.stringify(input.sets),
      new Date().toISOString(),
    )
    .run();
  return { ok: true };
}

export async function listMatches(competitionPublicId: string): Promise<MatchRecord[]> {
  const db = await getDatabase();
  const { results } = await db
    .prepare(`${MATCH_SELECT} WHERE competitions.public_id = ? ORDER BY matches.id DESC`)
    .bind(competitionPublicId)
    .all<MatchRow>();
  return results.map(mapMatch);
}

export async function deleteMatch(id: number): Promise<boolean> {
  const db = await getDatabase();
  const row = await db
    .prepare(`SELECT id FROM matches WHERE id = ?`)
    .bind(id)
    .first<{ id: number }>();
  if (!row) {
    return false;
  }
  await db.prepare(`DELETE FROM scoring_events WHERE match_id = ?`).bind(id).run();
  await db.prepare(`DELETE FROM matches WHERE id = ?`).bind(id).run();
  return true;
}

async function competitionsForStats(filter: StatsFilter): Promise<Competition[]> {
  const rows = await listCompetitions();
  return rows.filter((row) => {
    if (row.sport !== filter.sport) {
      return false;
    }
    if (filter.city && row.city !== filter.city) {
      return false;
    }
    if (filter.listedOnly !== false && !row.listed) {
      return false;
    }
    return true;
  });
}

function emptyStanding(team: TeamRecord): StandingRow {
  return {
    teamId: team.id,
    teamName: team.teamName,
    city: team.city,
    competitionPublicId: team.competitionPublicId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
  };
}

function applyResult(
  table: Map<number, StandingRow>,
  homeId: number,
  awayId: number,
  homeFor: number,
  awayFor: number,
  homePoints: number,
  awayPoints: number,
  winner: "home" | "away" | "draw",
) {
  const home = table.get(homeId);
  const away = table.get(awayId);
  if (!home || !away) {
    return;
  }
  home.played += 1;
  away.played += 1;
  home.gf += homeFor;
  home.ga += awayFor;
  away.gf += awayFor;
  away.ga += homeFor;
  home.gd = home.gf - home.ga;
  away.gd = away.gf - away.ga;
  home.points += homePoints;
  away.points += awayPoints;
  if (winner === "draw") {
    home.drawn += 1;
    away.drawn += 1;
  } else if (winner === "home") {
    home.won += 1;
    away.lost += 1;
  } else {
    away.won += 1;
    home.lost += 1;
  }
}

function rank(rows: StandingRow[]): StandingRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.gd !== a.gd) {
      return b.gd - a.gd;
    }
    if (b.gf !== a.gf) {
      return b.gf - a.gf;
    }
    return a.teamId - b.teamId;
  });
}

export async function teamStandings(filter: StatsFilter): Promise<StandingRow[]> {
  const competitions = await competitionsForStats(filter);
  const db = await getDatabase();
  const tables: StandingRow[] = [];
  for (const competition of competitions) {
    const teams = (await listTeams({ sport: competition.sport, city: competition.city })).filter(
      (team) => team.status === "in_league" && team.competitionId === competition.id,
    );
    const table = new Map(teams.map((team) => [team.id, emptyStanding(team)]));
    const { results } = await db
      .prepare(`${MATCH_SELECT} WHERE matches.competition_id = ? ORDER BY matches.id ASC`)
      .bind(competition.id)
      .all<MatchRow>();
    for (const row of results) {
      if (row.sets_json) {
        const outcome = volleyballOutcome(parseSets(row.sets_json) ?? []);
        if (outcome.ok) {
          applyResult(
            table,
            row.home_team_id,
            row.away_team_id,
            outcome.homeSets,
            outcome.awaySets,
            outcome.homePoints,
            outcome.awayPoints,
            outcome.winner,
          );
        }
      } else {
        const homeGoals = row.home_goals ?? 0;
        const awayGoals = row.away_goals ?? 0;
        const points = footballPoints(homeGoals, awayGoals);
        applyResult(
          table,
          row.home_team_id,
          row.away_team_id,
          homeGoals,
          awayGoals,
          points.home,
          points.away,
          points.winner,
        );
      }
    }
    tables.push(...rank([...table.values()]));
  }
  return tables;
}

export async function footballScorers(filter: StatsFilter): Promise<ScorerRow[]> {
  const competitions = await competitionsForStats({ ...filter, sport: "football" });
  if (competitions.length === 0) {
    return [];
  }
  const db = await getDatabase();
  const ids = competitions.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(", ");
  const { results } = await db
    .prepare(
      `SELECT
        scoring_events.player_name AS player_name,
        teams.team_name AS team_name,
        competitions.city AS city,
        SUM(scoring_events.goals) AS goals
      FROM scoring_events
      INNER JOIN matches ON matches.id = scoring_events.match_id
      INNER JOIN teams ON teams.id = scoring_events.team_id
      INNER JOIN competitions ON competitions.id = matches.competition_id
      WHERE matches.competition_id IN (${placeholders})
      GROUP BY scoring_events.player_name, teams.team_name, competitions.city
      ORDER BY goals DESC, scoring_events.player_name ASC`,
    )
    .bind(...ids)
    .all<{ player_name: string; team_name: string; city: string; goals: number }>();
  return results.map((row) => ({
    playerName: row.player_name,
    teamName: row.team_name,
    city: row.city,
    goals: row.goals,
  }));
}

export async function listMatchesForSport(
  sport: string,
  listedOnly = true,
): Promise<MatchRecord[]> {
  const db = await getDatabase();
  const listed = listedOnly ? "AND competitions.listed = 1" : "";
  const { results } = await db
    .prepare(
      `${MATCH_SELECT} WHERE competitions.sport = ? ${listed} ORDER BY matches.id DESC`,
    )
    .bind(sport)
    .all<MatchRow>();
  return results.map(mapMatch);
}
