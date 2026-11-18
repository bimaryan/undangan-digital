import { NextRequest, NextResponse } from "next/server";
import {
  getClientIp,
  setHostSessionCookie,
  verifyHostTokenForSlug,
} from "@/lib/auth";
import { isSameOrigin, normalizeHostToken, rateLimit } from "@/lib/session";

/**
 * Magic link dari admin: tukar ?token= menjadi cookie httpOnly lalu redirect
 * ke URL bersih. Cookie hanya bisa diubah dari Route Handler.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim() || "";
  const token = normalizeHostToken(req.nextUrl.searchParams.get("token") || "");

  if (!slug) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (!rateLimit(`host-link:${getClientIp(req)}`, 20, 60_000)) {
    return NextResponse.redirect(new URL(`/admin/u/${encodeURIComponent(slug)}/akses?error=limit`, req.url));
  }

  const result = await verifyHostTokenForSlug(slug, token);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/admin/u/${encodeURIComponent(slug)}/akses?error=token`, req.url));
  }

  await setHostSessionCookie(slug, result.tokenVersion);
  return NextResponse.redirect(new URL(`/admin/u/${encodeURIComponent(slug)}`, req.url));
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(`host:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 1 menit." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const token = normalizeHostToken(typeof body?.token === "string" ? body.token : "");

  if (!slug || !token) {
    return NextResponse.json({ error: "Slug dan token wajib diisi." }, { status: 400 });
  }

  const result = await verifyHostTokenForSlug(slug, token);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Token akses tidak sesuai. Periksa kembali tautan dari admin." },
      { status: 401 }
    );
  }

  await setHostSessionCookie(slug, result.tokenVersion);
  return NextResponse.json({ ok: true, redirect: `/admin/u/${encodeURIComponent(slug)}` });
}
