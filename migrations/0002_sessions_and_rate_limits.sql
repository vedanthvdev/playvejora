-- Migration number: 0002

-- Organizer sessions live here so they expire and can be ended, which a cookie
-- derived from the password could not do. Only the hash is stored, so a copy of
-- this table is not a set of usable session cookies.
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_expires ON admin_sessions (expires_at);

-- One row per counted attempt. Timestamps are epoch milliseconds so a window
-- is a comparison rather than a date function.
CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bucket TEXT NOT NULL,
  hit_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limit_hits_bucket ON rate_limit_hits (bucket, hit_at);
