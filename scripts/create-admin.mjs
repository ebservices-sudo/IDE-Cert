// Creates an admin account (or promotes an existing account to admin) in D1.
//
//   npm run admin:create -- owner@example.com "Full Name"            (local D1)
//   npm run admin:create -- owner@example.com "Full Name" --remote   (production)
//
// A random password is generated and printed once. The admin can change it via
// "Forgot your password?" on the sign-in page.

import { execFileSync } from "node:child_process";
import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const remote = args.includes("--remote");
const [email, name = "Admin"] = args.filter((a) => !a.startsWith("--"));
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run admin:create -- email@example.com "Full Name" [--remote]');
  process.exit(1);
}

const b64url = (buf) => buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const password = b64url(randomBytes(12));
const salt = randomBytes(16);
const iterations = 100_000; // same as src/lib/auth/crypto.ts
const hash = `pbkdf2$${iterations}$${b64url(salt)}$${b64url(pbkdf2Sync(password, salt, iterations, 32, "sha256"))}`;
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const now = new Date().toISOString();

const sql = `INSERT INTO users (id, email, name, password_hash, role, email_verified_at, created_at)
VALUES (${q(randomUUID())}, ${q(email.toLowerCase())}, ${q(name)}, ${q(hash)}, 'admin', ${q(now)}, ${q(now)})
ON CONFLICT(email) DO UPDATE SET role = 'admin', password_hash = excluded.password_hash, email_verified_at = COALESCE(users.email_verified_at, excluded.email_verified_at);`;

// SQL goes through a file: command-line quoting differs between shells.
const dir = mkdtempSync(join(tmpdir(), "ide-admin-"));
const file = join(dir, "admin.sql");
writeFileSync(file, sql);
try {
  execFileSync("npx", ["wrangler", "d1", "execute", "ide-cert-db", remote ? "--remote" : "--local", "--yes", "--file", JSON.stringify(file)], {
    stdio: ["ignore", "ignore", "inherit"],
    shell: true,
  });
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\nAdmin ready (${remote ? "production" : "local"} database)`);
console.log(`  Email:    ${email.toLowerCase()}`);
console.log(`  Password: ${password}`);
console.log("Sign in at /account/login, then open /admin. Store the password safely or reset it via email.\n");
