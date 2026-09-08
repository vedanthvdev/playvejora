-- Migration number: 0001

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
);

-- Every registration counts the league places already taken in a city.
CREATE INDEX IF NOT EXISTS teams_city_status ON teams (city, status);
