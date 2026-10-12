import type { NextRequest } from "next/server";
import { consumeAuthToken } from "@/lib/auth/session";
import { getDb } from "@/lib/server/env";

/** Email confirmation link: /account/verify?token=… */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const target = new URL("/account", request.nextUrl);
  try {
    const userId = token ? await consumeAuthToken(token, "verify_email") : null;
    if (userId) {
      const db = await getDb();
      await db.prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?").bind(new Date().toISOString(), userId).run();
      target.searchParams.set("verified", "1");
    } else {
      target.searchParams.set("verified", "invalid");
    }
  } catch {
    target.searchParams.set("verified", "error");
  }
  return Response.redirect(target, 303);
}
