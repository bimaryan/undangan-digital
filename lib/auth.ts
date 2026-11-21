import { cookies } from "next/headers";
import pool from "./db";
import {
  AUTH_COOKIE,
  ADMIN_COOKIE,
  USER_SESSION_TTL_SECONDS,
  type AdminSession,
  type TenantSession,
  constantTimeEquals,
  hashPassword,
  signSession,
  verifyPassword,
  verifySession,
} from "./session";
import type { HostAccess, User, UserRole } from "@/types/auth";

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export async function getUserSession(): Promise<AdminSession | TenantSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value || cookieStore.get(ADMIN_COOKIE)?.value;
  const payload = verifySession<AdminSession | TenantSession>(token);
  if (payload?.role === "admin" || payload?.role === "tenant") {
    return payload;
  }
  return null;
}

async function getAdminSessionVersion(email: string): Promise<number | null> {
  try {
    const result = await pool.query<{ session_version: number | null }>(
      "SELECT session_version FROM users WHERE LOWER(email) = LOWER($1) AND role = 'admin' LIMIT 1",
      [email]
    );
    if (result.rows[0]) {
      return Number(result.rows[0].session_version ?? 1);
    }
  } catch (error) {
    console.error("Admin session version check failed:", error);
  }

  // Kompatibilitas mundur untuk akun yang masih hanya ada di `admin_users`.
  try {
    const legacy = await pool.query<{ session_version: number | null }>(
      "SELECT session_version FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    if (legacy.rows[0]) {
      return Number(legacy.rows[0].session_version ?? 1);
    }
  } catch (error) {
    console.error("Legacy admin session version check failed:", error);
  }

  return null;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getUserSession();
  if (session?.role !== "admin") return null;
  if (typeof session.ver !== "number") return null;

  // Sesi admin bersifat stateless, jadi versi di cookie harus dicocokkan dengan
  // database. Menaikkan session_version langsung membatalkan cookie lama.
  const currentVersion = await getAdminSessionVersion(session.sub);
  if (currentVersion === null) return null;
  return currentVersion === session.ver ? session : null;
}

export async function getTenantSession(): Promise<TenantSession | null> {
  const session = await getUserSession();
  return session?.role === "tenant" ? session : null;
}

/**
 * Cek hak akses ke undangan tertentu.
 * - Admin: akses penuh ke semua undangan
 * - Tenant: akses penuh ke undangan miliknya
 */
export async function getHostAccess(slug: string): Promise<HostAccess> {
  const user = await getUserSession();
  if (user?.role === "admin") return "admin";

  if (user?.role === "tenant") {
    try {
      const res = await pool.query<{ user_id: number | null }>(
        "SELECT user_id FROM undangan WHERE slug = $1",
        [slug]
      );
      if (res.rows.length > 0 && res.rows[0].user_id === user.userId) {
        return "tenant";
      }
    } catch (err) {
      console.error("Tenant access check failed:", err);
    }
  }

  return null;
}

export async function setUserSessionCookie(user: {
  id: number;
  email: string;
  role: UserRole;
  name?: string | null;
}): Promise<void> {
  const expiresAt = Date.now() + USER_SESSION_TTL_SECONDS * 1000;
  const exp = Math.floor(expiresAt / 1000);

  const payload: AdminSession | TenantSession =
    user.role === "admin"
      ? {
          role: "admin",
          sub: user.email,
          userId: user.id,
          name: user.name || undefined,
          ver: (await getAdminSessionVersion(user.email)) ?? 1,
          exp,
        }
      : {
          role: "tenant",
          sub: user.email,
          userId: user.id,
          name: user.name || undefined,
          exp,
        };

  const token = signSession(payload);

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: USER_SESSION_TTL_SECONDS,
    expires: new Date(expiresAt),
  });

  if (user.role === "admin") {
    cookieStore.set(ADMIN_COOKIE, token, {
      ...baseCookieOptions,
      maxAge: USER_SESSION_TTL_SECONDS,
      expires: new Date(expiresAt),
    });
  }
}

export async function setAdminSessionCookie(
  email: string,
  sessionVersion: number
): Promise<void> {
  const expiresAt = Date.now() + USER_SESSION_TTL_SECONDS * 1000;
  let userId = 1;

  try {
    const result = await pool.query<{ id: number }>(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    if (result.rows[0]) userId = result.rows[0].id;
  } catch {
    // Abaikan: id hanya informasi tambahan pada payload sesi.
  }

  const token = signSession({
    role: "admin",
    sub: email,
    userId,
    name: "Administrator",
    ver: sessionVersion,
    exp: Math.floor(expiresAt / 1000),
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: USER_SESSION_TTL_SECONDS,
    expires: new Date(expiresAt),
  });
  cookieStore.set(ADMIN_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: USER_SESSION_TTL_SECONDS,
    expires: new Date(expiresAt),
  });
}

export async function clearUserSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  cookieStore.delete(ADMIN_COOKIE);
}

export async function clearAdminSessionCookie(): Promise<void> {
  await clearUserSessionCookie();
}

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  name?: string | null;
};

export async function authenticateUser(
  email: string,
  password: string
): Promise<
  | { ok: true; user: User }
  | { ok: false; reason: "invalid" | "not_ready" | "db_error" }
> {
  try {
    // 1. Coba cari di tabel `users`
    const result = await pool.query<UserRow>(
      "SELECT id, email, password_hash, role, name FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email.trim()]
    );

    if (result.rows.length === 0) {
      // Fallback cek tabel legacy `admin_users`
      const legacy = await pool.query<{ id: number; email: string; password_hash: string }>(
        "SELECT id, email, password_hash FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1",
        [email.trim()]
      ).catch(() => ({ rows: [] }));

      if (legacy.rows.length > 0 && verifyPassword(password, legacy.rows[0].password_hash)) {
        return {
          ok: true,
          user: {
            id: legacy.rows[0].id,
            email: legacy.rows[0].email,
            role: "admin",
            name: "Administrator",
            created_at: new Date(),
          },
        };
      }

      const count = await pool.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM users");
      return { ok: false, reason: count.rows[0]?.total === "0" ? "not_ready" : "invalid" };
    }

    const user = result.rows[0];
    if (!verifyPassword(password, user.password_hash)) {
      return { ok: false, reason: "invalid" };
    }

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || "tenant",
        name: user.name || null,
        created_at: new Date(),
      },
    };
  } catch (error) {
    console.error("User authentication failed:", error);
    return { ok: false, reason: "db_error" };
  }
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ ok: true; email: string } | { ok: false; reason: "invalid" | "not_ready" | "db_error" }> {
  const auth = await authenticateUser(email, password);
  if (!auth.ok) return auth;
  if (auth.user.role !== "admin") return { ok: false, reason: "invalid" };
  return { ok: true, email: auth.user.email };
}

type AdminRow = {
  id: number;
  email: string;
  password_hash: string;
  session_version: number | null;
};

type AdminAccount = {
  row: AdminRow;
  table: "users" | "admin_users";
};

async function loadAdminAccount(email: string): Promise<AdminAccount | null> {
  try {
    const result = await pool.query<AdminRow>(
      "SELECT id, email, password_hash, session_version FROM users WHERE LOWER(email) = LOWER($1) AND role = 'admin' LIMIT 1",
      [email]
    );
    if (result.rows[0]) {
      return { row: result.rows[0], table: "users" };
    }
  } catch (error) {
    console.error("Admin account lookup failed:", error);
  }

  try {
    const legacy = await pool.query<AdminRow>(
      "SELECT id, email, password_hash, session_version FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    if (legacy.rows[0]) {
      return { row: legacy.rows[0], table: "admin_users" };
    }
  } catch (error) {
    console.error("Legacy admin account lookup failed:", error);
  }

  return null;
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
    const account = await loadAdminAccount(email);
    if (!account) return { ok: false, reason: "not_found" };

    const { row, table } = account;
    if (Number(row.session_version ?? 1) !== sessionVersion) {
      return { ok: false, reason: "session_changed" };
    }
    if (!verifyPassword(currentPassword, row.password_hash)) {
      return { ok: false, reason: "invalid_password" };
    }

    const newHash = hashPassword(newPassword);
    const updated = await pool.query<{ session_version: number }>(
      `UPDATE ${table}
       SET password_hash = $1, session_version = session_version + 1
       WHERE id = $2 AND session_version = $3
       RETURNING session_version`,
      [newHash, row.id, sessionVersion]
    );

    if (!updated.rows[0]) {
      return { ok: false, reason: "session_changed" };
    }

    const nextVersion = Number(updated.rows[0].session_version);

    // Jaga agar akun legacy `admin_users` tetap sinkron untuk fallback login.
    if (table === "users") {
      await pool.query(
        `UPDATE admin_users
         SET password_hash = $1, session_version = $2
         WHERE LOWER(email) = LOWER($3)`,
        [newHash, nextVersion, email]
      ).catch(() => {});
    }

    return { ok: true, sessionVersion: nextVersion };
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
    const account = await loadAdminAccount(email);
    if (!account) return { ok: false, reason: "session_changed" };

    const { row, table } = account;
    const result = await pool.query<{ session_version: number }>(
      `UPDATE ${table}
       SET session_version = session_version + 1
       WHERE id = $1 AND session_version = $2
       RETURNING session_version`,
      [row.id, sessionVersion]
    );

    if (!result.rows[0]) return { ok: false, reason: "session_changed" };

    const nextVersion = Number(result.rows[0].session_version);

    if (table === "users") {
      await pool.query(
        `UPDATE admin_users
         SET session_version = $1
         WHERE LOWER(email) = LOWER($2)`,
        [nextVersion, email]
      ).catch(() => {});
    }

    return { ok: true, sessionVersion: nextVersion };
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
