import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";

/**
 * Pure session/token helpers shared by Server Components, Route Handlers and
 * Proxy. Nothing here reads cookies or the database so it is safe to import
 * from `proxy.ts`.
 */

export const ADMIN_COOKIE = "admin_session";
export const HOST_COOKIE = "host_session";

export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const HOST_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type AdminSession = {
  role: "admin";
  sub: string;
  ver: number;
  exp: number;
};

export type HostSession = {
  role: "host";
  slug: string;
  ver: number;
  exp: number;
};

export type SessionPayload = AdminSession | HostSession;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET belum diatur atau terlalu pendek. Tambahkan AUTH_SECRET minimal 32 karakter di environment."
    );
  }
  return secret;
}

function encode(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

export function signSession(payload: SessionPayload): string {
  const body = encode(JSON.stringify(payload));
  const signature = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifySession<T extends SessionPayload = SessionPayload>(
  token: string | undefined | null
): T | null {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!body || !signature) return null;

  let expected: string;
  try {
    expected = createHmac("sha256", getSecret()).update(body).digest("base64url");
  } catch {
    return null;
  }

  const givenBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    givenBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(givenBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    if (!payload || typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/** Constant-time comparison for host access tokens. */
export function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export const HOST_TOKEN_PATTERN = /^[a-z0-9][a-z0-9_-]{5,31}$/;

export function normalizeHostToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

export function isValidHostToken(value: string): boolean {
  return HOST_TOKEN_PATTERN.test(value);
}

const TOKEN_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** Generate a readable, unguessable host token. */
export function generateHostToken(length = 10): string {
  const bytes = randomBytes(length);
  let token = "";
  for (let i = 0; i < length; i += 1) {
    token += TOKEN_ALPHABET[bytes[i] % TOKEN_ALPHABET.length];
  }
  return token;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const [, salt, hash] = parts;
  try {
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Best-effort in-memory rate limiter. It protects a single server instance;
 * for multi-instance deployments put a shared limiter in front of the app.
 */
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= limit;
}

/** Reject cross-site mutations. Same-origin requests without Origin are allowed. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    if (new URL(origin).host === host) return true;
  } catch {
    return false;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      return new URL(origin).origin === new URL(siteUrl).origin;
    } catch {
      return false;
    }
  }

  return false;
}
