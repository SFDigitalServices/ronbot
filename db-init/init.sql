CREATE TABLE IF NOT EXISTS scheduled_items (
  id serial PRIMARY KEY,
  sheet_id VARCHAR (255) UNIQUE NOT NULL,
  messages_json jsonb DEFAULT '[]',
  created TIMESTAMP NOT NULL DEFAULT NOW()
);
