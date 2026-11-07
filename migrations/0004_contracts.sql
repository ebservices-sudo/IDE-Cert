-- Contracts built in the admin panel (often from a quote, message or order) and sent to
-- the client, who can read, print and accept them online through a private link.
-- Money is stored in euro cents, net of VAT.

CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  -- Random secret in the client's link. Kept readable so the admin can copy the link again;
  -- it only grants reading and accepting this one contract.
  token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  -- draft | sent | accepted | cancelled
  status TEXT NOT NULL DEFAULT 'draft',
  -- sq | en
  language TEXT NOT NULL DEFAULT 'sq',
  -- inspection | certification | design | supply | other
  kind TEXT NOT NULL,
  -- quote | message | order | NULL (written from scratch)
  source_type TEXT,
  source_id TEXT,
  source_number TEXT,

  client_name TEXT NOT NULL,
  client_company TEXT,
  client_nui TEXT,
  client_representative TEXT,
  client_address TEXT,
  client_email TEXT NOT NULL,
  client_phone TEXT,

  title TEXT NOT NULL,
  scope TEXT NOT NULL,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  -- JSON array of { description, quantity, unit, unitCents }
  items TEXT NOT NULL,
  vat_rate INTEGER NOT NULL DEFAULT 18,
  payment_terms TEXT NOT NULL,
  validity_days INTEGER NOT NULL DEFAULT 30,
  special_terms TEXT,
  -- inspection contracts: when the next periodic inspection is due (reminders)
  next_inspection_date TEXT,
  internal_notes TEXT,

  sent_at TEXT,
  sent_to TEXT,
  viewed_at TEXT,
  accepted_at TEXT,
  accepted_name TEXT,
  accepted_ip TEXT
);
CREATE INDEX contracts_created ON contracts (created_at DESC);
CREATE INDEX contracts_status ON contracts (status);
CREATE INDEX contracts_email ON contracts (client_email);
CREATE INDEX contracts_next_inspection ON contracts (next_inspection_date);

-- Failed sign-ins, for locking an email after repeated wrong passwords.
CREATE TABLE login_failures (
  email TEXT NOT NULL,
  at TEXT NOT NULL
);
CREATE INDEX login_failures_email ON login_failures (email, at);
