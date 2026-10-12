import "server-only";
import { connection } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Cloudflare bindings (D1, R2, vars, secrets) on Workers and in `next dev`;
// plain process.env elsewhere (e.g. `next start`, where there is no database).

type Env = Partial<CloudflareEnv> & Record<string, unknown>;

export async function getEnv(): Promise<Env> {
  // `next build` prerenders without bindings. Asking OpenNext for them here
  // would start a local workerd per build worker (slow, and runs out of memory).
  if (process.env.NEXT_PHASE === "phase-production-build") return process.env as unknown as Env;
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as Env;
  } catch {
    return process.env as unknown as Env;
  }
}

export async function getSecret(name: string): Promise<string | undefined> {
  const env = await getEnv();
  const v = env[name] ?? process.env[name];
  return typeof v === "string" && v ? v : undefined;
}

export class ServiceUnavailableError extends Error {}

/** The D1 database. Marks the caller as request-time data (never prerendered). */
export async function getDb(): Promise<D1Database> {
  await connection();
  const env = await getEnv();
  if (!env.DB) {
    throw new ServiceUnavailableError(
      "No D1 database binding. Run the site with `npm run dev` (local D1) or on Cloudflare Workers.",
    );
  }
  return env.DB;
}
