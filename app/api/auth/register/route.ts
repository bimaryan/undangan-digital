import { NextRequest, NextResponse } from "next/server";
import { getClientIp, setUserSessionCookie } from "@/lib/auth";
import { createTenantUser, emailExists } from "@/lib/undangan";
import { isSameOrigin, rateLimit } from "@/lib/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(`register:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak pendaftaran. Coba lagi beberapa menit lagi." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nama, email, dan kata sandi wajib diisi." },
      { status: 400 }
    );
  }

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json(
      { error: "Nama harus terdiri dari 2–80 karakter." },
      { status: 400 }
    );
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Kata sandi minimal 8 karakter." },
      { status: 400 }
    );
  }

  if (password.length > 128) {
    return NextResponse.json(
      { error: "Kata sandi maksimal 128 karakter." },
      { status: 400 }
    );
  }

  try {
    if (await emailExists(email)) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }

    const tenant = await createTenantUser(email, password, name);

    await setUserSessionCookie({
      id: tenant.id,
      email: tenant.email,
      role: "tenant",
      name: tenant.name,
    });

    return NextResponse.json({ ok: true, redirect: "/dashboard" });
  } catch (err: unknown) {
    console.error("Register error:", err);
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Pendaftaran gagal. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
