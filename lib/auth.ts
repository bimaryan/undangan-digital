import { cookies } from "next/headers";
import pool from "./db";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  HOST_COOKIE,
  HOST_SESSION_TTL_SECONDS,
  type AdminSession,
  type HostSession,
  constantTimeEquals,
  hashPassword,
  signSession,
  verifyPassword,
  verifySession,
} from "./session";

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const payload = verifySession<AdminSession>(token);
  if (!payload || payload.role !== "admin" || typeof payload.ver !== "number") {
    return null;
  }

  // Sesi admin bersifat stateless, jadi versi di cookie harus dicocokkan dengan
  // database. Menaikkan session_version langsung membatalkan cookie lama.
  try {
    const result = await pool.query<{ session_version: number | null }>(
      "SELECT session_version FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [payload.sub]
    );
    const row = result.rows[0];
    if (!row) return null;
    return Number(row.session_version ?? 1) === payload.ver ? payload : null;
  } catch (error) {
    console.error("Admin session check failed:", error);
    return null;
  }
}

export async function getHostSession(): Promise<HostSession | null> {
  const token = (await cookies()).get(HOST_COOKIE)?.value;
  const payload = verifySession<HostSession>(token);
  return payload?.role === "host" ? payload : null;
}

/**
 * Secure check for host access. The cookie signature is not enough: the
 * invitation token_version must still match, so rotating the token immediately
 * invalidates old host sessions.
 */
export async function getHostAccess(slug: string): Promise<"admin" | "host" | null> {
  if (await getAdminSession()) return "admin";

  const host = await getHostSession();
  if (!host || host.slug !== slug) return null;

  try {
    const result = await pool.query<{ token_version: number | null }>(
      "SELECT token_version FROM undangan WHERE slug = $1",
      [slug]
    );
    if (result.rows.length === 0) return null;
    const version = Number(result.rows[0].token_version ?? 1);
    return host.ver === version ? "host" : null;
  } catch (error) {
    console.error("Host access check failed:", error);
    return null;
  }
}

export async function setAdminSessionCookie(email: string, sessionVersion: number): Promise<void> {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const token = signSession({
    role: "admin",
    sub: email,
    ver: sessionVersion,
    exp: Math.floor(expiresAt / 1000),
  });

  (await cookies()).set(ADMIN_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    expires: new Date(expiresAt),
  });
}

export async function setHostSessionCookie(slug: string, tokenVersion: number): Promise<void> {
  const expiresAt = Date.now() + HOST_SESSION_TTL_SECONDS * 1000;
  const token = signSession({
    role: "host",
    slug,
    ver: tokenVersion,
    exp: Math.floor(expiresAt / 1000),
  });

  (await cookies()).set(HOST_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: HOST_SESSION_TTL_SECONDS,
    expires: new Date(expiresAt),
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function clearHostSessionCookie(): Promise<void> {
  (await cookies()).delete(HOST_COOKIE);
}

type AdminRow = {
  id: number;
  email: string;
  password_hash: string;
  session_version: number | null;
};

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<
  | { ok: true; email: string; sessionVersion: number }
  | { ok: false; reason: "invalid" | "not_ready" | "db_error" }
> {
  try {
    const result = await pool.query<AdminRow>(
      "SELECT id, email, password_hash, session_version FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email.trim()]
    );

    if (result.rows.length === 0) {
      const count = await pool.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM admin_users");
      return { ok: false, reason: count.rows[0]?.total === "0" ? "not_ready" : "invalid" };
    }

    const admin = result.rows[0];
    if (!verifyPassword(password, admin.password_hash)) {
      return { ok: false, reason: "invalid" };
    }

    return {
      ok: true,
      email: admin.email,
      sessionVersion: Number(admin.session_version ?? 1),
    };
  } catch (error) {
    console.error("Admin authentication failed:", error);
    return { ok: false, reason: "db_error" };
  }
}

export async function changeAdminPassword(
  email: string,
  sessionVersion: number,
  currentPassword: string,
  newPassword: string
): Promise<
  | { ok: true; sessionVersion: number }
  | { ok: false; reason: "invalid_password" | "session_changed" | "not_found" | "db_error" }
> {
  try {
    const result = await pool.query<AdminRow>(
      "SELECT id, email, password_hash, session_version FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    const admin = result.rows[0];
    if (!admin) return { ok: false, reason: "not_found" };

    if (Number(admin.session_version ?? 1) !== sessionVersion) {
      return { ok: false, reason: "session_changed" };
    }
    if (!verifyPassword(currentPassword, admin.password_hash)) {
      return { ok: false, reason: "invalid_password" };
    }

    const updated = await pool.query<{ session_version: number }>(
      `UPDATE admin_users
       SET password_hash = $1, session_version = session_version + 1
       WHERE id = $2 AND session_version = $3
       RETURNING session_version`,
      [hashPassword(newPassword), admin.id, sessionVersion]
    );

    if (!updated.rows[0]) {
      return { ok: false, reason: "session_changed" };
    }

    return { ok: true, sessionVersion: Number(updated.rows[0].session_version) };
  } catch (error) {
    console.error("Admin password change failed:", error);
    return { ok: false, reason: "db_error" };
  }
}

export async function rotateAdminSessionVersion(
  email: string,
  sessionVersion: number
): Promise<
  { ok: true; sessionVersion: number } | { ok: false; reason: "session_changed" | "db_error" }
> {
  try {
    const result = await pool.query<{ session_version: number }>(
      `UPDATE admin_users
       SET session_version = session_version + 1
       WHERE LOWER(email) = LOWER($1) AND session_version = $2
       RETURNING session_version`,
      [email, sessionVersion]
    );
    if (!result.rows[0]) return { ok: false, reason: "session_changed" };
    return { ok: true, sessionVersion: Number(result.rows[0].session_version) };
  } catch (error) {
    console.error("Admin session rotation failed:", error);
    return { ok: false, reason: "db_error" };
  }
}

export async function verifyHostTokenForSlug(
  slug: string,
  token: string
): Promise<{ ok: true; tokenVersion: number } | { ok: false }> {
  if (!slug || !token) return { ok: false };

  try {
    const result = await pool.query<{ akses_token: string | null; token_version: number | null }>(
      "SELECT akses_token, token_version FROM undangan WHERE slug = $1 LIMIT 1",
      [slug]
    );

    const row = result.rows[0];
    if (!row?.akses_token) return { ok: false };
    if (!constantTimeEquals(row.akses_token, token)) return { ok: false };

    return { ok: true, tokenVersion: Number(row.token_version ?? 1) };
  } catch (error) {
    console.error("Host token verification failed:", error);
    return { ok: false };
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
