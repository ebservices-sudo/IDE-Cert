-- Orders, quotes and contact messages. Money is stored in euro cents (integers).
-- Apply locally:  npx wrangler d1 migrations apply ide-cert-db --local
-- Apply remotely: npx wrangler d1 migrations apply ide-cert-db --remote

CREATE TABLE counters (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  -- received | proforma_sent | paid | ordered | shipped | completed | cancelled
  status TEXT NOT NULL DEFAULT 'received',
  customer_type TEXT NOT NULL CHECK (customer_type IN ('private', 'company')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  nui TEXT,
  vat_number TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL,
  shipping_zone TEXT NOT NULL,
  -- NULL = to be confirmed on the proforma invoice
  shipping_cents INTEGER,
  payment_method TEXT NOT NULL,
  items_cents INTEGER NOT NULL,
  vat_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  customer_notes TEXT,
  admin_notes TEXT,
  user_id TEXT
);
CREATE INDEX orders_created ON orders (created_at DESC);
CREATE INDEX orders_email ON orders (email);
CREATE INDEX orders_status ON orders (status);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  options TEXT NOT NULL,
  unit TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  line_total_cents INTEGER NOT NULL
);
CREATE INDEX order_items_order ON order_items (order_id);

CREATE TABLE quotes (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  -- new | answered | won | lost
  status TEXT NOT NULL DEFAULT 'new',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  nui TEXT,
  country TEXT NOT NULL,
  -- JSON array of { sku, name, quantity, details }
  items TEXT NOT NULL,
  message TEXT,
  admin_notes TEXT
);
CREATE INDEX quotes_created ON quotes (created_at DESC);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  topic TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  -- new | answered | archived
  status TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX messages_created ON messages (created_at DESC);
