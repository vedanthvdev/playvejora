-- Migration number: 0003

-- A competition is one city + sport + season with its own cap. Team rows
-- point here so a later Glasgow netball season does not reuse Edinburgh
-- football places, and Stripe can paywall league places per competition
-- while the waitlist stays free.
CREATE TABLE IF NOT EXISTS competitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  sport TEXT NOT NULL,
  season TEXT NOT NULL,
  league_cap INTEGER NOT NULL,
  payment_mode TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO competitions (
  id, public_id, name, city, sport, season, league_cap, payment_mode, created_at
) VALUES (
  1,
  'cmp_edn_football_s1',
  'Edinburgh football season one',
  'edinburgh',
  'football',
  'one',
  5,
  'open',
  '2026-09-08T00:00:00.000Z'
);

ALTER TABLE teams ADD COLUMN public_id TEXT NOT NULL DEFAULT '';
ALTER TABLE teams ADD COLUMN competition_id INTEGER NOT NULL DEFAULT 1;
ALTER TABLE teams ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'not_required';
ALTER TABLE teams ADD COLUMN stripe_checkout_session_id TEXT;
ALTER TABLE teams ADD COLUMN stripe_payment_intent_id TEXT;

UPDATE teams SET public_id = 'tm_legacy_' || id WHERE public_id = '';

CREATE UNIQUE INDEX IF NOT EXISTS teams_public_id ON teams (public_id);
CREATE INDEX IF NOT EXISTS teams_competition_status ON teams (competition_id, status);
CREATE INDEX IF NOT EXISTS competitions_city_sport ON competitions (city, sport);
