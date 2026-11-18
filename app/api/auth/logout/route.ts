import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionCookie, clearHostSessionCookie } from "@/lib/auth";
import { isSameOrigin } from "@/lib/session";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  await clearAdminSessionCookie();
  await clearHostSessionCookie();
  return NextResponse.json({ ok: true });
}
