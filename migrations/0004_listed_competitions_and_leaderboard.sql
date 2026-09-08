-- Migration number: 0004

ALTER TABLE competitions ADD COLUMN listed INTEGER NOT NULL DEFAULT 1;

-- Generic scoreboard rows, grouped by sport on the public stats page.
-- "points" is goals in football and the sport's score otherwise.
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competition_id INTEGER NOT NULL,
  player_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS leaderboard_competition ON leaderboard_entries (competition_id, points);
