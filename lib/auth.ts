import { cookies } from "next/headers";
import pool from "./db";
import {
  AUTH_COOKIE,
  ADMIN_COOKIE,
  USER_SESSION_TTL_SECONDS,
  type AdminSession,
  type TenantSession,
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

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getUserSession();
  return session?.role === "admin" ? session : null;
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
  const payload = {
    role: user.role,
    sub: user.email,
    userId: user.id,
    name: user.name || undefined,
    exp: Math.floor(expiresAt / 1000),
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

export async function setAdminSessionCookie(email: string, userId = 1): Promise<void> {
  await setUserSessionCookie({ id: userId, email, role: "admin", name: "Administrator" });
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

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
