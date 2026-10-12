-- Next.js cache tags for OpenNext's D1 tag cache (binding NEXT_TAG_CACHE_D1).
-- OpenNext also creates this on deploy; having it here keeps every database complete.
CREATE TABLE IF NOT EXISTS revalidations (
  tag TEXT NOT NULL,
  revalidatedAt INTEGER NOT NULL,
  stale INTEGER,
  expire INTEGER DEFAULT NULL,
  UNIQUE (tag) ON CONFLICT REPLACE
);
