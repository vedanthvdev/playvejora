-- Migration number: 0005

-- Results are posted as matches. Public stats are computed from these rows
-- rather than from hand-typed leaderboard totals.
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competition_id INTEGER NOT NULL,
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  home_goals INTEGER,
  away_goals INTEGER,
  sets_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS matches_competition ON matches (competition_id, id);

CREATE TABLE IF NOT EXISTS scoring_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  goals INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS scoring_events_match ON scoring_events (match_id);

DROP TABLE IF EXISTS leaderboard_entries;
