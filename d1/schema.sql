-- Cloudflare D1 SQL Schema for GoooG
-- Run locally: npx wrangler d1 execute gooog-db --local --file=d1/schema.sql
-- Run production: npx wrangler d1 execute gooog-db --remote --file=d1/schema.sql

CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  images TEXT NOT NULL,
  avatar_url TEXT,
  enabled INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  stats TEXT
);

CREATE INDEX IF NOT EXISTS idx_characters_category ON characters(category);
CREATE INDEX IF NOT EXISTS idx_characters_created_at ON characters(created_at);

CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  mode TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  score INTEGER NOT NULL,
  accuracy REAL NOT NULL,
  duration_seconds INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);
