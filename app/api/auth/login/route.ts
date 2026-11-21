import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, getClientIp, setUserSessionCookie } from "@/lib/auth";
import { isSameOrigin, rateLimit } from "@/lib/session";

function safeNextPath(value: unknown, defaultPath: string): string {
  const next = typeof value === "string" ? value : "";
  if (
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/login") &&
    !next.startsWith("/admin/login")
  ) {
    return next;
  }
  return defaultPath;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(`login:${ip}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi dalam 1 menit." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const result = await authenticateUser(email, password);

  if (!result.ok) {
    if (result.reason === "not_ready") {
      return NextResponse.json(
        {
          error: "Belum ada akun terdaftar di database.",
          detail: "Jalankan `npm run create-admin` terlebih dahulu untuk membuat akun admin pertama.",
        },
        { status: 503 }
      );
    }
    if (result.reason === "db_error") {
      return NextResponse.json(
        { error: "Database tidak dapat diakses. Coba lagi nanti." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }

  await setUserSessionCookie(result.user);

  const defaultRedirect = result.user.role === "admin" ? "/admin" : "/dashboard";
  const redirect = safeNextPath(body?.next, defaultRedirect);

  return NextResponse.json({
    ok: true,
    role: result.user.role,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    },
    redirect,
  });
}
