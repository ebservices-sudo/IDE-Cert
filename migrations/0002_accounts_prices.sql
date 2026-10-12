-- Accounts (customers and admins), sessions, one-time tokens, and price-list imports.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  nui TEXT,
  -- PBKDF2-SHA256: "pbkdf2$<iterations>$<salt b64>$<hash b64>"
  password_hash TEXT NOT NULL,
  -- customer | admin
  role TEXT NOT NULL DEFAULT 'customer',
  email_verified_at TEXT,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE sessions (
  -- SHA-256 of the cookie token; the token itself is never stored
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX sessions_user ON sessions (user_id);

CREATE TABLE auth_tokens (
  -- SHA-256 of the emailed token
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  -- verify_email | reset_password
  purpose TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

-- Price-list uploads from the admin panel. Publishing one writes price_overrides.
CREATE TABLE price_imports (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  filename TEXT NOT NULL,
  -- draft | published | discarded
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  -- JSON: counts of changed / unchanged / new / missing items
  summary TEXT NOT NULL
);

CREATE TABLE price_import_rows (
  import_id TEXT NOT NULL REFERENCES price_imports (id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT,
  rrp_cents INTEGER NOT NULL,
  net_cents INTEGER,
  PRIMARY KEY (import_id, sku)
);

-- Live price layer on top of the built-in catalogue (data/catalog/products.json).
CREATE TABLE price_overrides (
  sku TEXT PRIMARY KEY,
  rrp_cents INTEGER NOT NULL,
  net_cents INTEGER,
  import_id TEXT,
  updated_at TEXT NOT NULL
);

ALTER TABLE orders ADD COLUMN proforma_sent_at TEXT;
