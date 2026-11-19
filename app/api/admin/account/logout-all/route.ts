import { NextRequest, NextResponse } from "next/server";
import {
  clearAdminSessionCookie,
  getAdminSession,
  rotateAdminSessionVersion,
} from "@/lib/auth";
import { isSameOrigin } from "@/lib/session";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  const session = await getAdminSession();
  if (!session) {
    // Cookie yang sudah tidak valid tetap dibersihkan.
    await clearAdminSessionCookie();
    return NextResponse.json({ ok: true });
  }

  const result = await rotateAdminSessionVersion(session.sub, session.ver);
  if (!result.ok && result.reason === "db_error") {
    return NextResponse.json(
      { error: "Gagal mengakhiri sesi. Coba lagi nanti." },
      { status: 500 }
    );
  }

  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
