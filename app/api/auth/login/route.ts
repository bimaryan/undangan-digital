import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, getClientIp, setAdminSessionCookie } from "@/lib/auth";
import { isSameOrigin, rateLimit } from "@/lib/session";

function safeNextPath(value: unknown): string {
  const next = typeof value === "string" ? value : "";
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "/admin";
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
  const next = safeNextPath(body?.next);

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const result = await authenticateAdmin(email, password);

  if (!result.ok) {
    if (result.reason === "not_ready") {
      return NextResponse.json(
        {
          error: "Belum ada akun admin di database.",
          detail: "Jalankan `npm run create-admin` terlebih dahulu untuk membuat akun admin.",
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
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  await setAdminSessionCookie(result.email, result.sessionVersion);
  return NextResponse.json({ ok: true, redirect: next });
}
