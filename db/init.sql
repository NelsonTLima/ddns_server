\c ddns_db;

--- connect-pg-simple bootstrap
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
---

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(32) CHECK (char_length(name) BETWEEN 3 AND 32) UNIQUE NOT NULL,
  password_hash CHAR(60) NOT NULL,
  token_hash CHAR(60)
);

CREATE TABLE records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  cloudflare_id TEXT,
  name TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  proxied BOOLEAN NOT NULL,
  created_on TIMESTAMPTZ NOT NULL,
  modified_on TIMESTAMPTZ NOT NULL
);

CREATE VIEW user_panel_view AS
SELECT
  users.id AS user_id,
  records.id AS record_id,
  records.name AS name,
  records.content AS content,
  records.proxied AS proxied,
  records.modified_on  AS update
FROM users
JOIN records
ON records.user_id = users.id;

INSERT INTO users (
  name,
  password_hash
)
VALUES (
  'admin',
  '$2b$12$1dC08IiBV82/PHU7vbsEUeocUYLjnTF58NxKpDhIQcIaq5DcVQH.q'
);
