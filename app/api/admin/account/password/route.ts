import { NextRequest, NextResponse } from "next/server";
import {
  changeAdminPassword,
  getAdminSession,
  getClientIp,
  setAdminSessionCookie,
} from "@/lib/auth";
import { isSameOrigin, rateLimit } from "@/lib/session";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(`admin-password:${ip}`, 5, 5 * 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 5 menit." },
      { status: 429 }
    );
  }

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sesi tidak valid. Silakan login ulang." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
  const confirmPassword =
    typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "Semua kolom password wajib diisi." },
      { status: 400 }
    );
  }
  if (newPassword.length < 12) {
    return NextResponse.json(
      { error: "Password baru minimal 12 karakter." },
      { status: 400 }
    );
  }
  if (newPassword.length > 128) {
    return NextResponse.json(
      { error: "Password baru maksimal 128 karakter." },
      { status: 400 }
    );
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "Konfirmasi password baru tidak cocok." },
      { status: 400 }
    );
  }
  if (newPassword === currentPassword) {
    return NextResponse.json(
      { error: "Password baru harus berbeda dari password saat ini." },
      { status: 400 }
    );
  }

  const result = await changeAdminPassword(
    session.sub,
    session.ver,
    currentPassword,
    newPassword
  );

  if (!result.ok) {
    if (result.reason === "invalid_password") {
      return NextResponse.json({ error: "Password saat ini salah." }, { status: 400 });
    }
    if (result.reason === "session_changed" || result.reason === "not_found") {
      return NextResponse.json(
        { error: "Sesi berubah. Silakan login ulang." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Password gagal diubah. Coba lagi nanti." },
      { status: 500 }
    );
  }

  // Perangkat ini tetap masuk dengan versi sesi baru; cookie versi lama
  // (termasuk di perangkat lain) otomatis ditolak.
  await setAdminSessionCookie(session.sub, result.sessionVersion);

  return NextResponse.json({
    ok: true,
    message: "Password berhasil diubah. Semua perangkat lain telah dikeluarkan.",
  });
}
